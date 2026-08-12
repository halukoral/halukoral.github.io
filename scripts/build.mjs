import { copyFile, cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = process.env.SITE_OUTPUT
  ? path.resolve(process.env.SITE_OUTPUT)
  : path.join(root, "dist");
const supportedCatImageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const siteOrigin = "https://halukoral.github.io";

const seoPages = {
  "/": {
    title: "Haluk Oral — C++ & Unreal Engine Developer",
    description: "C++ and Unreal Engine developer building rendering systems, gameplay tools, and the Hasterza path-traced engine.",
    image: "/og-en.png",
    schemaType: "WebPage",
    lastModified: "2026-08-12",
    keywords: ["C++ developer", "Unreal Engine developer", "game engine", "rendering", "Vulkan"]
  },
  "/fab/": {
    title: "Unreal Engine C++ Gameplay Systems & Tools · Haluk Oral",
    description: "Production-ready Unreal Engine C++ gameplay systems, UI kits, arcade templates, and technical setup guides by Haluk Oral.",
    image: "/og-fab.png",
    schemaType: "CollectionPage",
    lastModified: "2026-08-12",
    keywords: ["Unreal Engine C++", "UE5 gameplay systems", "FAB marketplace", "game development tools"]
  },
  "/cats/": {
    title: "Purrbit: A Cats in Space Browser Game · Haluk Oral",
    description: "Play Purrbit, a fast browser game starring Haluk Oral's six-cat space crew, or meet each cat through their orbital profile.",
    image: "/assets/img/cats/astronaut-cats.png",
    schemaType: "WebPage",
    lastModified: "2026-08-13",
    keywords: ["Haluk Oral", "Purrbit", "cats in space", "browser game"]
  },
  "/writing/less-but-better/": {
    title: "Less, but better · Haluk Oral",
    description: "Simplifying is not about subtraction. It is about deciding what truly matters.",
    image: "/og-en.png",
    schemaType: "BlogPosting",
    datePublished: "2026-07-28",
    dateModified: "2026-07-28",
    dateDisplay: "JUL 28, 2026",
    section: "Essays",
    keywords: ["simplicity", "focus", "intentional design"]
  },
  "/writing/turning-curiosity-into-a-system/": {
    title: "Turning curiosity into a system · Haluk Oral",
    description: "A small way to capture good questions regularly instead of waiting for inspiration.",
    image: "/og-en.png",
    schemaType: "BlogPosting",
    datePublished: "2026-07-14",
    dateModified: "2026-07-14",
    dateDisplay: "JUL 14, 2026",
    section: "Making",
    keywords: ["curiosity", "learning system", "creative process"]
  },
  "/writing/thinking-with-ai/": {
    title: "Thinking with AI · Haluk Oral",
    description: "Moving from an answer machine to a partner that sharpens the way we think.",
    image: "/og-en.png",
    schemaType: "BlogPosting",
    datePublished: "2026-07-02",
    dateModified: "2026-07-02",
    dateDisplay: "JUL 02, 2026",
    section: "Technology",
    keywords: ["thinking with AI", "AI collaboration", "critical thinking"]
  },
  "/posts/quest-system/": {
    title: "Unreal Engine 5 C++ Quest System · Haluk Oral",
    description: "Build and configure a reusable C++ quest system for Unreal Engine 5 with quest givers, objectives, destinations, and a quest log.",
    image: "/assets/img/fab/quest/1.png",
    schemaType: "TechArticle",
    datePublished: "2025-09-02",
    dateModified: "2026-07-18",
    dateDisplay: "Sep 2, 2025",
    modifiedDisplay: "Updated Jul 18, 2026",
    section: "Unreal Engine",
    keywords: ["Unreal Engine 5 quest system", "UE5 C++", "quest log", "FAB marketplace"],
    related: ["/posts/simple-inventory/", "/posts/portal/"]
  },
  "/posts/snakey/": {
    title: "SnakeY: Unreal Engine C++ Arcade Game · Haluk Oral",
    description: "Set up the SnakeY C++ arcade game template in Unreal Engine, including project settings, game mode, exposure, and level setup.",
    image: "/assets/img/fab/arcade/SnakeY/2.png",
    schemaType: "TechArticle",
    datePublished: "2025-09-01",
    dateModified: "2025-09-01",
    dateDisplay: "Sep 1, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine arcade game", "Snake game template", "UE5 C++"],
    related: ["/posts/tety/", "/posts/quest-system/"]
  },
  "/posts/simple-inventory/": {
    title: "Unreal Engine C++ Inventory System · Haluk Oral",
    description: "Configure a customizable Unreal Engine C++ inventory system with item definitions, data assets, collision presets, and inventory chests.",
    image: "/assets/img/fab/inventory/1.png",
    schemaType: "TechArticle",
    datePublished: "2025-08-25",
    dateModified: "2025-08-27",
    dateDisplay: "Aug 25, 2025",
    modifiedDisplay: "Updated Aug 27, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine inventory system", "UE5 C++ inventory", "game inventory"],
    related: ["/posts/quest-system/", "/posts/compass/"]
  },
  "/posts/tety/": {
    title: "TetY: Unreal Engine C++ Arcade Game · Haluk Oral",
    description: "Configure the TetY C++ arcade game template in Unreal Engine, including the grid, blocks, Blueprint classes, data assets, and input.",
    image: "/assets/img/fab/arcade/TetY/1.png",
    schemaType: "TechArticle",
    datePublished: "2025-04-01",
    dateModified: "2025-04-11",
    dateDisplay: "Apr 1, 2025",
    modifiedDisplay: "Updated Apr 11, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine arcade template", "block puzzle game", "UE5 C++"],
    related: ["/posts/snakey/", "/posts/compass/"]
  },
  "/posts/portal/": {
    title: "Unreal Engine C++ Portal System · Haluk Oral",
    description: "Set up a customizable Unreal Engine C++ portal system with clip planes, collision channels, data assets, and character integration.",
    image: "/assets/img/fab/portal/1.png",
    schemaType: "TechArticle",
    datePublished: "2025-04-01",
    dateModified: "2025-04-11",
    dateDisplay: "Apr 1, 2025",
    modifiedDisplay: "Updated Apr 11, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine portal system", "UE5 C++ portal", "scene capture portal"],
    related: ["/posts/laser/", "/posts/quest-system/"]
  },
  "/posts/laser/": {
    title: "Unreal Engine C++ Niagara Laser System · Haluk Oral",
    description: "Configure an Unreal Engine C++ laser system powered by Niagara, with collision channels, emitters, and customizable laser behavior.",
    image: "/assets/img/fab/laser/1.png",
    schemaType: "TechArticle",
    datePublished: "2025-04-01",
    dateModified: "2025-06-03",
    dateDisplay: "Apr 1, 2025",
    modifiedDisplay: "Updated Jun 3, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine laser system", "Niagara laser", "UE5 C++"],
    related: ["/posts/portal/", "/posts/compass/"]
  },
  "/posts/compass/": {
    title: "Unreal Engine C++ Compass System UI Kit · Haluk Oral",
    description: "Configure a customizable Unreal Engine C++ compass system and UI kit with simple and complex widgets, data assets, and Blueprint attributes.",
    image: "/assets/img/fab/compass/0.png",
    schemaType: "TechArticle",
    datePublished: "2025-04-01",
    dateModified: "2025-04-01",
    dateDisplay: "Apr 1, 2025",
    section: "Unreal Engine",
    keywords: ["Unreal Engine compass system", "UE5 compass UI", "C++ UI kit"],
    related: ["/posts/simple-inventory/", "/posts/quest-system/"]
  },
  "/404.html": {
    title: "Page not found · Haluk Oral",
    description: "The requested page could not be found.",
    image: "/og-en.png",
    schemaType: "WebPage",
    noindex: true
  }
};

