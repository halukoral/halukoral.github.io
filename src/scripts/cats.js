const space = document.querySelector(".cat-space");
const stage = document.querySelector(".cat-stage");
const profileSlot = document.querySelector(".cat-profile-slot");

const profileContent = Array.isArray(window.CAT_PROFILE_CONTENT) ? window.CAT_PROFILE_CONTENT : [];
const profiles = profileContent;

if (profiles.length !== 6 || profiles.some(profile => !profile.images?.length)) {
  throw new Error("Cat profile content could not be loaded.");
}

if (space && stage && profileSlot) {
  const cats = [...space.querySelectorAll(".space-cat")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new Set();
  const animationTimers = new Set();
  let activeCat = null;
  let panel = null;
  let imageLightbox = null;
  let imageLightboxReturnFocus = null;
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

  function closeImageLightbox({ restoreFocus = true } = {}) {
    if (!imageLightbox) return;
    const returnFocus = imageLightboxReturnFocus;
    imageLightbox.remove();
    imageLightbox = null;
    imageLightboxReturnFocus = null;
    document.body.classList.remove("cat-image-lightbox-open");
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
  }

  function openImageLightbox(sourceImage) {
    closeImageLightbox({ restoreFocus: false });
    imageLightboxReturnFocus = sourceImage;

    const overlay = document.createElement("div");
    overlay.className = "cat-image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `Enlarged image of ${sourceImage.alt}`);

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.className = "cat-image-lightbox-dismiss";
    dismiss.setAttribute("aria-label", "Close enlarged image");

    const enlargedImage = document.createElement("img");
    enlargedImage.className = "cat-image-lightbox-image";
    enlargedImage.src = sourceImage.currentSrc || sourceImage.src;
    enlargedImage.alt = sourceImage.alt;

    const hint = document.createElement("span");
    hint.className = "cat-image-lightbox-hint";
    hint.textContent = "Click image to close";

    dismiss.append(enlargedImage);
    overlay.append(dismiss, hint);
    dismiss.addEventListener("click", () => closeImageLightbox());
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeImageLightbox();
    });

    document.body.append(overlay);
    document.body.classList.add("cat-image-lightbox-open");
    imageLightbox = overlay;
    dismiss.focus();
  }

  function closeProfile() {
    closeImageLightbox({ restoreFocus: false });
    if (activeCat) activeCat.setAttribute("aria-expanded", "false");
    panel?.remove();
    if (stage.classList.contains("is-profile-open")) beginSpaceResize();
    stage.classList.remove("is-profile-open");
    profileSlot.setAttribute("aria-hidden", "true");
    activeCat = null;
    panel = null;
  }

  function openProfile(cat, index) {
    if (space.classList.contains("is-game-active")) return;

    if (activeCat === cat) {
      closeProfile();
      return;
    }

    const stageWasOpen = stage.classList.contains("is-profile-open");
    closeImageLightbox({ restoreFocus: false });
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
        <img class="cat-profile-image" src="${profile.images[0].src}"${profile.images[0].srcset ? ` srcset="${profile.images[0].srcset}" sizes="(max-width: 900px) 100vw, 50vw"` : ""}${profile.images[0].width ? ` width="${profile.images[0].width}" height="${profile.images[0].height}"` : ""} alt="${profile.images[0].alt}, Crew ${crew}" decoding="async">
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
    const profileImage = panel.querySelector(".cat-profile-image");
    const languageButtons = [...panel.querySelectorAll(".cat-language-button")];
    profileImage.tabIndex = 0;
    profileImage.setAttribute("role", "button");
    profileImage.setAttribute("aria-label", `Enlarge image of ${profile.name}`);
    profileImage.addEventListener("click", () => openImageLightbox(profileImage));
    profileImage.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openImageLightbox(profileImage);
      }
    });
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
      const count = panel.querySelector(".cat-gallery-count");
      const showImage = nextIndex => {
        imageIndex = (nextIndex + profile.images.length) % profile.images.length;
        const image = profile.images[imageIndex];
        profileImage.src = image.src;
        if (image.srcset) profileImage.srcset = image.srcset;
        else profileImage.removeAttribute("srcset");
        if (image.width) {
          profileImage.width = image.width;
          profileImage.height = image.height;
        }
        profileImage.alt = `${image.alt}, Crew ${crew}, image ${imageIndex + 1} of ${profile.images.length}`;
        profileImage.setAttribute("aria-label", `Enlarge image ${imageIndex + 1} of ${profile.images.length} of ${profile.name}`);
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
    if (event.key !== "Escape") return;
    if (imageLightbox) closeImageLightbox();
    else closeProfile();
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

  window.CAT_CREW_STAGE = {
    pause() {
      closeProfile();
      resizeSnapshot = null;
      window.clearTimeout(resizeTimer);
      return stopCatMotion();
    },
    resume() {
      if (reducedMotion) return;
      const points = stopCatMotion();
      cats.forEach((cat, index) => animateCat(cat, points[index]));
    }
  };
}
