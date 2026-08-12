const space = document.querySelector(".cat-space");
const stage = document.querySelector(".cat-stage");
const profileSlot = document.querySelector(".cat-profile-slot");

const profiles = [
  {
    name: "Goffy",
    images: [
      { src: "/assets/img/cats/profiles/crew-01.jpg", alt: "Goffy" }
    ],
    paragraphs: [
      "The most anxious cat in the house. He is always tense, so he is constantly afraid of something. His most defining quality, however, is that he is completely insane. This must be what people mean when they talk about “orange cat behavior.”",
      "When he loses his mind, anything can happen. He may meow constantly, circle around you without ever stopping—and we are not exaggerating—or simply stare at you. When he stares, he stands as still as a statue without even blinking, which can be slightly terrifying.",
      "Even while eating, he is so nervous and busy checking his surroundings that he falls behind his siblings. They eventually start eating his food, so he looks at us as if to say, “But my siblings touched my food with their mouths!” and walks away.",
      "Even if you put a piece of meat in his mouth, he may assume that you are trying to poison him and run away."
    ]
  },
  {
    name: "Meraklı",
    images: [
      { src: "/assets/img/cats/profiles/crew-02.jpg", alt: "Meraklı" }
    ],
    paragraphs: [
      "The one and only alpha of the house—and the only cat who either does not know her name or knows it perfectly well and simply refuses to respond.",
      "She is extremely attached to her dad, but she should never be made angry. Whenever she gets upset, she finds whichever cat happens to be closest and beats them up.",
      "She is afraid of absolutely nothing and lives entirely in the moment. When she gets angry, she has to take it out on someone. In other words, she never keeps her troubles or frustration bottled up inside."
    ]
  },
  {
    name: "Sunny-son",
    images: [
      { src: "/assets/img/cats/profiles/crew-03.jpg", alt: "Sunny-son" }
    ],
    paragraphs: [
      "Our second Norwegian Forest Cat, who originally came to our home only temporarily. We thought such a wonderful cat would be adopted immediately, but somehow he ended up staying with us.",
      "We found him and Gıcırdak on the street when they were only one or two months old and brought them home as temporary guests. We named him “Sunny-son” because his personality and behavior were exactly like Sunny’s. He even looked like his honorary father.",
      "Just like his father, he is incredibly gentle and innocent. His favorite food is dry, stale bread. If you asked him, “Meat or stale bread?” he would suddenly learn to speak just to answer, “Stale bread, of course!”",
      "We love him dearly because his lion-like mane reminds us of his father. He is also a Bluetooth-enabled cat: He follows you everywhere from a fixed distance but refuses to come any closer—at least until you fall asleep…"
    ]
  },
  {
    name: "Gıcırdak",
    images: [
      { src: "/assets/img/cats/profiles/crew-04.jpg", alt: "Gıcırdak" }
    ],
    paragraphs: [
      "The one and only princess of our home. She was named Gıcırdak because she constantly makes funny little creaking and squeaking sounds.",
      "She is a truly delicate and spoiled little lady. Despite being the smallest and most energetic cat in the house, she can easily bring the whole place crashing down around her.",
      "She is extremely hyperactive and, just like her siblings, activates ninja mode after three in the morning. She is a true support cat. Even when the others beat her up, she does not care and never attacks anyone in return.",
      "She licks everyone without discrimination and happily curls up beside them. She is also the world’s fastest eater. Despite her tiny size, she always finishes her meal before everyone else."
    ]
  },
  {
    name: "Nane",
    images: [
      { src: "/assets/img/cats/profiles/crew-05.jpg", alt: "Nane" }
    ],
    paragraphs: [
      "The smartest of them all. Sometimes we catch her secretly solving calculus problems.",
      "If Nane is focused on a particular spot or trying to tell you something, she should always be taken seriously—she never speaks without a reason. There is definitely a bug, a piece of food, an interesting smell… In short, there is always something.",
      "Her favorite activity is licking you for hours. Be warned, though: Her tongue feels like sandpaper, and prolonged licking may result in the loss of several layers of skin!"
    ]
  },
  {
    name: "Sunny",
    images: [
      { src: "/assets/img/cats/profiles/crew-06.jpg", alt: "Sunny" }
    ],
    paragraphs: [
      "Sunny was our only Norwegian Forest Cat. Sadly, he passed away at a young age.",
      "He was one of the gentlest and most innocent cats you could ever meet. He was missing one of his front legs, had a big, irresistible belly, and was simply too adorable not to nibble.",
      "His most special habit was curling up against your chest and purring contentedly. Despite being the largest and strongest cat in the house, he was regularly beaten up—especially by the alpha.",
      "All he ever wanted in life was food and affection. He once ate 200 grams of food in a single sitting, even though a cat’s approximate daily allowance is around 70 grams.",
      "We still miss him deeply, and we love him very much."
    ]
  }
];

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
        <span>Crew ${crew} · Orbital profile</span>
        <h2>${profile.name}</h2>
        <div class="cat-profile-description">
          ${profile.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join("")}
        </div>
        <button type="button" class="cat-profile-close" aria-label="Close profile">×</button>
      </div>
    `;

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
