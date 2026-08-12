import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory, extension) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(target, extension)));
    else if (!extension || target.endsWith(extension)) files.push(target);
  }
  return files;
}

function resolveLocalReference(reference) {
  const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (clean === "/") return path.join(output, "index.html");

  const target = path.join(output, clean.replace(/^\/+/, ""));
  return path.extname(target) ? target : path.join(target, "index.html");
}

async function validateLinks() {
  const missing = [];
  const htmlFiles = await walk(output, ".html");

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const references = html.matchAll(/(?:href|src)=["'](\/[^"']*)["']/g);

    for (const [, reference] of references) {
      if (reference.startsWith("//") || reference.startsWith("/#")) continue;
      const target = resolveLocalReference(reference);
      if (!(await exists(target))) {
        missing.push(`${path.relative(root, file)} -> ${reference}`);
      }
    }
  }

  if (missing.length) {
    throw new Error(`Missing local files:\n${missing.join("\n")}`);
  }

  return htmlFiles.length;
}

export async function build() {
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  await cp(path.join(root, "src", "pages"), output, { recursive: true });
  await cp(path.join(root, "src", "styles"), path.join(output, "styles"), { recursive: true });
  await cp(path.join(root, "src", "scripts"), path.join(output, "scripts"), { recursive: true });
  await cp(path.join(root, "assets", "img"), path.join(output, "assets", "img"), { recursive: true });

  for (const file of ["favicon.svg", "file.svg", "globe.svg", "window.svg", "og.png", "og-en.png", "og-fab.png"]) {
    const source = path.join(root, file);
    if (await exists(source)) await copyFile(source, path.join(output, file));
  }

  await writeFile(path.join(output, ".nojekyll"), "", "utf8");
  const pageCount = await validateLinks();
  console.log(`Built ${pageCount} pages in dist/.`);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await build();
}