async function exists(target, attempts = 1) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await stat(target);
      return true;
    } catch {
      if (attempt < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    }
  }
  return false;
}

async function readFileWithRetry(target, encoding = "utf8", attempts = 10) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await readFile(target, encoding);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }
  throw lastError;
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

function pageUrlFromFile(file) {
  const relative = path.relative(output, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
}

function absoluteUrl(reference) {
  return new URL(reference, siteOrigin).href;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function breadcrumbItems(urlPath, meta) {
  const items = [{ name: "Home", url: "/" }];
  if (urlPath.startsWith("/posts/")) items.push({ name: "FAB", url: "/fab/" });
  if (urlPath.startsWith("/writing/")) items.push({ name: "Writing", url: "/#writing" });
  if (urlPath !== "/") items.push({ name: meta.title.split(" · ")[0], url: urlPath });
  return items;
}

function structuredData(urlPath, meta) {
  const canonical = absoluteUrl(urlPath);
  const person = {
    "@type": "Person",
    "@id": `${siteOrigin}/#person`,
    name: "Haluk Oral",
    url: `${siteOrigin}/`,
    sameAs: [
      "https://github.com/halukoral",
      "https://www.fab.com/sellers/GenX%20Games"
    ],
    jobTitle: "C++ and Unreal Engine Developer"
  };
  const website = {
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    url: `${siteOrigin}/`,
    name: "Haluk Oral",
    inLanguage: "en",
    publisher: { "@id": `${siteOrigin}/#person` }
  };
  const page = {
    "@type": meta.schemaType,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: meta.title,
    description: meta.description,
    inLanguage: "en",
    isPartOf: { "@id": `${siteOrigin}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(meta.image) }
  };
  const graph = [person, website, page];

  if (["BlogPosting", "TechArticle"].includes(meta.schemaType)) {
    Object.assign(page, {
      headline: meta.title.split(" · ")[0],
      image: [absoluteUrl(meta.image)],
      datePublished: meta.datePublished,
      dateModified: meta.dateModified,
      author: { "@id": `${siteOrigin}/#person` },
      publisher: { "@id": `${siteOrigin}/#person` },
      articleSection: meta.section,
      keywords: meta.keywords.join(", "),
      mainEntityOfPage: { "@id": `${canonical}#webpage` }
    });
  }

  if (urlPath !== "/" && !meta.noindex) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: breadcrumbItems(urlPath, meta).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.url)
      }))
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2)
    .replaceAll("<", "\\u003c");
}

