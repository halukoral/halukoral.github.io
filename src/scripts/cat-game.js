(() => {
  const space = document.querySelector(".cat-space");
  const launchButton = document.querySelector(".cat-game-launch");
  const status = document.querySelector(".cats-status");
  const figures = [...document.querySelectorAll(".space-cat")];
  const profileData = Array.isArray(window.CAT_PROFILE_CONTENT) ? window.CAT_PROFILE_CONTENT : [];

  if (!space || !launchButton || figures.length !== 6) return;

  const captainData = [
    { name: "Goffy", ability: "Panic Boost", detail: "Fast + fearless", color: "#ffad66", description: "Goffy panics his way to safety, moving much faster and ignoring meteor damage for 2.7 seconds. Perfect for crossing a crowded danger zone." },
    { name: "Meraklı", ability: "Alpha Charge", detail: "Smash meteors", color: "#ff758d", description: "Meraklı becomes invulnerable for 2.7 seconds and smashes every meteor he touches. Each destroyed meteor also awards 50 bonus points." },
    { name: "Sunny-son", ability: "Bread Magnet", detail: "Pull snacks in", color: "#f2cf79", description: "Sunny-son activates his legendary appetite for 5.2 seconds, pulling nearby fish and stale bread toward the crew automatically." },
    { name: "Gıcırdak", ability: "Ninja Dash", detail: "Instant escape", color: "#c18cff", description: "Gıcırdak instantly dashes a long distance in your current direction and briefly avoids all damage. Use it to escape a meteor at the last moment." },
    { name: "Nane", ability: "Scanner", detail: "Reveal safe paths", color: "#7ad7ff", description: "Nane scans the sector for 5.2 seconds, slowing every meteor and drawing guidance lines toward missing crew members and the return portal." },
    { name: "Sunny", ability: "Guardian Purr", detail: "Restore protection", color: "#d6ff72", description: "Sunny restores one lost heart and surrounds the crew with a shield that absorbs the next meteor hit. Up to two shields can be stored." }
  ].map((captain, index) => ({
    ...captain,
    name: profileData[index]?.name || captain.name,
    image: figures[index].querySelector("img")
  }));

  const bestScoreKey = "purrbit-best-score-v1";
  const missionLength = 60;
  const abilityCooldown = 9000;
  const keys = new Set();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let shell = null;
  let canvas = null;
  let context = null;
  let hud = null;
  let game = null;
  let selectedCaptain = 0;
  let frame = 0;
  let resizeObserver = null;
  let listeners = null;
  let toastTimer = null;

  function imageSource(index) {
    const image = captainData[index].image;
    return image.currentSrc || image.src;
  }

  function readBestScore() {
    try {
      return Number.parseInt(localStorage.getItem(bestScoreKey) || "0", 10) || 0;
    } catch {
      return 0;
    }
  }

  function saveBestScore(score) {
    const best = Math.max(readBestScore(), score);
    try {
      localStorage.setItem(bestScoreKey, String(best));
    } catch {
      // The game still works when storage is unavailable.
    }
    return best;
  }

  function setPageStatus(message) {
    if (!status) return;
    const textNode = [...status.childNodes].reverse().find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = ` ${message}`;
  }

  function captainButtons() {
    return captainData.map((captain, index) => `
      <button class="cat-game-captain" type="button" data-captain="${index}" aria-pressed="${index === selectedCaptain}">
        <img src="${imageSource(index)}" alt="" aria-hidden="true">
        <strong>${captain.name}</strong>
        <small>${captain.detail}</small>
      </button>
    `).join("");
  }

  function captainBriefingMarkup() {
    const captain = captainData[selectedCaptain];
    return `
      <div class="cat-game-captain-briefing" style="--captain-color:${captain.color}" aria-live="polite" aria-atomic="true">
        <img src="${imageSource(selectedCaptain)}" alt="" aria-hidden="true">
        <div class="cat-game-captain-briefing-copy">
          <span>Crew ability · ${captain.name}</span>
          <strong>${captain.ability}</strong>
          <p>${captain.description}</p>
        </div>
        <small>Press Space or tap the ability button · 9 sec cooldown</small>
      </div>
    `;
  }

  function menuMarkup() {
    return `
      <div class="cat-game-menu" role="dialog" aria-modal="true" aria-labelledby="cat-game-title">
        <p class="cat-game-kicker">Purrbit mission 01</p>
        <h2 id="cat-game-title">The Great Snack Rescue</h2>
        <p class="cat-game-menu-copy">Recover the missing crew, collect cosmic snacks, dodge the meteor field, and reach the portal before time runs out.</p>
        <div class="cat-game-captains" role="group" aria-label="Choose your captain">
          ${captainButtons()}
        </div>
        ${captainBriefingMarkup()}
        <p class="cat-game-controls-hint">Move: WASD / arrow keys / drag · Ability: Space</p>
        <div class="cat-game-button-row">
          <button class="cat-game-primary" type="button" data-game-action="start">Start mission</button>
          <button class="cat-game-secondary" type="button" data-game-action="close">Back to crew</button>
        </div>
      </div>
    `;
  }

  function openGame() {
    if (shell) return;
    window.CAT_CREW_STAGE?.pause();
    space.classList.add("is-game-active");
    figures.forEach(figure => {
      figure.inert = true;
      figure.setAttribute("aria-hidden", "true");
      figure.removeAttribute("role");
      figure.removeAttribute("tabindex");
    });
    setPageStatus("Mission terminal online · Choose your captain");

    listeners = new AbortController();
    shell = document.createElement("div");
    shell.className = "cat-game-shell";
    shell.innerHTML = `
      <canvas class="cat-game-canvas" role="application" tabindex="0" aria-label="Purrbit space rescue game"></canvas>
      ${menuMarkup()}
    `;
    space.append(shell);
    canvas = shell.querySelector("canvas");
    context = canvas.getContext("2d");

    shell.addEventListener("click", handleShellClick, { signal: listeners.signal });
    canvas.addEventListener("pointerdown", handlePointerDown, { signal: listeners.signal });
    canvas.addEventListener("pointermove", handlePointerMove, { signal: listeners.signal });
    canvas.addEventListener("pointerup", handlePointerUp, { signal: listeners.signal });
    canvas.addEventListener("pointercancel", handlePointerUp, { signal: listeners.signal });
    document.addEventListener("keydown", handleKeyDown, { signal: listeners.signal });
    document.addEventListener("keyup", handleKeyUp, { signal: listeners.signal });
    document.addEventListener("visibilitychange", handleVisibility, { signal: listeners.signal });
    window.addEventListener("scroll", updateSafeArea, { signal: listeners.signal, passive: true });

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(space);
    resizeCanvas();
    updateSafeArea();
    drawPreview();
    shell.querySelector(`[data-captain="${selectedCaptain}"]`)?.focus();
  }

  function closeGame() {
    cancelAnimationFrame(frame);
    window.clearTimeout(toastTimer);
    resizeObserver?.disconnect();
    listeners?.abort();
    keys.clear();
    shell?.remove();
    shell = null;
    canvas = null;
    context = null;
    hud = null;
    game = null;
    space.classList.remove("is-game-active");
    figures.forEach(figure => {
      figure.inert = false;
      figure.removeAttribute("aria-hidden");
      figure.setAttribute("role", "button");
      figure.tabIndex = 0;
    });
    setPageStatus("All crew members online · Course locked for deep space");
    window.CAT_CREW_STAGE?.resume();
    launchButton.focus();
  }

  function showMenu() {
    cancelAnimationFrame(frame);
    game = null;
    hud = null;
    shell.querySelector(".cat-game-hud")?.remove();
    shell.querySelector(".cat-game-end")?.remove();
    shell.insertAdjacentHTML("beforeend", menuMarkup());
    drawPreview();
    shell.querySelector(`[data-captain="${selectedCaptain}"]`)?.focus();
  }

  function handleShellClick(event) {
    const captainButton = event.target.closest("[data-captain]");
    if (captainButton) {
      selectedCaptain = Number(captainButton.dataset.captain);
      shell.querySelectorAll("[data-captain]").forEach(button => {
        button.setAttribute("aria-pressed", String(button === captainButton));
      });
      const briefing = shell.querySelector(".cat-game-captain-briefing");
      if (briefing) briefing.outerHTML = captainBriefingMarkup();
      return;
    }

    const action = event.target.closest("[data-game-action]")?.dataset.gameAction;
    if (action === "start" || action === "retry") startMission();
    if (action === "menu") showMenu();
    if (action === "close") closeGame();
    if (action === "ability") activateAbility(performance.now());
  }

  function resizeCanvas() {
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (game) {
      game.width = rect.width;
      game.height = rect.height;
      game.player.x = clamp(game.player.x, 34, rect.width - 34);
      game.player.y = clamp(game.player.y, 46, rect.height - 34);
    }
    updateSafeArea();
  }

  function updateSafeArea() {
    if (!shell) return;
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
    const spaceRect = space.getBoundingClientRect();
    const safeTop = Math.min(spaceRect.height - 74, Math.max(14, headerBottom - spaceRect.top + 10));
    shell.style.setProperty("--cat-game-safe-top", `${safeTop}px`);
  }

  function drawPreview() {
    if (!context || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    drawSpaceBackground(context, rect.width, rect.height, previewStars());
  }

  function previewStars() {
    return Array.from({ length: 80 }, (_, index) => ({
      x: ((index * 47) % 101) / 101,
      y: ((index * 71) % 97) / 97,
      size: index % 11 === 0 ? 1.6 : .7,
      alpha: .25 + (index % 5) * .1
    }));
  }

  function startMission() {
    shell.querySelector(".cat-game-menu")?.remove();
    shell.querySelector(".cat-game-end")?.remove();
    shell.querySelector(".cat-game-hud")?.remove();
    const rect = canvas.getBoundingClientRect();
    const now = performance.now();

    game = {
      width: rect.width,
      height: rect.height,
      startedAt: now,
      lastFrame: now,
      pauseStarted: 0,
      running: true,
      score: 0,
      combo: 1,
      comboExpires: 0,
      hearts: 3,
      shield: selectedCaptain === 5 ? 1 : 0,
      abilityReadyAt: now,
      panicUntil: 0,
      chargeUntil: 0,
      magnetUntil: 0,
      scannerUntil: 0,
      invulnerableUntil: 0,
      captain: selectedCaptain,
      player: { x: rect.width / 2, y: rect.height / 2, vx: 0, vy: 0, radius: 30, rotation: 0 },
      pointer: { active: false, x: rect.width / 2, y: rect.height / 2 },
      followers: [],
      rescues: [],
      snacks: [],
      hazards: [],
      portal: null,
      particles: [],
      labels: [],
      stars: Array.from({ length: 105 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: .45 + Math.random() * 1.35,
        alpha: .2 + Math.random() * .65
      }))
    };

    captainData.forEach((_, index) => {
      if (index === selectedCaptain) return;
      const point = randomPosition(76, [game.player]);
      game.rescues.push({ index, x: point.x, y: point.y, phase: Math.random() * Math.PI * 2, radius: 27 });
    });
    for (let index = 0; index < 9; index += 1) spawnSnack();
    for (let index = 0; index < 5; index += 1) spawnHazard(index);

    shell.insertAdjacentHTML("beforeend", hudMarkup());
    hud = shell.querySelector(".cat-game-hud");
    updateSafeArea();
    updateHud(now);
    setPageStatus(`Mission active · ${captainData[selectedCaptain].name} commanding`);
    announce(`${captainData[selectedCaptain].name} selected. Rescue five crew members and reach the portal.`);
    showToast(`Captain ${captainData[selectedCaptain].name} · ${captainData[selectedCaptain].ability}`);
    game.lastFrame = performance.now();
    frame = requestAnimationFrame(tick);
    canvas.focus?.();
  }

  function hudMarkup() {
    const captain = captainData[selectedCaptain];
    return `
      <div class="cat-game-hud">
        <div class="cat-game-topbar" aria-hidden="true">
          <div class="cat-game-stat"><span>Score</span><strong data-hud="score">0000</strong></div>
          <div class="cat-game-stat"><span>Crew</span><strong data-hud="crew">1 / 6</strong></div>
          <div class="cat-game-stat"><span>Time</span><strong data-hud="time">60</strong></div>
          <div class="cat-game-hearts" data-hud="hearts">♥ ♥ ♥</div>
        </div>
        <button class="cat-game-exit" type="button" data-game-action="close" aria-label="Exit mission">×</button>
        <button class="cat-game-ability" type="button" data-game-action="ability">
          <span class="cat-game-ability-key">SPC</span>
          <span class="cat-game-ability-copy">
            <strong>${captain.ability}</strong>
            <small data-hud="ability">Ready</small>
          </span>
        </button>
        <div class="cat-game-toast" aria-hidden="true"></div>
        <div class="cat-game-sr-status" aria-live="polite"></div>
      </div>
    `;
  }

  function handleKeyDown(event) {
    if (!shell) return;
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
      event.preventDefault();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeGame();
      return;
    }
    if (key === " " && game?.running && !event.repeat) activateAbility(performance.now());
    keys.add(key);
  }

  function handleKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function pointerCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event) {
    if (!game?.running) return;
    const point = pointerCoordinates(event);
    game.pointer = { active: true, ...point };
    canvas.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!game?.running || !game.pointer.active) return;
    Object.assign(game.pointer, pointerCoordinates(event));
  }

  function handlePointerUp(event) {
    if (!game) return;
    game.pointer.active = false;
    canvas.releasePointerCapture?.(event.pointerId);
  }

  function handleVisibility() {
    if (!game?.running) return;
    if (document.hidden) {
      game.pauseStarted = performance.now();
      cancelAnimationFrame(frame);
    } else if (game.pauseStarted) {
      const now = performance.now();
      game.startedAt += now - game.pauseStarted;
      game.lastFrame = now;
      game.pauseStarted = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    if (!game?.running) return;
    const delta = Math.min(.034, Math.max(.001, (now - game.lastFrame) / 1000));
    game.lastFrame = now;
    const remaining = missionLength - (now - game.startedAt) / 1000;
    if (remaining <= 0) {
      finishMission(false, "The portal closed before the crew made it home.");
      return;
    }

    update(delta, now);
    draw(now);
    updateHud(now, remaining);
    frame = requestAnimationFrame(tick);
  }

  function update(delta, now) {
    if (game.combo > 1 && now > game.comboExpires) game.combo = 1;
    updatePlayer(delta, now);
    updateFollowers(delta, now);
    updateSnacks(delta, now);
    updateHazards(delta, now);
    updateRescues(delta, now);
    updateParticles(delta);
    checkPortal();
  }

  function updatePlayer(delta, now) {
    const player = game.player;
    let xInput = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
    let yInput = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));

    if (!xInput && !yInput && game.pointer.active) {
      const dx = game.pointer.x - player.x;
      const dy = game.pointer.y - player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 7) {
        xInput = dx / distance;
        yInput = dy / distance;
      }
    }

    const inputLength = Math.hypot(xInput, yInput) || 1;
    xInput /= inputLength;
    yInput /= inputLength;
    const panicMultiplier = now < game.panicUntil ? 1.72 : 1;
    const speed = Math.max(245, Math.min(365, Math.min(game.width, game.height) * .52)) * panicMultiplier;
    const targetVx = xInput * speed;
    const targetVy = yInput * speed;
    const responsiveness = Math.min(1, delta * (xInput || yInput ? 7 : 4.5));
    player.vx += (targetVx - player.vx) * responsiveness;
    player.vy += (targetVy - player.vy) * responsiveness;
    player.x = clamp(player.x + player.vx * delta, 31, game.width - 31);
    player.y = clamp(player.y + player.vy * delta, 44, game.height - 31);
    if (Math.hypot(player.vx, player.vy) > 20) player.rotation = clamp(player.vx / speed * 12, -12, 12);

    if ((player.x <= 31 || player.x >= game.width - 31) && Math.abs(player.vx) > 20) player.vx *= -.25;
    if ((player.y <= 44 || player.y >= game.height - 31) && Math.abs(player.vy) > 20) player.vy *= -.25;
  }

  function updateFollowers(delta, now) {
    let target = game.player;
    game.followers.forEach((follower, index) => {
      const distance = 54 + index * 3;
      const velocityLength = Math.hypot(target.vx || 0, target.vy || 0) || 1;
      const targetX = target.x - (target.vx || Math.cos(now / 700 + index)) / velocityLength * distance;
      const targetY = target.y - (target.vy || Math.sin(now / 700 + index)) / velocityLength * distance;
      const follow = Math.min(1, delta * (4.5 - Math.min(index, 3) * .35));
      follower.vx = (targetX - follower.x) * 3;
      follower.vy = (targetY - follower.y) * 3;
      follower.x += (targetX - follower.x) * follow;
      follower.y += (targetY - follower.y) * follow;
      follower.rotation = clamp(follower.vx / 80 * 7, -10, 10);
      target = follower;
    });
  }

  function updateSnacks(delta, now) {
    const magnetActive = now < game.magnetUntil;
    game.snacks.forEach(snack => {
      snack.phase += delta * 2;
      if (magnetActive) {
        const dx = game.player.x - snack.x;
        const dy = game.player.y - snack.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 300 && distance > 1) {
          snack.x += dx / distance * delta * (330 - distance) * 1.7;
          snack.y += dy / distance * delta * (330 - distance) * 1.7;
        }
      }

      if (distanceBetween(game.player, snack) < game.player.radius + snack.radius) collectSnack(snack, now);
    });
  }

  function collectSnack(snack, now) {
    const base = snack.type === "bread" ? 25 : 10;
    const points = base * game.combo;
    game.score += points;
    game.combo = Math.min(5, game.combo + 1);
    game.comboExpires = now + 2400;
    addLabel(snack.x, snack.y, `+${points}`, snack.type === "bread" ? "#f2cf79" : "#d6ff72");
    burst(snack.x, snack.y, snack.type === "bread" ? "#f2cf79" : "#d6ff72", 7);
    relocate(snack, 52);
    snack.type = Math.random() < .22 ? "bread" : "snack";
  }

  function updateHazards(delta, now) {
    const scannerSlow = now < game.scannerUntil ? .38 : 1;
    game.hazards.forEach(hazard => {
      hazard.x += hazard.vx * delta * scannerSlow;
      hazard.y += hazard.vy * delta * scannerSlow;
      hazard.rotation += hazard.spin * delta;
      if (hazard.x < -hazard.radius) hazard.x = game.width + hazard.radius;
      if (hazard.x > game.width + hazard.radius) hazard.x = -hazard.radius;
      if (hazard.y < -hazard.radius) hazard.y = game.height + hazard.radius;
      if (hazard.y > game.height + hazard.radius) hazard.y = -hazard.radius;

      if (distanceBetween(game.player, hazard) < game.player.radius * .76 + hazard.radius) hitHazard(hazard, now);
    });
  }

  function hitHazard(hazard, now) {
    if (now < game.chargeUntil) {
      game.score += 50;
      burst(hazard.x, hazard.y, "#ff758d", 12);
      addLabel(hazard.x, hazard.y, "+50", "#ff9aad");
      relocateHazard(hazard);
      return;
    }
    if (now < game.invulnerableUntil) return;

    if (game.shield > 0) {
      game.shield -= 1;
      game.invulnerableUntil = now + 1200;
      showToast("Guardian shield saved the crew");
      burst(game.player.x, game.player.y, "#d6ff72", 12);
    } else {
      game.hearts -= 1;
      game.combo = 1;
      game.score = Math.max(0, game.score - 25);
      game.invulnerableUntil = now + 1650;
      showToast(game.hearts ? "Meteor hit · Keep moving!" : "Hull integrity lost");
      burst(game.player.x, game.player.y, "#ff758d", 15);
      const dx = game.player.x - hazard.x;
      const dy = game.player.y - hazard.y;
      const length = Math.hypot(dx, dy) || 1;
      game.player.vx = dx / length * 260;
      game.player.vy = dy / length * 260;
      if (game.hearts <= 0) {
        finishMission(false, "The meteor field won this round. The crew is ready to try again.");
        return;
      }
    }
    relocateHazard(hazard);
  }

  function updateRescues(delta, now) {
    for (let index = game.rescues.length - 1; index >= 0; index -= 1) {
      const rescue = game.rescues[index];
      rescue.phase += delta * 1.5;
      const displayRescue = { x: rescue.x, y: rescue.y + Math.sin(rescue.phase) * 5 };
      if (distanceBetween(game.player, displayRescue) < game.player.radius + rescue.radius) {
        game.rescues.splice(index, 1);
        game.followers.push({
          index: rescue.index,
          x: rescue.x,
          y: rescue.y,
          vx: 0,
          vy: 0,
          rotation: 0
        });
        game.score += 150;
        burst(rescue.x, rescue.y, captainData[rescue.index].color, 14);
        addLabel(rescue.x, rescue.y, "+150", captainData[rescue.index].color);
        showToast(`${captainData[rescue.index].name} joined the crew · ${game.followers.length + 1} / 6`);
        announce(`${captainData[rescue.index].name} rescued. ${game.followers.length + 1} of 6 crew members together.`);

        if (!game.rescues.length) {
          const point = randomPosition(90, [game.player]);
          game.portal = { x: point.x, y: point.y, radius: 45, phase: 0 };
          showToast("Crew complete · The return portal is open!");
          announce("All crew members rescued. Reach the glowing return portal.");
        }
      }
    }
  }

  function checkPortal() {
    if (!game?.portal) return;
    game.portal.phase += .035;
    if (distanceBetween(game.player, game.portal) < game.player.radius + game.portal.radius * .7) {
      game.score += Math.max(0, Math.ceil(missionLength - (performance.now() - game.startedAt) / 1000)) * 10;
      finishMission(true, "Every cat made it home—with most of the snacks still aboard.");
    }
  }

  function activateAbility(now) {
    if (!game?.running || now < game.abilityReadyAt) return;
    const player = game.player;
    game.abilityReadyAt = now + abilityCooldown;

    if (game.captain === 0) {
      game.panicUntil = now + 2700;
      game.invulnerableUntil = now + 2700;
    } else if (game.captain === 1) {
      game.chargeUntil = now + 2700;
      game.invulnerableUntil = now + 2700;
    } else if (game.captain === 2) {
      game.magnetUntil = now + 5200;
    } else if (game.captain === 3) {
      let dx = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
      let dy = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
      if (!dx && !dy && game.pointer.active) {
        dx = game.pointer.x - player.x;
        dy = game.pointer.y - player.y;
      }
      if (!dx && !dy) ({ dx, dy } = { dx: player.vx || 1, dy: player.vy });
      const length = Math.hypot(dx, dy) || 1;
      burst(player.x, player.y, captainData[3].color, 10);
      player.x = clamp(player.x + dx / length * 175, 31, game.width - 31);
      player.y = clamp(player.y + dy / length * 175, 44, game.height - 31);
      game.invulnerableUntil = now + 900;
      burst(player.x, player.y, captainData[3].color, 10);
    } else if (game.captain === 4) {
      game.scannerUntil = now + 5200;
    } else {
      game.shield = Math.min(2, game.shield + 1);
      game.hearts = Math.min(3, game.hearts + 1);
      game.invulnerableUntil = now + 1100;
    }

    showToast(`${captainData[game.captain].ability} activated`);
    announce(`${captainData[game.captain].ability} activated.`);
    burst(player.x, player.y, captainData[game.captain].color, 12);
    updateHud(now);
  }

  function spawnSnack() {
    const point = randomPosition(45, game ? [game.player, ...game.snacks] : []);
    game.snacks.push({
      x: point.x,
      y: point.y,
      radius: 11,
      phase: Math.random() * Math.PI * 2,
      type: Math.random() < .22 ? "bread" : "snack"
    });
  }

  function spawnHazard(index) {
    const point = randomPosition(70, [game.player, ...game.hazards]);
    const angle = Math.random() * Math.PI * 2;
    const speed = 34 + Math.random() * 42 + index * 2;
    game.hazards.push({
      x: point.x,
      y: point.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 18 + Math.random() * 13,
      rotation: Math.random() * Math.PI * 2,
      spin: -.45 + Math.random() * .9,
      seed: Math.random() * 10
    });
  }

  function relocate(item, padding) {
    const point = randomPosition(padding, [game.player]);
    item.x = point.x;
    item.y = point.y;
    item.phase = Math.random() * Math.PI * 2;
  }

  function relocateHazard(hazard) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) ({ x: hazard.x, y: hazard.y } = { x: -hazard.radius, y: Math.random() * game.height });
    if (side === 1) ({ x: hazard.x, y: hazard.y } = { x: game.width + hazard.radius, y: Math.random() * game.height });
    if (side === 2) ({ x: hazard.x, y: hazard.y } = { x: Math.random() * game.width, y: -hazard.radius });
    if (side === 3) ({ x: hazard.x, y: hazard.y } = { x: Math.random() * game.width, y: game.height + hazard.radius });
  }

  function randomPosition(padding = 50, avoid = []) {
    let point = { x: game.width / 2, y: game.height / 2 };
    for (let attempt = 0; attempt < 30; attempt += 1) {
      point = {
        x: padding + Math.random() * Math.max(1, game.width - padding * 2),
        y: padding + Math.random() * Math.max(1, game.height - padding * 2)
      };
      if (avoid.every(other => distanceBetween(point, other) > 105)) break;
    }
    return point;
  }

  function burst(x, y, color, count) {
    if (!game) return;
    const amount = reducedMotion ? Math.ceil(count / 3) : count;
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 95;
      game.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .45 + Math.random() * .45, color });
    }
  }

  function addLabel(x, y, text, color) {
    game.labels.push({ x, y, text, color, life: 1 });
  }

  function updateParticles(delta) {
    game.particles.forEach(particle => {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vx *= .96;
      particle.vy *= .96;
      particle.life -= delta;
    });
    game.labels.forEach(label => {
      label.y -= delta * 26;
      label.life -= delta;
    });
    game.particles = game.particles.filter(particle => particle.life > 0);
    game.labels = game.labels.filter(label => label.life > 0);
  }

  function updateHud(now, remaining = missionLength - (now - game.startedAt) / 1000) {
    if (!hud || !game) return;
    hud.querySelector('[data-hud="score"]').textContent = String(game.score).padStart(4, "0");
    hud.querySelector('[data-hud="crew"]').textContent = `${game.followers.length + 1} / 6`;
    hud.querySelector('[data-hud="time"]').textContent = String(Math.max(0, Math.ceil(remaining))).padStart(2, "0");
    hud.querySelector('[data-hud="hearts"]').textContent = `${"♥ ".repeat(game.hearts)}${"◇ ".repeat(game.shield)}`.trim();
    const abilityButton = hud.querySelector(".cat-game-ability");
    const cooldown = Math.max(0, game.abilityReadyAt - now);
    abilityButton.disabled = cooldown > 0;
    hud.querySelector('[data-hud="ability"]').textContent = cooldown > 0 ? `${(cooldown / 1000).toFixed(1)}s` : "Ready";
  }

  function showToast(message) {
    if (!hud) return;
    const toast = hud.querySelector(".cat-game-toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1900);
  }

  function announce(message) {
    if (!hud) return;
    hud.querySelector(".cat-game-sr-status").textContent = message;
  }

  function finishMission(won, message) {
    if (!game?.running) return;
    game.running = false;
    cancelAnimationFrame(frame);
    const score = game.score;
    const previousBest = readBestScore();
    const best = saveBestScore(score);
    const newBest = score > previousBest;
    hud?.remove();
    hud = null;
    setPageStatus(won ? "Mission complete · All crew members home" : "Mission ended · Crew ready for another run");
    shell.insertAdjacentHTML("beforeend", `
      <div class="cat-game-end" role="dialog" aria-modal="true" aria-labelledby="cat-game-result-title">
        <p class="cat-game-kicker">${won ? "Mission complete" : "Mission report"}</p>
        <h2 id="cat-game-result-title">${won ? "Crew complete!" : "One more orbit?"}</h2>
        <p class="cat-game-end-copy">${message}</p>
        <div class="cat-game-score-big">${String(score).padStart(4, "0")}</div>
        <p class="cat-game-best">${newBest ? "New personal best" : `Best score · ${String(best).padStart(4, "0")}`}</p>
        <div class="cat-game-button-row">
          <button class="cat-game-primary" type="button" data-game-action="retry">Play again</button>
          <button class="cat-game-secondary" type="button" data-game-action="menu">Change captain</button>
          <button class="cat-game-secondary" type="button" data-game-action="close">Back to crew</button>
        </div>
      </div>
    `);
    shell.querySelector('[data-game-action="retry"]')?.focus();
  }

  function draw(now) {
    const ctx = context;
    drawSpaceBackground(ctx, game.width, game.height, game.stars);
    if (now < game.scannerUntil) drawScanner(ctx, now);
    if (game.portal) drawPortal(ctx, game.portal, now);
    game.snacks.forEach(snack => drawSnack(ctx, snack, now));
    game.rescues.forEach(rescue => drawRescue(ctx, rescue, now));
    game.hazards.forEach(hazard => drawHazard(ctx, hazard, now));
    game.followers.slice().reverse().forEach(follower => drawCat(ctx, follower.index, follower.x, follower.y, 49, follower.rotation, 1));
    drawPlayer(ctx, now);
    drawEffects(ctx);
  }

  function drawSpaceBackground(ctx, width, height, stars) {
    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width * .5, height * .45, 10, width * .5, height * .45, Math.max(width, height) * .55);
    glow.addColorStop(0, "#142a3a88");
    glow.addColorStop(.5, "#11152644");
    glow.addColorStop(1, "#04060b22");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    stars.forEach(star => {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = star.size > 1.35 ? "#9cddff" : "#ffffff";
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#7ad7ff12";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, width * .28, height * .35, -.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawScanner(ctx, now) {
    ctx.save();
    ctx.strokeStyle = "#7ad7ff55";
    ctx.setLineDash([4, 7]);
    ctx.lineWidth = 1;
    [...game.rescues, ...(game.portal ? [game.portal] : [])].forEach(target => {
      ctx.beginPath();
      ctx.moveTo(game.player.x, game.player.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.strokeStyle = "#7ad7ff33";
    ctx.beginPath();
    ctx.arc(game.player.x, game.player.y, 90 + Math.sin(now / 180) * 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSnack(ctx, snack, now) {
    const y = snack.y + Math.sin(snack.phase + now / 420) * 3;
    ctx.save();
    ctx.translate(snack.x, y);
    ctx.rotate(Math.sin(snack.phase + now / 700) * .18);
    ctx.shadowBlur = 17;
    ctx.shadowColor = snack.type === "bread" ? "#f2cf79" : "#d6ff72";
    if (snack.type === "bread") {
      ctx.fillStyle = "#d6a968";
      roundedRect(ctx, -12, -8, 24, 16, 6);
      ctx.fill();
      ctx.strokeStyle = "#7c542f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(-4, 5);
      ctx.moveTo(4, -5);
      ctx.lineTo(4, 5);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#d6ff72";
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(-14, -7);
      ctx.lineTo(-14, 7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#172011";
      ctx.beginPath();
      ctx.arc(4, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRescue(ctx, rescue, now) {
    const y = rescue.y + Math.sin(rescue.phase) * 5;
    ctx.save();
    ctx.strokeStyle = `${captainData[rescue.index].color}77`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 24;
    ctx.shadowColor = captainData[rescue.index].color;
    ctx.beginPath();
    ctx.arc(rescue.x, y, 36 + Math.sin(now / 260 + rescue.phase) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    drawCat(ctx, rescue.index, rescue.x, y, 55, Math.sin(rescue.phase) * 5, 1);
    ctx.fillStyle = "#aab5c0";
    ctx.textAlign = "center";
    ctx.font = "8px monospace";
    ctx.fillText(captainData[rescue.index].name.toUpperCase(), rescue.x, y + 43);
  }

  function drawHazard(ctx, hazard, now) {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.rotation);
    ctx.shadowBlur = now < game.scannerUntil ? 16 : 8;
    ctx.shadowColor = now < game.scannerUntil ? "#ff758d" : "#000";
    const gradient = ctx.createRadialGradient(-hazard.radius * .3, -hazard.radius * .35, 2, 0, 0, hazard.radius);
    gradient.addColorStop(0, "#77808c");
    gradient.addColorStop(1, "#303641");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    for (let index = 0; index < 10; index += 1) {
      const angle = index / 10 * Math.PI * 2;
      const radius = hazard.radius * (.84 + Math.sin(index * 3.1 + hazard.seed) * .11);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (!index) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#252b34aa";
    ctx.beginPath();
    ctx.arc(-hazard.radius * .25, -hazard.radius * .12, hazard.radius * .22, 0, Math.PI * 2);
    ctx.arc(hazard.radius * .28, hazard.radius * .2, hazard.radius * .14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPortal(ctx, portal, now) {
    ctx.save();
    ctx.translate(portal.x, portal.y);
    ctx.rotate(now / 900);
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#7ad7ff";
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.strokeStyle = ring === 1 ? "#d6ff72aa" : "#7ad7ff99";
      ctx.lineWidth = 2.5 - ring * .45;
      ctx.setLineDash([8 + ring * 4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, portal.radius - ring * 8 + Math.sin(now / 220 + ring) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    const center = ctx.createRadialGradient(0, 0, 2, 0, 0, portal.radius * .7);
    center.addColorStop(0, "#ffffffcc");
    center.addColorStop(.28, "#7ad7ff66");
    center.addColorStop(1, "#7ad7ff00");
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * .7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#dff7ff";
    ctx.textAlign = "center";
    ctx.font = "8px monospace";
    ctx.fillText("HOME PORTAL", portal.x, portal.y + portal.radius + 16);
  }

  function drawPlayer(ctx, now) {
    const player = game.player;
    const blinking = now < game.invulnerableUntil && Math.floor(now / 90) % 2 === 0;
    if (now < game.panicUntil || now < game.chargeUntil) {
      ctx.save();
      ctx.strokeStyle = now < game.chargeUntil ? "#ff758daa" : "#ffad66aa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 42 + Math.sin(now / 80) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (game.shield > 0) {
      ctx.save();
      ctx.strokeStyle = "#d6ff7299";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#d6ff72";
      ctx.beginPath();
      ctx.arc(player.x, player.y, 43, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    drawCat(ctx, game.captain, player.x, player.y, 72, player.rotation, blinking ? .35 : 1);
    ctx.fillStyle = captainData[game.captain].color;
    ctx.textAlign = "center";
    ctx.font = "700 8px monospace";
    ctx.fillText("CAPTAIN", player.x, player.y + 52);
  }

  function drawCat(ctx, index, x, y, size, rotation, alpha) {
    const image = captainData[index].image;
    if (!image?.complete || !image.naturalWidth) return;
    const aspect = image.naturalWidth / image.naturalHeight;
    const width = aspect >= 1 ? size : size * aspect;
    const height = aspect >= 1 ? size / aspect : size;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#000b";
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

  function drawEffects(ctx) {
    game.particles.forEach(particle => {
      ctx.globalAlpha = Math.min(1, particle.life * 1.7);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.5 + particle.life * 2, 0, Math.PI * 2);
      ctx.fill();
    });
    game.labels.forEach(label => {
      ctx.globalAlpha = Math.min(1, label.life * 1.8);
      ctx.fillStyle = label.color;
      ctx.textAlign = "center";
      ctx.font = "700 12px monospace";
      ctx.fillText(label.text, label.x, label.y);
    });
    ctx.globalAlpha = 1;
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function distanceBetween(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  launchButton.addEventListener("click", openGame);
})();
