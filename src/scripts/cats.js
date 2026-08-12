const space = document.querySelector(".cat-space");
const stage = document.querySelector(".cat-stage");
const profileSlot = document.querySelector(".cat-profile-slot");

const profileGalleries = [
  [{ src: "/assets/img/cats/profiles/crew-01.jpg", alt: "Goffy" }],
  [{ src: "/assets/img/cats/profiles/crew-02.jpg", alt: "Meraklı" }],
  [{ src: "/assets/img/cats/profiles/crew-03.jpg", alt: "Sunny-son" }],
  [{ src: "/assets/img/cats/profiles/crew-04.jpg", alt: "Gıcırdak" }],
  [{ src: "/assets/img/cats/profiles/crew-05.jpg", alt: "Nane" }],
  [{ src: "/assets/img/cats/profiles/crew-06.jpg", alt: "Sunny" }]
];

const profileContent = Array.isArray(window.CAT_PROFILE_CONTENT) ? window.CAT_PROFILE_CONTENT : [];
const profiles = profileContent.map((profile, index) => ({
  ...profile,
  images: profileGalleries[index] ?? []
}));

if (profiles.length !== 6) throw new Error("Cat profile content could not be loaded.");

if (space && stage && profileSlot) {
  const cats = [...space.querySelectorAll(".space-cat")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new Set();
  const animationTimers = new Set();
  let activeCat = null;
  let panel = null;
  let resizeSnapshot = null;
  let resizeTimer = null;
  let lastSpaceSize = { width: space.clientWidth, height: space.clientHeight };

  function boundsForSize(cat, size) {
    return {
      maxX: Math.max(0, size.width - cat.offsetWidth - 16),
      maxY: Math.max(0, size.height - cat.offsetHeight - 16)
    };
  }

  function bounds(cat) {
    return boundsForSize(cat, { width: space.clientWidth, height: space.clientHeight });
  }

  function startingPoint(cat, index) {
    const { maxX, maxY } = bounds(cat);
    const row = Math.floor(index / 3);
    return {
      x: ((index % 3 + 0.5) / 3) * maxX,
      y: maxY * (row === 0 ? 0.22 : 0.72),
      rotation: index % 2 === 0 ? -3 : 3
    };
  }

  function randomPoint(cat, current) {
    const { maxX, maxY } = bounds(cat);
    let point;
    let attempts = 0;

    do {
      point = {
        x: 8 + Math.random() * Math.max(0, maxX - 8),
        y: 8 + Math.random() * Math.max(0, maxY - 8),
        rotation: -9 + 18 * Math.random()
      };
      attempts += 1;
    } while (
      attempts < 8 &&
      Math.hypot(point.x - current.x, point.y - current.y) < 0.22 * Math.min(space.clientWidth, space.clientHeight)
    );

    return point;
  }

  function setCatTransform(cat, point) {
    cat.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) rotate(${point.rotation}deg)`;
  }

  function readCatPoint(cat) {
    const transform = getComputedStyle(cat).transform;
    if (!transform || transform === "none") return { x: 0, y: 0, rotation: 0 };

    const matrix = new DOMMatrixReadOnly(transform);
    return {
      x: matrix.m41,
      y: matrix.m42,
      rotation: Math.atan2(matrix.m12, matrix.m11) * 180 / Math.PI
    };
  }

  function stopCatMotion() {
    animationTimers.forEach(timer => window.clearTimeout(timer));
    animationTimers.clear();

    const points = cats.map(readCatPoint);
    animations.forEach(animation => animation.cancel());
    animations.clear();
    cats.forEach((cat, index) => setCatTransform(cat, points[index]));

    return points;
  }

  function animateCat(cat, current) {
    const next = randomPoint(cat, current);
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    const duration = Math.max(3200, Math.min(8500, distance * (14 + 8 * Math.random())));
    const animation = cat.animate(
      [
        { transform: `translate3d(${current.x}px, ${current.y}px, 0) rotate(${current.rotation}deg)` },
        { transform: `translate3d(${next.x}px, ${next.y}px, 0) rotate(${next.rotation}deg)` }
      ],
      { duration, easing: "ease-in-out", fill: "forwards" }
    );

    animations.add(animation);
    animation.onfinish = () => {
      animations.delete(animation);
      setCatTransform(cat, next);
      animateCat(cat, next);
    };
  }

  function snapshotCatPositions(size = lastSpaceSize) {
    const points = stopCatMotion();
    return points.map((point, index) => {
      const { maxX, maxY } = boundsForSize(cats[index], size);
      return {
        xRatio: maxX ? Math.max(0, Math.min(1, point.x / maxX)) : 0,
        yRatio: maxY ? Math.max(0, Math.min(1, point.y / maxY)) : 0,
        rotation: point.rotation
      };
    });
  }

  function projectCatPositions() {
    if (!resizeSnapshot) return [];

    return resizeSnapshot.map((state, index) => {
      const { maxX, maxY } = bounds(cats[index]);
      const point = {
        x: state.xRatio * maxX,
        y: state.yRatio * maxY,
        rotation: state.rotation
      };
      setCatTransform(cats[index], point);
      return point;
    });
  }

  function resumeCatMotion() {
    if (!resizeSnapshot) return;
    window.clearTimeout(resizeTimer);
    const points = projectCatPositions();
    resizeSnapshot = null;
    if (!reducedMotion) cats.forEach((cat, index) => animateCat(cat, points[index]));
  }

  function beginSpaceResize() {
    if (!resizeSnapshot) resizeSnapshot = snapshotCatPositions();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resumeCatMotion, 500);
  }

  function layoutCatsInitially() {
    cats.forEach((cat, index) => {
      const start = startingPoint(cat, index);
      setCatTransform(cat, start);

      if (!reducedMotion) {
        const timer = window.setTimeout(() => {
          animationTimers.delete(timer);
          animateCat(cat, start);
        }, 220 + 170 * index);
        animationTimers.add(timer);
      }
    });
  }

  function closeProfile() {
    if (activeCat) activeCat.setAttribute("aria-expanded", "false");
    panel?.remove();
    if (stage.classList.contains("is-profile-open")) beginSpaceResize();
    stage.classList.remove("is-profile-open");
    profileSlot.setAttribute("aria-hidden", "true");
    activeCat = null;
    panel = null;
  }

  function openProfile(cat, index) {
    if (activeCat === cat) {
      closeProfile();
      return;
    }

    const stageWasOpen = stage.classList.contains("is-profile-open");
    if (activeCat) activeCat.setAttribute("aria-expanded", "false");
    panel?.remove();
    if (!stageWasOpen) beginSpaceResize();

    activeCat = cat;
    cat.setAttribute("aria-expanded", "true");

    const crew = String(index + 1).padStart(2, "0");
    const profile = profiles[index];
    const hasMultipleImages = profile.images.length > 1;
    panel = document.createElement("aside");
    panel.id = "cat-profile-panel";
    panel.className = "cat-profile-panel";
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = `
      <div class="cat-profile-gallery">
        <img class="cat-profile-image" src="${profile.images[0].src}" alt="${profile.images[0].alt}, Crew ${crew}">
        ${hasMultipleImages ? `
          <button type="button" class="cat-gallery-button cat-gallery-previous" aria-label="Previous image">‹</button>
          <button type="button" class="cat-gallery-button cat-gallery-next" aria-label="Next image">›</button>
          <span class="cat-gallery-count" aria-live="polite">1 / ${profile.images.length}</span>
        ` : ""}
      </div>
      <div class="cat-profile-copy">
        <div class="cat-profile-header">
          <span class="cat-profile-kicker">Crew ${crew} · Orbital profile</span>
          <div class="cat-profile-language" role="group" aria-label="Profile language">
            <button type="button" class="cat-language-button" data-language="en" aria-label="English" aria-pressed="true">EN</button>
            <button type="button" class="cat-language-button" data-language="tr" aria-label="Türkçe" aria-pressed="false">TR</button>
          </div>
        </div>
        <h2>${profile.name}</h2>
        <div class="cat-profile-description" lang="en">
          ${profile.paragraphs.en.map(paragraph => `<p>${paragraph}</p>`).join("")}
        </div>
        <button type="button" class="cat-profile-close" aria-label="Close profile">×</button>
      </div>
    `;

    const description = panel.querySelector(".cat-profile-description");
    const languageButtons = [...panel.querySelectorAll(".cat-language-button")];
    const showLanguage = language => {
      description.lang = language;
      description.innerHTML = profile.paragraphs[language].map(paragraph => `<p>${paragraph}</p>`).join("");
      description.scrollTop = 0;
      languageButtons.forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.language === language));
      });
    };
    languageButtons.forEach(button => {
      button.addEventListener("click", () => showLanguage(button.dataset.language));
    });

    if (hasMultipleImages) {
      let imageIndex = 0;
      const image = panel.querySelector(".cat-profile-image");
      const count = panel.querySelector(".cat-gallery-count");
      const showImage = nextIndex => {
        imageIndex = (nextIndex + profile.images.length) % profile.images.length;
        image.src = profile.images[imageIndex].src;
        image.alt = `${profile.images[imageIndex].alt}, Crew ${crew}, image ${imageIndex + 1} of ${profile.images.length}`;
        count.textContent = `${imageIndex + 1} / ${profile.images.length}`;
      };
      panel.querySelector(".cat-gallery-previous").addEventListener("click", () => showImage(imageIndex - 1));
      panel.querySelector(".cat-gallery-next").addEventListener("click", () => showImage(imageIndex + 1));
    }

    panel.querySelector(".cat-profile-close").addEventListener("click", closeProfile);
    profileSlot.append(panel);
    profileSlot.setAttribute("aria-hidden", "false");
    stage.classList.add("is-profile-open");
  }

  cats.forEach((cat, index) => {
    cat.addEventListener("click", () => openProfile(cat, index));
    cat.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProfile(cat, index);
      }
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeProfile();
  });

  const spaceObserver = new ResizeObserver(() => {
    const nextSize = { width: space.clientWidth, height: space.clientHeight };
    if (nextSize.width === lastSpaceSize.width && nextSize.height === lastSpaceSize.height) return;
    if (!resizeSnapshot) resizeSnapshot = snapshotCatPositions(lastSpaceSize);
    lastSpaceSize = nextSize;
    projectCatPositions();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resumeCatMotion, 180);
  });

  spaceObserver.observe(space);
  layoutCatsInitially();
}