function seoHead(urlPath, meta) {
  const canonical = absoluteUrl(urlPath);
  const image = absoluteUrl(meta.image);
  const isArticle = ["BlogPosting", "TechArticle"].includes(meta.schemaType);
  const tags = [
    `  <title>${escapeHtml(meta.title)}</title>`,
    `  <meta name="description" content="${escapeHtml(meta.description)}">`,
    `  <meta name="author" content="Haluk Oral">`,
    meta.noindex ? `  <meta name="robots" content="noindex, follow">` : null,
    `  <link rel="canonical" href="${canonical}">`,
    `  <meta property="og:site_name" content="Haluk Oral">`,
    `  <meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `  <meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `  <meta property="og:locale" content="en_US">`,
    `  <meta property="og:image" content="${image}">`,
    `  <meta property="og:image:alt" content="${escapeHtml(meta.title.split(" · ")[0])}">`,
    `  <meta property="og:type" content="${isArticle ? "article" : "website"}">`,
    `  <meta property="og:url" content="${canonical}">`,
    isArticle ? `  <meta property="article:published_time" content="${meta.datePublished}">` : null,
    isArticle ? `  <meta property="article:modified_time" content="${meta.dateModified}">` : null,
    isArticle ? `  <meta property="article:author" content="${siteOrigin}/">` : null,
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `  <meta name="twitter:image" content="${image}">`,
    `  <script type="application/ld+json">\n${structuredData(urlPath, meta)}\n  </script>`
  ];
  return tags.filter(Boolean).join("\n");
}

