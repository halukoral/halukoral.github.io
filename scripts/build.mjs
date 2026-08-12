import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const supportedCatImageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

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

function parseParagraphs(block) {
  return block
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map(paragraph => paragraph.replace(/\r?\n/g, " ").trim())
    .filter(Boolean);
}

function parseCatProfiles(markdown) {
  const profiles = markdown
    .split(/^## /m)
    .slice(1)
    .map(section => {
      const newline = section.indexOf("\n");
      const heading = section.slice(0, newline).trim();
      const body = section.slice(newline + 1);
      const headingMatch = heading.match(/^(.+) \(Crew (\d{2})\)$/);
      if (!headingMatch) throw new Error(`Invalid cat profile heading: ${heading}`);

      const englishMarker = "### English";
      const turkishMarker = "### Türkçe";
      const englishStart = body.indexOf(englishMarker);
      const turkishStart = body.indexOf(turkishMarker);
      if (englishStart < 0 || turkishStart < 0 || turkishStart < englishStart) {
        throw new Error(`Missing language sections for Crew ${headingMatch[2]}`);
      }

      const en = parseParagraphs(body.slice(englishStart + englishMarker.length, turkishStart));
      const tr = parseParagraphs(body.slice(turkishStart + turkishMarker.length));
      if (!en.length || !tr.length) throw new Error(`Empty language section for Crew ${headingMatch[2]}`);

      return {
        crew: headingMatch[2],
        name: headingMatch[1],
        paragraphs: { en, tr }
      };
    });

  const crewIds = profiles.map(profile => profile.crew).join(",");
  if (crewIds !== "01,02,03,04,05,06") {
    throw new Error(`Expected Crew 01–06 in CAT_PROFILES.md, received: ${crewIds}`);
  }

  return profiles;
}

async function attachCatProfileImages(profiles) {
  const profilesDirectory = path.join(root, "assets", "img", "cats", "profiles");

  return Promise.all(profiles.map(async profile => {
    const folderName = `crew-${profile.crew}`;
    const folder = path.join(profilesDirectory, folderName);
    const images = (await readdir(folder, { withFileTypes: true }))
      .filter(entry => entry.isFile() && supportedCatImageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((left, right) => left.localeCompare(right, "en", { numeric: true, sensitivity: "base" }))
      .map(fileName => ({
        src: `/assets/img/cats/profiles/${folderName}/${encodeURIComponent(fileName)}`,
        alt: profile.name
      }));

    if (!images.length) throw new Error(`No profile images found in ${path.relative(root, folder)}`);
    return { ...profile, images };
  }));
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
  await rm(output, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  await mkdir(output, { recursive: true });

  await cp(path.join(root, "src", "pages"), output, { recursive: true });
  await cp(path.join(root, "src", "styles"), path.join(output, "styles"), { recursive: true });
  await cp(path.join(root, "src", "scripts"), path.join(output, "scripts"), { recursive: true });
  await cp(path.join(root, "assets", "img"), path.join(output, "assets", "img"), { recursive: true });

  const catProfiles = await attachCatProfileImages(
    parseCatProfiles(await readFile(path.join(root, "CAT_PROFILES.md"), "utf8"))
  );
  const catProfileContent = `window.CAT_PROFILE_CONTENT = ${JSON.stringify(catProfiles, null, 2)};\n`;
  const catProfileVersion = createHash("sha256").update(catProfileContent).digest("hex").slice(0, 12);
  await writeFile(
    path.join(output, "scripts", "cat-profile-content.js"),
    catProfileContent,
    "utf8"
  );

  const catsPage = path.join(output, "cats", "index.html");
  const catsHtml = await readFile(catsPage, "utf8");
  await writeFile(
    catsPage,
    catsHtml.replace(
      "/scripts/cat-profile-content.js",
      `/scripts/cat-profile-content.js?v=${catProfileVersion}`
    ),
    "utf8"
  );

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
