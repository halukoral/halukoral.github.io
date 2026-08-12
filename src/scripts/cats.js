const space = document.querySelector(".cat-space");

if (space) {
  const cats = [...space.querySelectorAll(".space-cat")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animations = new Set();
  let activeCat = null;
  let panel = null;
  let panelFrame = null;

  function bounds(cat) {
    return {
      maxX: Math.max(0, space.clientWidth - cat.offsetWidth - 16),
      maxY: Math.max(0, space.clientHeight - cat.offsetHeight - 16)
    };
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
      cat.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) rotate(${next.rotation}deg)`;
      animateCat(cat, next);
    };
  }

  function positionPanel() {
    if (!panel || !activeCat) return;

    const container = space.getBoundingClientRect();
    const cat = activeCat.getBoundingClientRect();
    const gap = 14;
    let left = cat.right - container.left + gap;
    let top = cat.top - container.top + (cat.height - panel.offsetHeight) / 2;

    if (left + panel.offsetWidth > space.clientWidth - 10) {
      left = cat.left - container.left - panel.offsetWidth - gap;
    }

    left = Math.max(10, Math.min(space.clientWidth - panel.offsetWidth - 10, left));
    top = Math.max(10, Math.min(space.clientHeight - panel.offsetHeight - 10, top));
    panel.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    panelFrame = requestAnimationFrame(positionPanel);
  }

  function closeProfile() {
    if (activeCat) activeCat.setAttribute("aria-expanded", "false");
    if (panelFrame) cancelAnimationFrame(panelFrame);
    panel?.remove();
    activeCat = null;
    panel = null;
    panelFrame = null;
  }

  function openProfile(cat, index) {
    if (activeCat === cat) {
      closeProfile();
      return;
    }

    closeProfile();
    activeCat = cat;
    cat.setAttribute("aria-expanded", "true");

    const crew = String(index + 1).padStart(2, "0");
    panel = document.createElement("aside");
    panel.id = "cat-profile-panel";
    panel.className = "cat-profile-panel";
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = `
      <img src="/assets/img/cats/profiles/crew-${crew}.jpg" alt="Crew ${crew} profile">
      <div class="cat-profile-copy">
        <span>Orbital profile</span>
        <h2>Crew ${crew}</h2>
        <p>Profile notes are coming soon. This placeholder will hold their story, personality, and favorite missions.</p>
        <button type="button" class="cat-profile-close" aria-label="Close profile">×</button>
      </div>
    `;
    panel.querySelector("button").addEventListener("click", closeProfile);
    space.append(panel);
    positionPanel();
  }

  cats.forEach((cat, index) => {
    const start = startingPoint(cat, index);
    cat.style.transform = `translate3d(${start.x}px, ${start.y}px, 0) rotate(${start.rotation}deg)`;
    if (!reducedMotion) window.setTimeout(() => animateCat(cat, start), 220 + 170 * index);

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
}