function applySeo(html, urlPath, meta) {
  const managedPatterns = [
    /\s*<title>[\s\S]*?<\/title>/i,
    /\s*<meta\s+name=["'](?:description|author|robots)["'][^>]*\/?\s*>/gi,
    /\s*<meta\s+property=["'](?:og:|article:)[^"']+["'][^>]*\/?\s*>/gi,
    /\s*<meta\s+name=["']twitter:[^"']+["'][^>]*\/?\s*>/gi,
    /\s*<link\s+rel=["']canonical["'][^>]*\/?\s*>/gi,
    /\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
  ];
  let result = managedPatterns.reduce((current, pattern) => current.replace(pattern, ""), html);
  const marker = /\s*<link\s+rel=["']icon["']/i;
  if (!marker.test(result)) throw new Error(`Missing favicon marker for ${urlPath}`);
  result = result.replace(marker, `\n${seoHead(urlPath, meta)}\n  <link rel="icon"`);

  if (meta.dateDisplay) {
    result = result.replace(meta.dateDisplay, `<time datetime="${meta.datePublished}">${meta.dateDisplay}</time>`);
  }
  if (meta.modifiedDisplay) {
    result = result.replace(meta.modifiedDisplay, `<time datetime="${meta.dateModified}">${meta.modifiedDisplay}</time>`);
  }
  return result;
}

function enhanceImages(html, imageManifest, meta) {
  return html.replace(/<img\b[^>]*>/gi, tag => {
    const source = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const metadata = source ? imageManifest[source] : null;
    if (!metadata?.variants?.length) return tag;

    const variants = metadata.variants;
    const fallback = variants.at(-1).src;
    const srcset = variants.map(variant => `${variant.src} ${variant.width}w`).join(", ");
    let enhanced = tag
      .replace(/\s+(?:width|height|srcset|sizes|decoding)=["'][^"']*["']/gi, "")
      .replace(/\bsrc=["'][^"']+["']/i, `src="${fallback}"`)
      .replace(/\s*\/?\s*>$/, "");
    enhanced = enhanced.replace(/\balt=["']Screenshot (\d+)["']/i, (_, number) =>
      `alt="${escapeHtml(meta.title.split(" · ")[0])} screenshot ${number}"`
    );
    enhanced = enhanced.replace(/\balt=["']Astronaut cat (\d+)["']/i, (_, number) =>
      `alt="Astronaut cat crew member ${number} floating in space"`
    );
    enhanced += ` width="${metadata.width}" height="${metadata.height}"`;
    enhanced += ` srcset="${srcset}" sizes="(max-width: 900px) 100vw, 960px" decoding="async">`;
    return enhanced;
  });
}

function enhanceIframes(html, meta) {
  return html.replace(/<iframe\b[^>]*>/gi, tag => {
    let enhanced = tag.replace(/\s+title=["'][^"']*["']/i, "");
    if (!/\sloading=/i.test(enhanced)) enhanced = enhanced.replace(/>$/, ' loading="lazy">');
    return enhanced.replace(/>$/, ` title="${escapeHtml(meta.title.split(" · ")[0])} video demonstration">`);
  });
}

function enhanceRelatedLinks(html, meta) {
  if (!meta.related?.length) return html;
  const links = meta.related.map(urlPath => {
    const related = seoPages[urlPath];
    return `      <a class="related-post-link" href="${urlPath}">\n        <span>${escapeHtml(related.section)}</span>\n        <strong>${escapeHtml(related.title.split(" · ")[0])}</strong>\n        <small>${escapeHtml(related.description)}</small>\n      </a>`;
  }).join("\n");
  const section = `  <section class="next-post related-posts section-shell" aria-labelledby="related-posts-title">\n    <p class="eyebrow" id="related-posts-title">\n      <span></span>\n      Related Unreal Engine systems\n    </p>\n    <div class="related-post-grid">\n${links}\n    </div>\n    <div class="related-post-actions">\n      <a href="/fab/">View the complete FAB archive <span aria-hidden="true">→</span></a>\n      <a href="https://www.fab.com/sellers/GenX%20Games" target="_blank" rel="noopener noreferrer">Browse tools on FAB <span aria-hidden="true">↗</span></a>\n    </div>\n  </section>`;
  return html.replace(/\s*<section class="next-post section-shell">[\s\S]*?<\/section>/, `\n${section}`);
}

async function applyPageEnhancements(imageManifest) {
  const htmlFiles = await walk(output, ".html");
  for (const file of htmlFiles) {
    const urlPath = pageUrlFromFile(file);
    const meta = seoPages[urlPath];
    if (!meta) throw new Error(`Missing SEO metadata for ${urlPath}`);
    const html = await readFileWithRetry(file);
    const enhanced = enhanceRelatedLinks(
      enhanceIframes(enhanceImages(applySeo(html, urlPath, meta), imageManifest, meta), meta),
      meta
    );
    await writeFile(file, enhanced, "utf8");
  }
}

function sitemapXml() {
  const urls = Object.entries(seoPages)
    .filter(([, meta]) => !meta.noindex)
    .map(([urlPath, meta]) => [
      "  <url>",
      `    <loc>${absoluteUrl(urlPath)}</loc>`,
      meta.lastModified || meta.dateModified
        ? `    <lastmod>${meta.lastModified || meta.dateModified}</lastmod>`
        : null,
      "  </url>"
    ].filter(Boolean).join("\n"))
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
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

async function attachCatProfileImages(profiles, imageManifest) {
  const profilesDirectory = path.join(root, "assets", "img", "cats", "profiles");

  return Promise.all(profiles.map(async profile => {
    const folderName = `crew-${profile.crew}`;
    const folder = path.join(profilesDirectory, folderName);
    const images = (await readdir(folder, { withFileTypes: true }))
      .filter(entry => entry.isFile() && supportedCatImageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((left, right) => left.localeCompare(right, "en", { numeric: true, sensitivity: "base" }))
      .map(fileName => {
        const originalSrc = `/assets/img/cats/profiles/${folderName}/${encodeURIComponent(fileName)}`;
        const metadata = imageManifest[originalSrc];
        const variants = metadata?.variants ?? [];
        return {
          src: variants.at(-1)?.src ?? originalSrc,
          originalSrc,
          srcset: variants.map(variant => `${variant.src} ${variant.width}w`).join(", "),
          width: metadata?.width,
          height: metadata?.height,
          alt: profile.name
        };
      });

    if (!images.length) throw new Error(`No profile images found in ${path.relative(root, folder)}`);
    return { ...profile, images };
  }));
}

async function validateLinks() {
  const missing = [];
  const htmlFiles = await walk(output, ".html");

  for (const file of htmlFiles) {
    const html = await readFileWithRetry(file);
    const references = html.matchAll(/(?:href|src)=["'](\/[^"']*)["']/g);

    for (const [, reference] of references) {
      if (reference.startsWith("//") || reference.startsWith("/#")) continue;
      const target = resolveLocalReference(reference);
      if (!(await exists(target, 4))) {
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
  // Some Windows filesystems release recently removed directory entries asynchronously.
  await new Promise(resolve => setTimeout(resolve, 500));
  await mkdir(output, { recursive: true });

  await cp(path.join(root, "src", "pages"), output, { recursive: true });
  await cp(path.join(root, "src", "styles"), path.join(output, "styles"), { recursive: true });
  await cp(path.join(root, "src", "scripts"), path.join(output, "scripts"), { recursive: true });
  await cp(path.join(root, "assets", "img"), path.join(output, "assets", "img"), { recursive: true });

  const imageManifestPath = path.join(root, "assets", "img", "image-manifest.json");
  const imageManifest = await exists(imageManifestPath)
    ? JSON.parse(await readFile(imageManifestPath, "utf8"))
    : {};

  const catProfiles = await attachCatProfileImages(
    parseCatProfiles(await readFile(path.join(root, "CAT_PROFILES.md"), "utf8")),
    imageManifest
  );
  const catProfileContent = `window.CAT_PROFILE_CONTENT = ${JSON.stringify(catProfiles, null, 2)};\n`;
  const catProfileVersion = createHash("sha256").update(catProfileContent).digest("hex").slice(0, 12);
  const catsScriptVersion = createHash("sha256")
    .update(await readFile(path.join(output, "scripts", "cats.js")))
    .digest("hex")
    .slice(0, 12);
  const catsStyleVersion = createHash("sha256")
    .update(await readFile(path.join(output, "styles", "cat-profiles.css")))
    .digest("hex")
    .slice(0, 12);
  await writeFile(
    path.join(output, "scripts", "cat-profile-content.js"),
    catProfileContent,
    "utf8"
  );

  const catsPage = path.join(output, "cats", "index.html");
  const catsHtml = (await readFile(catsPage, "utf8"))
    .replace("/styles/cat-profiles.css", `/styles/cat-profiles.css?v=${catsStyleVersion}`)
    .replace("/scripts/cats.js", `/scripts/cats.js?v=${catsScriptVersion}`)
    .replace(
      "/scripts/cat-profile-content.js",
      `/scripts/cat-profile-content.js?v=${catProfileVersion}`
    );
  await writeFile(
    catsPage,
    catsHtml,
    "utf8"
  );

  for (const file of ["favicon.svg", "file.svg", "globe.svg", "window.svg", "og.png", "og-en.png", "og-fab.png"]) {
    const source = path.join(root, file);
    if (await exists(source)) await copyFile(source, path.join(output, file));
  }

  await applyPageEnhancements(imageManifest);
  await writeFile(path.join(output, "sitemap.xml"), sitemapXml(), "utf8");
  await writeFile(
    path.join(output, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    "utf8"
  );
  await writeFile(path.join(output, ".nojekyll"), "", "utf8");
  const pageCount = await validateLinks();
  console.log(`Built ${pageCount} pages in dist/.`);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await build();
}
