// Static build: copies src/ → dist/ and resolves <!-- @include name --> partials.
// Output is plain HTML/CSS/JS so it deploys to Vercel as-is and ports to Webflow cleanly.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const src = join(root, "src");
const dist = join(root, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const dir of ["css", "js", "assets"]) cpSync(join(src, dir), join(dist, dir), { recursive: true });

const partial = (name) => readFileSync(join(src, "partials", `${name}.html`), "utf8").trim();
const render = (html) => html.replace(/<!--\s*@include\s+([\w-]+)\s*-->/g, (_, name) => partial(name));

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : [];
});

const pagesDir = join(src, "pages");
for (const file of walk(pagesDir)) {
  const out = join(dist, relative(pagesDir, file));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(readFileSync(file, "utf8")));
  console.log("built", relative(root, out));
}
