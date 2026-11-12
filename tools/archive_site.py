#!/usr/bin/env python3
"""Read-only archiver for a public WordPress site (default: elementiran.com).

Sends GET requests only. Discovers content through robots.txt, XML sitemaps,
the WordPress REST API, an open uploads directory listing (if any) and a full
same-site link crawl, then saves every page and every referenced file.

    python3 tools/archive_site.py              # full run
    python3 tools/archive_site.py --selftest   # offline logic check

Output (relative to --out, default: repository root):
    archive/pages/      raw HTML + extracted text of every page
    archive/assets/     original files, original paths and filenames kept
    archive/metadata/   robots.txt, sitemaps, raw REST API JSON
    migration/          page-inventory.csv, media-inventory.csv,
                        missing-assets.md, extraction-report.md

Python 3.8+, standard library only.
"""
import argparse, csv, hashlib, json, re, struct, time, urllib.error, urllib.request
from collections import Counter, deque
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, unquote, urlencode, urljoin, urlsplit, urlunsplit

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
EXT = (r"jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?|pdf|docx?|xlsx?|pptx?|csv|txt|zip|rar|7z|dwg|dxf|"
       r"mp4|webm|mov|avi|mkv|mp3|wav|ogg|woff2?|ttf|otf|eot|css")
ASSET_PATH = re.compile(r"\.(%s)$" % EXT, re.I)
# Catch-all for file URLs inside scripts/JSON/CSS, including JSON-escaped slashes.
RAW_URL = re.compile(r"""https?:\\?/\\?/[^\s"'<>()\\]+(?:\\?/[^\s"'<>()\\]+)*\.(?:%s)(?![\w.])""" % EXT, re.I)
CSS_URL = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""", re.I)
SKIP = re.compile(r"/wp-admin|wp-login\.php|xmlrpc\.php|/feed/?$|replytocom=|add-to-cart=|/wp-json/oembed|[?&]share=", re.I)
SIZED = re.compile(r"-(?:\d+x\d+|scaled)(?=\.\w+$)")  # WordPress thumbnail / downscaled suffix
BLOCK = {"p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "section", "article", "td", "th"}


def norm(url, base=None):
    """Absolute, fragment-free, percent-encoded URL (Persian paths included), or None."""
    url = (url or "").strip().replace("\\/", "/")
    if base:
        url = urljoin(base, url)
    s = urlsplit(url)
    if s.scheme not in ("http", "https") or not s.netloc:
        return None
    path = quote(unquote(s.path), safe="/%:@&=+$,;~*'()!") or "/"
    return urlunsplit((s.scheme, s.netloc.lower(), path, quote(s.query, safe="=&%+:/,;~*'()!"), ""))


def site_of(url):
    return urlsplit(url).netloc.lower().split(":")[0].removeprefix("www.") if hasattr(str, "removeprefix") \
        else re.sub(r"^www\.", "", urlsplit(url).netloc.lower().split(":")[0])


class Harvest(HTMLParser):
    """Collects links, file references, text and SEO metadata from one HTML document."""

    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base, self.links, self.assets, self.embeds = base, set(), set(), set()
        self.text, self.meta, self.h1, self._skip, self._cap = [], {}, [], 0, None

    def _asset(self, v):
        u = norm(v, self.base)
        if u and not v.startswith("data:"):
            self.assets.add(u)

    def handle_starttag(self, tag, attrs):
        a = {k: v for k, v in attrs if v}
        if tag in ("script", "style", "noscript", "template"):
            self._skip += 1
        if tag in BLOCK:
            self.text.append("\n")
        if tag in ("title", "h1"):
            self._cap = (tag, [])
        if tag == "html" and "lang" in a:
            self.meta["lang"] = a["lang"]
        if tag in ("a", "area") and "href" in a:
            u = norm(a["href"], self.base)
            if u:
                self.links.add(u)
        if tag == "iframe" and "src" in a:
            self.embeds.add(a["src"])
        if tag == "link" and "href" in a:
            rel = a.get("rel", "").lower()
            if rel == "canonical":
                self.meta["canonical"] = a["href"]
            elif any(r in rel for r in ("stylesheet", "icon", "preload", "image_src")):
                self._asset(a["href"])
        if tag == "meta":
            name, content = (a.get("name") or a.get("property") or "").lower(), a.get("content", "")
            if name in ("description", "robots", "keywords", "og:title", "og:description"):
                self.meta[name] = content
            if name in ("og:image", "og:image:secure_url", "twitter:image", "og:video"):
                self._asset(content)
        for k, v in a.items():
            if k in ("srcset", "data-srcset", "imagesrcset"):
                for part in v.split(","):
                    if part.strip():
                        self._asset(part.strip().split()[0])
            elif k == "style":
                for m in CSS_URL.findall(v):
                    self._asset(m)
            elif k in ("src", "poster") and tag != "iframe" and tag != "script":
                self._asset(v)
            elif k.startswith("data-") and ASSET_PATH.search(v.split("?")[0]):
                self._asset(v)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "template") and self._skip:
            self._skip -= 1
        if self._cap and self._cap[0] == tag:
            val = " ".join("".join(self._cap[1]).split())
            if tag == "title":
                self.meta.setdefault("title", val)
            elif val:
                self.h1.append(val)
            self._cap = None

    def handle_data(self, data):
        if self._cap:
            self._cap[1].append(data)
        if not self._skip:
            self.text.append(data)


def harvest(html, base):
    h = Harvest(base)
    try:
        h.feed(html)
    except Exception:  # malformed markup: keep whatever was parsed, raw regex below still runs
        pass
    for m in RAW_URL.findall(html):
        u = norm(m)
        if u:
            h.assets.add(u)
    for block in re.findall(r"<style[^>]*>(.*?)</style>", html, re.S | re.I):
        for m in CSS_URL.findall(block):
            h._asset(m)
    lines = (" ".join(l.split()) for l in "".join(h.text).split("\n"))
    h.plain = "\n".join(l for l in lines if l)
    return h


def image_size(b):
    """(width, height) for PNG/GIF/JPEG/WebP bytes, else ('', '')."""
    try:
        if b[:8] == b"\x89PNG\r\n\x1a\n":
            return struct.unpack(">II", b[16:24])
        if b[:6] in (b"GIF87a", b"GIF89a"):
            return struct.unpack("<HH", b[6:10])
        if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
            if b[12:16] == b"VP8X":
                return (int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1)
            if b[12:16] == b"VP8 ":
                w, h = struct.unpack("<HH", b[26:30])
                return (w & 0x3FFF, h & 0x3FFF)
        if b[:2] == b"\xff\xd8":
            i = 2
            while i + 9 < len(b):
                if b[i] != 0xFF:
                    i += 1
                    continue
                m = b[i + 1]
                if 0xC0 <= m <= 0xCF and m not in (0xC4, 0xC8, 0xCC):
                    h, w = struct.unpack(">HH", b[i + 5:i + 9])
                    return (w, h)
                i += 2 + (0 if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7 else struct.unpack(">H", b[i + 2:i + 4])[0])
    except Exception:
        pass
    return ("", "")


class Archiver:
    def __init__(self, base, out, delay, limit):
        self.base = norm(base).rstrip("/")
        self.site, self.out, self.delay, self.limit = site_of(self.base), Path(out), delay, limit
        self.queue, self.seen = deque(), set()
        self.pages, self.media, self.missing, self.hashes = [], [], [], {}
        self.wp_type, self.rest, self.notes = {}, {}, []

    # -- plumbing ---------------------------------------------------------
    def same_site(self, url):
        return site_of(url) == self.site

    def canon(self, url):
        """Same-site URLs are fetched from the base origin (http/https, www/non-www unified)."""
        if self.same_site(url):
            s, b = urlsplit(url), urlsplit(self.base)
            return urlunsplit((b.scheme, b.netloc, s.path, s.query, ""))
        return url

    def add(self, url, source, kind):
        url = norm(url)
        if not url or SKIP.search(url):
            return
        url = self.canon(url)
        if kind == "page" and not self.same_site(url):
            return  # outbound link, not site content
        if url not in self.seen:
            self.seen.add(url)
            self.queue.append((url, source, kind))
        m = SIZED.search(url)
        if m and kind == "asset":  # also try the full-size original behind a thumbnail
            self.add(SIZED.sub("", url), source, "asset")

    def get(self, url, tries=3):
        """-> (status, content_type, body, headers) ; status 0 means network failure."""
        err = ""
        for n in range(tries):
            time.sleep(self.delay if n == 0 else 2 * n)
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
                with urllib.request.urlopen(req, timeout=90) as r:
                    return r.status, r.headers.get_content_type(), r.read(), r.headers
            except urllib.error.HTTPError as e:
                if e.code < 500 and e.code != 429:
                    return e.code, "", b"", e.headers
                err = "HTTP %s" % e.code
            except Exception as e:
                err = "%s: %s" % (type(e).__name__, e)
        return 0, err, b"", {}

    def write(self, rel, data):
        p = self.out / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(data if isinstance(data, bytes) else data.encode("utf-8"))
        return rel

    @staticmethod
    def local_name(url):
        s = urlsplit(url)
        path = unquote(s.path).strip("/") or "index"
        if s.path.endswith("/") and path != "index":
            path += "/index"
        path = "/".join(re.sub(r'[<>:"|?*\\]', "_", part)[:120] for part in path.split("/") if part not in ("", ".", ".."))
        return path + ("_q" + hashlib.md5(s.query.encode()).hexdigest()[:8] if s.query else "")

    # -- discovery --------------------------------------------------------
    def sitemaps(self):
        todo, done = deque(self.base + p for p in ("/wp-sitemap.xml", "/sitemap.xml", "/sitemap_index.xml")), set()
        status, _, body, _ = self.get(self.base + "/robots.txt")
        if status == 200:
            self.write("archive/metadata/robots.txt", body)
            todo.extend(re.findall(r"(?im)^sitemap:\s*(\S+)", body.decode("utf-8", "replace")))
        else:
            self.notes.append("robots.txt: HTTP %s" % status)
        while todo:
            u = self.canon(norm(todo.popleft()) or "")
            if not u or u in done:
                continue
            done.add(u)
            status, _, body, _ = self.get(u)
            if status != 200 or b"<loc" not in body:
                continue
            self.write("archive/metadata/sitemaps/" + self.local_name(u), body)
            locs = re.findall(r"<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</loc>", body.decode("utf-8", "replace"), re.S)
            if b"<sitemapindex" in body:
                todo.extend(locs)
            else:
                for loc in locs:
                    self.add(loc.replace("&amp;", "&"), u, "page")
                for img in re.findall(r"<image:loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*</image:loc>", body.decode("utf-8", "replace"), re.S):
                    self.add(img.replace("&amp;", "&"), u, "asset")
        self.notes.append("Sitemaps read: %d" % sum(1 for u in done if (self.out / "archive/metadata/sitemaps" / self.local_name(u)).exists()))

    def rest_api(self):
        def api(route, **params):
            for root in (self.base + "/wp-json" + route + ("?" + urlencode(params) if params else ""),
                         self.base + "/?" + urlencode(dict(rest_route=route, **params))):
                status, ctype, body, headers = self.get(root, tries=2)
                if status == 200 and "json" in ctype:
                    try:
                        return json.loads(body), headers
                    except ValueError:
                        pass
            return None, {}

        index, _ = api("/")
        if index is None:
            self.notes.append("WordPress REST API: NOT reachable (disabled or blocked) - inventory relies on sitemap + crawl only")
            return
        self.write("archive/metadata/rest/index.json", json.dumps(index, ensure_ascii=False, indent=1))
        self.notes.append("WordPress REST API: reachable, namespaces: " + ", ".join(index.get("namespaces", [])))
        collections = {"comments": "/wp/v2/comments", "menus": "/wp/v2/menus", "menu-items": "/wp/v2/menu-items"}
        for kind in ("types", "taxonomies"):
            data, _ = api("/wp/v2/" + kind)
            if isinstance(data, dict):
                self.write("archive/metadata/rest/%s.json" % kind, json.dumps(data, ensure_ascii=False, indent=1))
                for slug, t in data.items():
                    collections[t.get("rest_base", slug)] = "/%s/%s" % (t.get("rest_namespace", "wp/v2"), t.get("rest_base", slug))
        for name, route in sorted(collections.items()):
            items, page, total = [], 1, None
            while True:
                data, headers = api(route, per_page=100, page=page)
                if not isinstance(data, list) or not data:
                    break
                total = headers.get("X-WP-Total", total)
                items += data
                if len(data) < 100:
                    break
                page += 1
            if not items:
                continue
            self.rest[name] = (len(items), total)
            self.write("archive/metadata/rest/%s.json" % name, json.dumps(items, ensure_ascii=False, indent=1))
            for it in items:
                if not isinstance(it, dict):
                    continue
                link = it.get("link")
                if link and name not in ("menu-items",):
                    self.add(link, "rest:" + name, "page")
                    self.wp_type[self.canon(norm(link) or "")] = it.get("type") or it.get("taxonomy") or name
                if it.get("source_url"):
                    self.add(it["source_url"], "rest:" + name, "asset")
                blob = json.dumps(it, ensure_ascii=False)
                for field in ("content", "excerpt", "description"):
                    v = it.get(field)
                    blob += " " + (v.get("rendered", "") if isinstance(v, dict) else v if isinstance(v, str) else "")
                for u in harvest(blob, link or self.base + "/").assets:
                    self.add(u, "rest:" + name, "asset")

    # -- crawl ------------------------------------------------------------
    def crawl(self):
        n = 0
        while self.queue and n < self.limit:
            url, source, kind = self.queue.popleft()
            n += 1
            status, ctype, body, _ = self.get(url)
            if n % 25 == 0:
                print("  %d fetched, %d queued" % (n, len(self.queue)), flush=True)
            if status != 200:
                # A guessed full-size original that does not exist is not a missing asset.
                guessed = kind == "asset" and SIZED.sub("", url) == url and any(SIZED.sub("", u) == url and u != url for u in self.seen)
                if not (guessed and status == 404):
                    self.missing.append((url, kind, source, "HTTP %s" % status if status else ctype))
                continue
            if ctype in ("text/html", "application/xhtml+xml") and self.same_site(url):
                self.page(url, source, body)
            else:
                self.asset(url, source, ctype, body)
        if self.queue:
            self.notes.append("STOPPED EARLY at --limit %d with %d URLs still queued - archive is INCOMPLETE" % (self.limit, len(self.queue)))

    def page(self, url, source, body):
        html = body.decode("utf-8", "replace")
        h = harvest(html, url)
        for u in h.links:
            self.add(u, url, "asset" if ASSET_PATH.search(urlsplit(u).path) else "page")
        for u in h.assets:
            self.add(u, url, "asset")
        name = self.local_name(url).replace("/", "__")
        self.pages.append({
            "url": unquote(url), "title": h.meta.get("title", ""), "wp_type": self.wp_type.get(url, ""),
            "found_via": unquote(source), "local_html": self.write("archive/pages/%s.html" % name, body),
            "local_text": self.write("archive/pages/%s.txt" % name, h.plain),
            "meta_description": h.meta.get("description", ""), "canonical": h.meta.get("canonical", ""),
            "robots": h.meta.get("robots", ""), "h1": " | ".join(h.h1), "words": len(h.plain.split()),
            "file_refs": len(h.assets), "embeds": " ".join(sorted(h.embeds)),
            "bad_encoding": "yes" if "�" in html else "", "sha256": hashlib.sha256(body).hexdigest(),
        })

    def asset(self, url, source, ctype, body):
        digest = hashlib.sha256(body).hexdigest()
        dup = self.hashes.get(digest, "")
        local = dup or self.write("archive/assets/%s/%s" % (urlsplit(url).netloc, self.local_name(url)), body)
        self.hashes.setdefault(digest, local)
        w, h = image_size(body)
        self.media.append({
            "original_url": unquote(url), "original_filename": unquote(urlsplit(url).path).rsplit("/", 1)[-1],
            "local_path": local, "duplicate_of_first_copy": "yes" if dup else "", "content_type": ctype,
            "bytes": len(body), "width": w, "height": h, "sha256": digest, "found_on": unquote(source),
        })
        if ctype == "text/css":
            for m in CSS_URL.findall(body.decode("utf-8", "replace")):
                if not m.startswith("data:"):
                    self.add(norm(m, url) or "", url, "asset")

    # -- output -----------------------------------------------------------
    def report(self):
        def table(rel, rows):
            p = self.out / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            with p.open("w", newline="", encoding="utf-8-sig") as f:  # BOM so Excel shows Persian correctly
                if rows:
                    w = csv.DictWriter(f, fieldnames=list(rows[0]))
                    w.writeheader()
                    w.writerows(rows)

        table("migration/page-inventory.csv", self.pages)
        table("migration/media-inventory.csv", self.media)
        miss = ["# Missing or inaccessible items", "", "Every URL the site references that could not be retrieved.", "",
                "| URL | Kind | Referenced from | Error |", "|---|---|---|---|"]
        miss += ["| %s | %s | %s | %s |" % (unquote(u), k, unquote(s), e) for u, k, s, e in self.missing] or ["| (none) | | | |"]
        self.write("migration/missing-assets.md", "\n".join(miss) + "\n")

        ext = Counter((re.search(r"\.(\w+)$", m["original_filename"]) or [0, "(none)"])[1].lower() for m in self.media)
        docs = [m for m in self.media if re.search(r"\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|dwg|dxf|csv)$", m["original_filename"], re.I)]
        uniq = sum(1 for m in self.media if not m["duplicate_of_first_copy"])
        r = ["# Extraction report", "", "Site: %s  " % self.base, "Run finished: %s" % time.strftime("%Y-%m-%d %H:%M:%S %Z"), "",
             "## Totals", "",
             "- URLs discovered: %d" % len(self.seen),
             "- Pages captured: %d" % len(self.pages),
             "- Files captured: %d (%d unique by SHA-256, %.1f MB)" % (len(self.media), uniq, sum(m["bytes"] for m in self.media if not m["duplicate_of_first_copy"]) / 1e6),
             "- Missing / failed: %d (see missing-assets.md)" % len(self.missing),
             "- Pages with broken text encoding: %d" % sum(1 for p in self.pages if p["bad_encoding"]),
             "", "## Discovery sources", ""] + ["- " + n for n in self.notes]
        r += ["", "## REST API collections (items saved / total reported by WordPress)", ""]
        r += ["- %s: %s / %s" % (k, v[0], v[1] or "?") for k, v in sorted(self.rest.items())] or ["- none"]
        r += ["", "## Pages by WordPress type", ""] + ["- %s: %d" % (k or "(found by crawl only)", v) for k, v in Counter(p["wp_type"] for p in self.pages).most_common()]
        r += ["", "## Files by extension", ""] + ["- .%s: %d" % kv for kv in ext.most_common()]
        r += ["", "## Documents and downloads", ""] + ["- %s (%d bytes)" % (m["original_url"], m["bytes"]) for m in docs] or ["- none found"]
        r += ["", "## Limits of this run", "",
              "- Only publicly reachable content is captured. Drafts, private posts, unattached media-library items that no page links to (when the REST API is closed), form entries and the database itself need a WordPress admin export.",
              "- Content that only appears after user interaction with JavaScript is captured only if its URL occurs in the page source.", ""]
        self.write("migration/extraction-report.md", "\n".join(r))
        print("\n".join(r[5:11]))


def selftest():
    fa = norm("/گرم-کن-ضد-بخار-آینه/#top", "http://www.elementiran.com/a")
    assert fa == "http://www.elementiran.com/%DA%AF%D8%B1%D9%85-%DA%A9%D9%86-%D8%B6%D8%AF-%D8%A8%D8%AE%D8%A7%D8%B1-%D8%A2%DB%8C%D9%86%D9%87/", fa
    assert norm(fa) == fa and norm("mailto:a@b.c") is None and norm("tel:021") is None
    html = ('<html lang="fa"><head><title>تست</title><link rel="canonical" href="/x/"><style>.a{background:url(/bg.jpg)}</style></head>'
            '<body><h1>کابل حرارتی</h1><a href="/p/">p</a><a href="/elementiran.pdf">pdf</a>'
            '<img src="/wp-content/uploads/a-300x200.jpg" srcset="/u/a-768x512.jpg 768w, /u/a.jpg 1200w" data-large_image="/u/big.png">'
            '<div style="background-image:url(\'/hero.webp\')"></div><script>var s={"u":"https:\\/\\/cdn.x.com\\/v\\/film.mp4"}</script></body></html>')
    h = harvest(html, "https://elementiran.com/")
    got = {urlsplit(u).path for u in h.assets}
    assert got == {"/bg.jpg", "/wp-content/uploads/a-300x200.jpg", "/u/a-768x512.jpg", "/u/a.jpg", "/u/big.png", "/hero.webp", "/v/film.mp4"}, got
    assert {urlsplit(u).path for u in h.links} == {"/p/", "/elementiran.pdf"}
    assert h.meta["title"] == "تست" and h.h1 == ["کابل حرارتی"] and "var s" not in h.plain and "کابل حرارتی" in h.plain
    a = Archiver("https://www.elementiran.com", "/nonexistent", 0, 1)
    a.add("http://elementiran.com/wp-content/uploads/a-300x200.jpg", "t", "asset")
    a.add("https://other.example/page/", "t", "page")
    assert [q[0] for q in a.queue] == ["https://www.elementiran.com/wp-content/uploads/a-300x200.jpg",
                                       "https://www.elementiran.com/wp-content/uploads/a.jpg"], a.queue
    png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + struct.pack(">II", 640, 480)
    assert image_size(png) == (640, 480) and image_size(b"junk") == ("", "")
    assert Archiver.local_name("https://x.ir/%DA%A9%D8%A7%D8%A8%D9%84/") == "کابل/index"
    print("selftest ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", default="https://www.elementiran.com")
    ap.add_argument("--out", default=str(Path(__file__).resolve().parent.parent))
    ap.add_argument("--delay", type=float, default=0.3, help="seconds between requests (be polite to the live server)")
    ap.add_argument("--limit", type=int, default=20000, help="maximum number of fetches")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        selftest()
    else:
        a = Archiver(args.url, args.out, args.delay, args.limit)
        for seed in ("/", "/elementiran.pdf", "/wp-content/uploads/"):
            a.add(a.base + seed, "seed", "asset" if seed.endswith(".pdf") else "page")
        print("Reading sitemaps ...", flush=True)
        a.sitemaps()
        print("Reading WordPress REST API ...", flush=True)
        a.rest_api()
        print("Crawling %d seed URLs ..." % len(a.queue), flush=True)
        a.crawl()
        a.report()
