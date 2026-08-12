import { createReadStream } from "node:fs";
import { stat, watch } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const port = Number(process.env.PORT || 8000);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

let building = false;
let pending = false;

async function rebuild() {
  if (building) {
    pending = true;
    return;
  }

  building = true;
  try {
    await build();
  } catch (error) {
    console.error(error.message);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      await rebuild();
    }
  }
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(output, normalized.replace(/^[/\\]+/, ""));
}

await rebuild();

const server = http.createServer(async (request, response) => {
  let target = safePath(request.url || "/");

  try {
    const details = await stat(target);
    if (details.isDirectory()) target = path.join(target, "index.html");
    await stat(target);
  } catch {
    target = path.join(output, "404.html");
    response.statusCode = 404;
  }

  response.setHeader("Content-Type", contentTypes[path.extname(target)] || "application/octet-stream");
  createReadStream(target).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local preview: http://127.0.0.1:${port}`);
});

for (const directory of [path.join(root, "src"), path.join(root, "assets", "img")]) {
  (async () => {
    try {
      for await (const event of watch(directory, { recursive: true })) {
        if (event.filename) await rebuild();
      }
    } catch (error) {
      console.error(`File watcher stopped: ${error.message}`);
    }
  })();
}
