"""Upload a video to the Debajo del Prompt YouTube channel (YouTube Data API v3). Standard library only.

  python tools/upload_youtube.py auth                     # one-time: opens the browser, you grant access with the channel's account
  python tools/upload_youtube.py whoami                   # which channel the saved token uploads to
  python tools/upload_youtube.py upload <video.mp4> --title "..." --description-file desc.txt [--tags a,b]
        [--approved UTP-20261105-06 [--publish-at 2026-11-18T22:00:00Z]]
  python tools/upload_youtube.py publish <videoId> --approved UTP-20261105-06 [--publish-at ...]   # make an uploaded video public
  python tools/upload_youtube.py channel --description-file d.txt --banner b.png                  # channel description and banner

Public by default (user, 2026-11-16: "subilo en público siempre, es la gracia del proyecto"; CLAUDE.md rule 1 changed the same day):
- Uploads go PUBLIC, or private + publishAt when --publish-at is given (YouTube publishes it at that time).
- --private uploads a private test. The privacy is always set explicitly.
- --approved <ID> is optional now; when given it is recorded in the log.
- Secrets live in .secrets/ (git-ignored): youtube_client.json (OAuth desktop client, created by the user) and youtube_token.json.
"""
import argparse
import base64
import hashlib
import http.server
import json
import os
import re
import secrets
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECRETS = ROOT / ".secrets"
CLIENT = SECRETS / "youtube_client.json"
TOKEN = SECRETS / "youtube_token.json"
# youtube.upload to upload; youtube to change an uploaded video's privacy and the channel's description and banner
SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube"]


def client():
    d = json.loads(CLIENT.read_text(encoding="utf-8"))
    return d.get("installed") or d.get("web")


def post_form(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"token endpoint HTTP {e.code}: {e.read()[:400].decode(errors='replace')}")


def auth():
    """Installed-app OAuth with PKCE and a loopback redirect: the browser opens, the user approves, the code comes back to localhost."""
    c = client()
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    state = secrets.token_urlsafe(16)
    got = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            if q.get("state", [""])[0] == state:
                got.update({k: v[0] for k, v in q.items()})
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
            self.wfile.write("<h2>Listo. Ya podés cerrar esta pestaña y volver a Claude.</h2>".encode())

        def log_message(self, *a):
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), H)
    redirect = f"http://127.0.0.1:{srv.server_address[1]}"
    url = c["auth_uri"] + "?" + urllib.parse.urlencode({
        "client_id": c["client_id"], "redirect_uri": redirect, "response_type": "code", "scope": " ".join(SCOPES),
        "code_challenge": challenge, "code_challenge_method": "S256", "state": state, "access_type": "offline", "prompt": "consent"})
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    print("Abriendo el navegador para dar permiso...", flush=True)
    webbrowser.open(url)
    t0 = time.time()
    while "code" not in got and "error" not in got and time.time() - t0 < 540:
        time.sleep(0.5)
    srv.shutdown()
    if "code" not in got:
        raise SystemExit(f"no authorization received ({got.get('error', 'timeout')})")
    tok = post_form(c["token_uri"], {"code": got["code"], "client_id": c["client_id"], "client_secret": c["client_secret"],
                                     "redirect_uri": redirect, "grant_type": "authorization_code", "code_verifier": verifier})
    tok["obtained_at"] = int(time.time())
    TOKEN.write_text(json.dumps(tok), encoding="utf-8")
    print("token saved; scopes:", tok.get("scope"))


def access_token():
    if not TOKEN.exists():
        raise SystemExit("no token yet: run `python tools/upload_youtube.py auth` first")
    tok = json.loads(TOKEN.read_text(encoding="utf-8"))
    if time.time() < tok.get("obtained_at", 0) + tok.get("expires_in", 0) - 120:
        return tok["access_token"]
    c = client()
    new = post_form(c["token_uri"], {"client_id": c["client_id"], "client_secret": c["client_secret"],
                                     "refresh_token": tok["refresh_token"], "grant_type": "refresh_token"})
    tok.update(new); tok["obtained_at"] = int(time.time())
    TOKEN.write_text(json.dumps(tok), encoding="utf-8")
    return tok["access_token"]


def api(method, url, body=None, headers=None, raw=None):
    h = {"Authorization": f"Bearer {access_token()}", **(headers or {})}
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    if body is not None and raw is None:
        h["Content-Type"] = "application/json; charset=UTF-8"
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            txt = r.read()
            return r, (json.loads(txt) if txt else {})
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {url.split('?')[0]} -> HTTP {e.code}: {e.read()[:600].decode(errors='replace')}")


def whoami():
    _, d = api("GET", "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true")
    items = d.get("items", [])
    for it in items:
        print(f"channel: {it['snippet']['title']}  id={it['id']}  handle={it['snippet'].get('customUrl', '')}")
    if not items:
        print("no channel on this account")
    return items


def approved(uid):
    p = ROOT / "publishing" / "approvals" / f"{uid}.md"
    if not p.exists():
        return False
    m = re.search(r"^\*\*(Estado|Status):\*\*\s*`?([a-z_]+)`?", p.read_text(encoding="utf-8"), re.M)
    return bool(m and m.group(2) == "approved")


