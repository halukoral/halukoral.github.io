// One-time migration helper. Running this again overwrites src/pages and src/styles.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routes = [
  "index.html",
  "cats/index.html",
  "fab/index.html",
  "posts/compass/index.html",
  "posts/laser/index.html",
  "posts/portal/index.html",
  "posts/quest-system/index.html",
  "posts/simple-inventory/index.html",
  "posts/snakey/index.html",
  "posts/tety/index.html",
  "writing/less-but-better/index.html",
  "writing/thinking-with-ai/index.html",
  "writing/turning-curiosity-into-a-system/index.html"
];

const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function formatHtml(source) {
  const protectedBlocks = [];
  let html = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(pre|textarea)\b[\s\S]*?<\/\1>/gi, block => {
      const marker = `__PROTECTED_BLOCK_${protectedBlocks.length}__`;
      protectedBlocks.push(block);
      return marker;
    });

  const tokens = html.match(/<!DOCTYPE[^>]*>|<[^>]+>|[^<]+/gi) || [];
  const lines = [];
  let depth = 0;

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    const closing = token.match(/^<\/([\w-]+)/);
    const opening = token.match(/^<([\w-]+)/);
    if (closing) depth = Math.max(0, depth - 1);

    lines.push(`${"  ".repeat(depth)}${token}`);

    if (opening) {
      const tag = opening[1].toLowerCase();
      const selfClosing = token.endsWith("/>") || voidElements.has(tag);
      if (!selfClosing && !token.includes(`</${tag}>`)) depth += 1;
    }
  }

  html = lines.join("\n");
  protectedBlocks.forEach((block, index) => {
    html = html.replace(`__PROTECTED_BLOCK_${index}__`, block);
  });
  return html;
}

function formatCss(source) {
  let output = "";
  let depth = 0;
  let quote = null;
  let comment = false;

  const line = text => `${"  ".repeat(depth)}${text.trim()}`;
  let buffer = "";

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (comment) {
      buffer += char;
      if (char === "*" && next === "/") {
        buffer += next;
        index += 1;
        comment = false;
      }
      continue;
    }

    if (!quote && char === "/" && next === "*") {
      comment = true;
      buffer += "/*";
      index += 1;
      continue;
    }

    if ((char === "\"" || char === "'") && source[index - 1] !== "\\") {
      quote = quote === char ? null : quote || char;
      buffer += char;
      continue;
    }

    if (quote) {
      buffer += char;
      continue;
    }

    if (char === "{") {
      output += `${line(buffer)} {\n`;
      buffer = "";
      depth += 1;
    } else if (char === ";") {
      if (buffer.trim()) output += `${line(buffer)};\n`;
      buffer = "";
    } else if (char === "}") {
      if (buffer.trim()) output += `${line(buffer)}\n`;
      buffer = "";
      depth = Math.max(0, depth - 1);
      output += `${"  ".repeat(depth)}}\n\n`;
    } else {
      buffer += char;
    }
  }

  if (buffer.trim()) output += `${line(buffer)}\n`;
  return output.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

for (const route of routes) {
  const exported = await readFile(path.join(root, route), "utf8");
  const lang = exported.match(/<html\s+lang=["']([^"']+)/i)?.[1] || "en";
  const head = exported.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
  const title = head.match(/<title>([\s\S]*?)<\/title>/i)?.[0] || "<title>Haluk Oral</title>";
  const metadata = [...head.matchAll(/<meta\b[^>]*>/gi)]
    .map(match => match[0].replace(/charSet=/i, "charset="))
    .filter(tag => !/charset=/i.test(tag) && !/name=["']viewport/i.test(tag));
  const inlineStyles = [...head.matchAll(/<style>([\s\S]*?)<\/style>/gi)]
    .map(match => `<style>\n${formatCss(match[1])}</style>`);
  const main = exported.match(/<main\b[\s\S]*?<\/main>/i)?.[0];

  if (!main) throw new Error(`No <main> found in ${route}`);

  const extraStyles = [];
  if (route === "index.html") extraStyles.push('  <link rel="stylesheet" href="/styles/social-links.css">');
  if (route === "cats/index.html") extraStyles.push('  <link rel="stylesheet" href="/styles/cat-profiles.css">');

  const scripts = route === "cats/index.html"
    ? '\n  <script src="/scripts/cats.js" defer></script>'
    : "";

  const document = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${title}
${metadata.map(tag => `  ${tag}`).join("\n")}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles/site.css">
${extraStyles.join("\n")}${inlineStyles.length ? `\n  ${inlineStyles.join("\n  ")}` : ""}${scripts}
</head>
<body>
${formatHtml(main)}
</body>
</html>
`;

  const target = path.join(root, "src", "pages", route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, document, "utf8");
}

const css = await readFile(path.join(root, "_next", "static", "chunks", "09nydkre8~2n3.css"), "utf8");
await mkdir(path.join(root, "src", "styles"), { recursive: true });
await writeFile(path.join(root, "src", "styles", "site.css"), formatCss(css), "utf8");

for (const file of ["social-links.css", "cat-profiles.css"]) {
  const source = await readFile(path.join(root, "assets", file), "utf8");
  await writeFile(path.join(root, "src", "styles", file), source, "utf8");
}

console.log(`Imported ${routes.length} readable source pages.`);
