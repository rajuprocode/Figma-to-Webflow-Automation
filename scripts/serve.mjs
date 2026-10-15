// Tiny local preview server for dist/ with Vercel-style clean URLs.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const dist = new URL("../dist", import.meta.url).pathname;
const port = Number(process.env.PORT) || 4321;
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webp": "image/webp", ".mp4": "video/mp4" };

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const candidates = [join(dist, path), join(dist, path + ".html"), join(dist, path, "index.html")];
  const file = candidates.find((f) => existsSync(f) && statSync(f).isFile());
  if (!file) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`MX3 preview on http://localhost:${port}`));