def upload(a):
    video = Path(a.video)
    status = {"privacyStatus": "private", "selfDeclaredMadeForKids": False, "containsSyntheticMedia": a.synthetic}
    status.update({"privacyStatus": "private"} if a.private else public_status(a))
    snippet = {"title": a.title, "description": Path(a.description_file).read_text(encoding="utf-8") if a.description_file else "",
               "categoryId": "28", "defaultLanguage": "es", "defaultAudioLanguage": "es"}  # 28 = Science & Technology
    if a.tags:
        snippet["tags"] = [t.strip() for t in a.tags.split(",") if t.strip()]
    channels = whoami()
    if a.expect_channel and not any(a.expect_channel.lower() in c["snippet"]["title"].lower() for c in channels):
        raise SystemExit(f"refusing: the token is for {[c['snippet']['title'] for c in channels]}, not '{a.expect_channel}'")
    size = video.stat().st_size
    r, _ = api("POST", "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
               body={"snippet": snippet, "status": status},
               headers={"X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
    loc = r.headers["Location"]
    print(f"uploading {video.name} ({size / 1e6:.1f} MB), {status['privacyStatus']}" + (f", scheduled {a.publish_at}" if a.publish_at else ""), flush=True)
    _, d = api("PUT", loc, raw=video.read_bytes(), headers={"Content-Type": "video/mp4"})
    print(f"done: https://youtu.be/{d['id']}  privacy={d['status']['privacyStatus']}  publishAt={d['status'].get('publishAt')}")
    log = ROOT / "publishing" / "upload_log.jsonl"
    with log.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "platform": "youtube", "file": str(video), "id": d["id"],
                            "privacy": d["status"]["privacyStatus"], "publishAt": d["status"].get("publishAt"), "title": a.title}, ensure_ascii=False) + "\n")


def public_status(a):
    """Public now, or private with publishAt (YouTube flips it to public at that time)."""
    return {"privacyStatus": "private", "publishAt": a.publish_at} if a.publish_at else {"privacyStatus": "public"}


def publish(a):
    _, d = api("GET", f"https://www.googleapis.com/youtube/v3/videos?part=status&id={a.video_id}")
    if not d.get("items"):
        raise SystemExit(f"video {a.video_id} not found on this channel")
    st = d["items"][0]["status"]
    st.update(public_status(a))
    _, out = api("PUT", "https://www.googleapis.com/youtube/v3/videos?part=status", body={"id": a.video_id, "status": st})
    print(f"https://youtu.be/{a.video_id}  privacy={out['status']['privacyStatus']}  publishAt={out['status'].get('publishAt')}")
    with (ROOT / "publishing" / "upload_log.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps({"at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "platform": "youtube", "action": "publish", "id": a.video_id,
                            "approved": a.approved, "privacy": out["status"]["privacyStatus"], "publishAt": out["status"].get("publishAt")}) + chr(10))


def channel(a):
    """Channel description (brandingSettings) and banner (channelBanners.insert → bannerExternalUrl)."""
    ch = whoami()[0]
    _, d = api("GET", f"https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&id={ch['id']}")
    b = d["items"][0]["brandingSettings"]
    if a.description_file:
        b.setdefault("channel", {})["description"] = Path(a.description_file).read_text(encoding="utf-8").strip()
    if a.banner:
        _, up = api("POST", "https://www.googleapis.com/upload/youtube/v3/channelBanners/insert?uploadType=media",
                    raw=Path(a.banner).read_bytes(), headers={"Content-Type": "image/png"})
        b.setdefault("image", {})["bannerExternalUrl"] = up["url"]
    _, out = api("PUT", "https://www.googleapis.com/youtube/v3/channels?part=brandingSettings", body={"id": ch["id"], "brandingSettings": b})
    print("channel updated:", out["brandingSettings"]["channel"].get("title"), "| description", len(out["brandingSettings"]["channel"].get("description", "")), "chars",
          "| banner set" if a.banner else "")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("auth"); sp.add_parser("whoami")
    pb = sp.add_parser("publish"); pb.add_argument("video_id"); pb.add_argument("--approved"); pb.add_argument("--publish-at")
    cs = sp.add_parser("channel"); cs.add_argument("--description-file"); cs.add_argument("--banner")
    u = sp.add_parser("upload")
    u.add_argument("video"); u.add_argument("--title", required=True); u.add_argument("--description-file")
    u.add_argument("--tags"); u.add_argument("--publish-at"); u.add_argument("--approved"); u.add_argument("--private", action="store_true")
    u.add_argument("--expect-channel", default="Debajo del Prompt")
    u.add_argument("--synthetic", action="store_true", help="declare altered/synthetic content (off: our videos are animated)")
    a = ap.parse_args()
    {"auth": lambda: auth(), "whoami": lambda: whoami(), "upload": lambda: upload(a), "publish": lambda: publish(a), "channel": lambda: channel(a)}[a.cmd]()


if __name__ == "__main__":
    main()
