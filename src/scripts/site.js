import { navigate } from "astro:transitions/client";

let pageController;
let initializedBody;

const setupPage = () => {
if (initializedBody === document.body) return;
initializedBody = document.body;
const previousController = pageController;
pageController = new AbortController();
previousController?.abort();
const { signal } = pageController;

const greeting = document.querySelector("[data-greeting]");
const hour = new Date().getHours();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const greetingText =
  hour < 6
    ? "夜深了，灵感还醒着"
    : hour < 11
      ? "早上好，今天从一个想法开始"
      : hour < 14
        ? "中午好，给思路留点空白"
        : hour < 18
          ? "下午好，正在把想法做出来"
          : "晚上好，代码还亮着";

if (greeting) greeting.textContent = `${greetingText} · A DIGITAL GARDEN`;
document.querySelector("[data-year]").textContent = new Date().getFullYear();

const introScreen = document.querySelector("#intro-screen");
let introSeen = false;

try {
  introSeen = window.sessionStorage.getItem("zeyuan-intro-seen") === "1";
} catch {
  introSeen = false;
}

if (!introScreen || prefersReducedMotion || introSeen) {
  introScreen?.remove();
  document.body.classList.remove("intro-active");
} else {
  try {
    window.sessionStorage.setItem("zeyuan-intro-seen", "1");
  } catch {
    // The intro still works when browser storage is unavailable.
  }
  window.setTimeout(() => introScreen.classList.add("leaving"), 1600);
  window.setTimeout(() => {
    document.body.classList.remove("intro-active");
    introScreen.remove();
  }, 2470);
}

let arrivingPage = null;

try {
  const savedTransition = window.sessionStorage.getItem("zeyuan-page-transition");
  arrivingPage = savedTransition ? JSON.parse(savedTransition) : null;
  window.sessionStorage.removeItem("zeyuan-page-transition");
} catch {
  arrivingPage = null;
}

const pageTransition = document.createElement("div");
pageTransition.className = "page-transition";
pageTransition.setAttribute("aria-hidden", "true");
pageTransition.innerHTML = `
  <span class="transition-word"></span>
  <span class="transition-scan" aria-hidden="true"></span>
  <span class="transition-meta transition-meta-top">ZEYUAN / DIGITAL GARDEN</span>
  <span class="transition-meta transition-meta-bottom">SYSTEM: READY · ROUTE CHANGE</span>
  <div class="transition-badge">
    <span class="transition-index">00</span>
    <span class="transition-symbol">✳</span>
    <span class="transition-label"></span>
    <span class="transition-en"></span>
  </div>
`;
document.body.append(pageTransition);

const transitionLabel = pageTransition.querySelector(".transition-label");
const transitionEnglish = pageTransition.querySelector(".transition-en");
const transitionWord = pageTransition.querySelector(".transition-word");
const transitionSymbol = pageTransition.querySelector(".transition-symbol");
const transitionIndex = pageTransition.querySelector(".transition-index");
const transitionNames = {
  "首页": "HOME",
  "文章": "WRITING",
  "项目": "PROJECTS",
  "书架": "BOOKS",
  "音乐": "MUSIC",
  "此刻": "MOMENTS",
};
const transitionDetails = {
  "首页": { icon: "⌂", index: "00", accent: "#159ca1" },
  "文章": { icon: "✎", index: "01", accent: "#159ca1" },
  "项目": { icon: "◇", index: "02", accent: "#e48472" },
  "书架": { icon: "▥", index: "03", accent: "#b58a45" },
  "音乐": { icon: "♪", index: "04", accent: "#2d8ea0" },
  "此刻": { icon: "✦", index: "05", accent: "#d66f67" },
};

const setTransitionCopy = (label) => {
  const cleanLabel = label?.trim() || "下一页";
  const englishLabel = transitionNames[cleanLabel] || "OPENING";
  const detail = transitionDetails[cleanLabel] || { icon: "✳", index: "--", accent: "#159ca1" };
  transitionLabel.textContent = cleanLabel;
  transitionEnglish.textContent = englishLabel;
  transitionWord.textContent = englishLabel;
  transitionSymbol.textContent = detail.icon;
  transitionIndex.textContent = detail.index;
  pageTransition.style.setProperty("--transition-accent", detail.accent);
};

if (arrivingPage && !prefersReducedMotion) {
  setTransitionCopy(arrivingPage.label);
  pageTransition.classList.add("arriving");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => pageTransition.classList.add("revealed"));
  });
  window.setTimeout(() => {
    pageTransition.style.transition = "none";
    pageTransition.classList.remove("arriving", "revealed");
    pageTransition.style.transform = "translateY(101%)";
    pageTransition.getBoundingClientRect();
    pageTransition.style.transition = "";
    pageTransition.style.transform = "";
  }, 760);
}

let pageIsTransitioning = false;

document.addEventListener("click", (event) => {
  if (pageIsTransitioning) return;
  if ((typeof event.button === "number" && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

  event.preventDefault();
  if (prefersReducedMotion) {
    navigate(destination.href);
    return;
  }
  pageIsTransitioning = true;
  const label = destination.pathname === "/" ? "首页" : (link.textContent.trim() || "下一页");
  setTransitionCopy(label);
  pageTransition.classList.add("covering");

  try {
    window.sessionStorage.setItem("zeyuan-page-transition", JSON.stringify({ label }));
  } catch {
    // Navigation still works when browser storage is unavailable.
  }

  window.setTimeout(() => navigate(destination.href), 700);
}, { capture:true, signal });

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  pageIsTransitioning = false;
  pageTransition.classList.remove("covering", "arriving", "revealed");
}, { signal });

const revealItems = document.querySelectorAll(".reveal");

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
    observer.observe(item);
  });
}

const constellationCanvas = document.querySelector("[data-constellation]");
const constellationHero = constellationCanvas?.closest(".hero");

if (constellationCanvas && constellationHero && !prefersReducedMotion) {
  const context = constellationCanvas.getContext("2d");
  const constellationTitle = constellationHero.querySelector(".hero-title");
  const fieldCoordinates = constellationHero.querySelector("[data-field-coordinates]");
  const coreScene = constellationHero.querySelector("[data-tilt-scene]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (context) {
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let particles = [];
    let trail = [];
    let animationFrame = 0;
    let isInView = true;
    let isRunning = false;
    let lastFrameTime = performance.now();
    const pointer = { x: 0, y: 0, active: false };
    const core = { x: 0, y: 0 };

    const randomParticle = (index) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.22;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 0.8 + Math.random() * 1.25,
        coral: index % 6 === 0,
        phase: Math.random() * Math.PI * 2,
      };
    };

    const updateCore = () => {
      const heroRect = constellationHero.getBoundingClientRect();
      const sceneRect = coreScene?.getBoundingClientRect();
      core.x = sceneRect ? sceneRect.left - heroRect.left + sceneRect.width / 2 : width / 2;
      core.y = sceneRect ? sceneRect.top - heroRect.top + sceneRect.height / 2 : height / 2;
    };

    const resizeConstellation = () => {
      const rect = constellationHero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      constellationCanvas.width = Math.round(width * pixelRatio);
      constellationCanvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      updateCore();

      const particleCount = width < 560 ? 25 : width < 900 ? 38 : 56;
      particles = Array.from({ length: particleCount }, (_, index) => randomParticle(index));
      constellationCanvas.dataset.particles = String(particleCount);
    };

    const setTitleDepth = (normalizedX, normalizedY) => {
      if (!constellationTitle) return;
      const depthX = normalizedX * 2.4;
      const depthY = normalizedY * 1.8;
      constellationTitle.style.setProperty("--depth-x", `${depthX.toFixed(2)}px`);
      constellationTitle.style.setProperty("--depth-y", `${depthY.toFixed(2)}px`);
      constellationTitle.style.setProperty("--depth-x-neg", `${(-depthX).toFixed(2)}px`);
      constellationTitle.style.setProperty("--depth-y-neg", `${(-depthY).toFixed(2)}px`);
    };

    const drawFrame = (now) => {
      if (!isRunning) return;
      const step = Math.min((now - lastFrameTime) / 16.67, 2.2);
      lastFrameTime = now;
      context.clearRect(0, 0, width, height);

      const pulse = 21 + Math.sin(now * 0.0022) * 5;
      context.beginPath();
      context.arc(core.x, core.y, pulse, 0, Math.PI * 2);
      context.strokeStyle = "rgba(21, 156, 161, 0.11)";
      context.lineWidth = 1;
      context.stroke();
      context.beginPath();
      context.arc(core.x, core.y, pulse + 12, now * 0.0007, now * 0.0007 + Math.PI * 1.35);
      context.strokeStyle = "rgba(228, 132, 114, 0.11)";
      context.stroke();

      particles.forEach((particle) => {
        const coreX = core.x - particle.x;
        const coreY = core.y - particle.y;
        const coreDistance = Math.max(70, Math.hypot(coreX, coreY));
        const orbitInfluence = Math.max(0, 1 - coreDistance / Math.max(width * 0.58, 520));
        particle.vx += (-coreY / coreDistance) * orbitInfluence * 0.0018 * step;
        particle.vy += (coreX / coreDistance) * orbitInfluence * 0.0018 * step;
        particle.vx += (coreX / coreDistance) * orbitInfluence * 0.00045 * step;
        particle.vy += (coreY / coreDistance) * orbitInfluence * 0.00045 * step;

        if (pointer.active) {
          const pointerX = pointer.x - particle.x;
          const pointerY = pointer.y - particle.y;
          const pointerDistance = Math.max(1, Math.hypot(pointerX, pointerY));
          if (pointerDistance < 185) {
            const pull = (1 - pointerDistance / 185) * 0.017 * step;
            particle.vx += (pointerX / pointerDistance) * pull;
            particle.vy += (pointerY / pointerDistance) * pull;
          }
        }

        particle.vx *= 0.996;
        particle.vy *= 0.996;
        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > 0.72) {
          particle.vx = (particle.vx / speed) * 0.72;
          particle.vy = (particle.vy / speed) * 0.72;
        }
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;

        if (particle.x < -16) particle.x = width + 16;
        if (particle.x > width + 16) particle.x = -16;
        if (particle.y < -16) particle.y = height + 16;
        if (particle.y > height + 16) particle.y = -16;
      });

      const connectionDistance = width < 560 ? 94 : 132;
      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first];
          const b = particles[second];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > connectionDistance) continue;
          const opacity = (1 - distance / connectionDistance) * 0.2;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = a.coral || b.coral ? `rgba(228, 132, 114, ${opacity})` : `rgba(21, 156, 161, ${opacity})`;
          context.lineWidth = 0.7;
          context.stroke();
        }
      }

      particles.forEach((particle) => {
        const shimmer = 0.68 + Math.sin(now * 0.0018 + particle.phase) * 0.22;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = particle.coral ? `rgba(228, 132, 114, ${shimmer})` : `rgba(21, 156, 161, ${shimmer})`;
        context.fill();
      });

      if (pointer.active) {
        const nearby = particles.filter((particle) => Math.hypot(pointer.x - particle.x, pointer.y - particle.y) < 115).slice(0, 5);
        nearby.forEach((particle) => {
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(particle.x, particle.y);
          context.strokeStyle = "rgba(228, 132, 114, 0.18)";
          context.lineWidth = 0.8;
          context.stroke();
        });
        context.beginPath();
        context.arc(pointer.x, pointer.y, 12 + Math.sin(now * 0.004) * 2, 0, Math.PI * 2);
        context.strokeStyle = "rgba(21, 156, 161, 0.24)";
        context.stroke();
      }

      if (trail.length > 1) {
        context.beginPath();
        context.moveTo(trail[0].x, trail[0].y);
        trail.slice(1).forEach((point) => context.lineTo(point.x, point.y));
        context.strokeStyle = "rgba(21, 156, 161, 0.16)";
        context.lineWidth = 1;
        context.stroke();
      }
      trail = trail.map((point) => ({ ...point, life: point.life - 0.045 * step })).filter((point) => point.life > 0);

      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const startConstellation = () => {
      if (isRunning || !isInView || document.hidden) return;
      isRunning = true;
      lastFrameTime = performance.now();
      constellationCanvas.dataset.running = "true";
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const stopConstellation = () => {
      if (!isRunning) return;
      isRunning = false;
      constellationCanvas.dataset.running = "false";
      window.cancelAnimationFrame(animationFrame);
    };

    if (finePointer) {
      constellationHero.addEventListener("pointermove", (event) => {
        const rect = constellationHero.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
        trail.push({ x: pointer.x, y: pointer.y, life: 1 });
        if (trail.length > 10) trail.shift();

        const normalizedX = pointer.x / width - 0.5;
        const normalizedY = pointer.y / height - 0.5;
        setTitleDepth(normalizedX, normalizedY);
        if (fieldCoordinates) {
          fieldCoordinates.textContent = `X ${String(Math.round((pointer.x / width) * 100)).padStart(3, "0")} · Y ${String(Math.round((pointer.y / height) * 100)).padStart(3, "0")}`;
        }
      }, { signal });

      constellationHero.addEventListener("pointerleave", () => {
        pointer.active = false;
        trail = [];
        setTitleDepth(0, 0);
        if (fieldCoordinates) fieldCoordinates.textContent = "X 050 · Y 050";
      }, { signal });
    }

    const visibilityObserver = new IntersectionObserver((entries) => {
      isInView = entries[0]?.isIntersecting ?? true;
      if (isInView) startConstellation();
      else stopConstellation();
    }, { threshold: 0.02 });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopConstellation();
      else startConstellation();
    }, { signal });

    if ("ResizeObserver" in window) new ResizeObserver(resizeConstellation).observe(constellationHero);
    else window.addEventListener("resize", resizeConstellation, { signal });

    document.fonts?.ready.then(updateCore);
    resizeConstellation();
    constellationCanvas.dataset.ready = "true";
    visibilityObserver.observe(constellationHero);
    startConstellation();
  }
}

const tiltScene = document.querySelector("[data-tilt-scene]");

if (tiltScene && !prefersReducedMotion) {
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (hasFinePointer) {
    let tiltFrame = 0;
    let nextTiltX = 0;
    let nextTiltY = 0;

    const paintTilt = () => {
      tiltScene.style.setProperty("--tilt-x", `${nextTiltX.toFixed(2)}deg`);
      tiltScene.style.setProperty("--tilt-y", `${nextTiltY.toFixed(2)}deg`);
      tiltFrame = 0;
    };

    tiltScene.addEventListener("pointermove", (event) => {
      const rect = tiltScene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      nextTiltX = y * -13;
      nextTiltY = x * 17;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(paintTilt);
    }, { signal });

    tiltScene.addEventListener("pointerleave", () => {
      nextTiltX = 0;
      nextTiltY = 0;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(paintTilt);
    }, { signal });
  } else {
    tiltScene.classList.add("auto-tilt");
  }
}

const globalPlayer = document.querySelector("[data-global-player]");
const radioConsole = document.querySelector("[data-radio]");

if (globalPlayer) {
  const audio = globalPlayer.querySelector("[data-global-audio]");
  const globalToggle = globalPlayer.querySelector("[data-player-toggle]");
  const globalIcon = globalPlayer.querySelector("[data-player-icon]");
  const globalPrevious = globalPlayer.querySelector("[data-player-prev]");
  const globalNext = globalPlayer.querySelector("[data-player-next]");
  const globalStop = globalPlayer.querySelector("[data-player-stop]");
  const globalTitle = globalPlayer.querySelector("[data-player-title]");
  const globalArtist = globalPlayer.querySelector("[data-player-artist]");
  const globalStatus = globalPlayer.querySelector("[data-player-status]");
  const radioPlayButton = radioConsole?.querySelector("[data-radio-play]");
  const radioPlayIcon = radioConsole?.querySelector("[data-play-icon]");
  const radioTitle = radioConsole?.querySelector("[data-radio-title]");
  const radioArtist = radioConsole?.querySelector("[data-radio-artist]");
  const radioNote = radioConsole?.querySelector("[data-radio-note]");
  const radioCurrent = radioConsole?.querySelector("[data-radio-current]");
  const radioDuration = radioConsole?.querySelector("[data-radio-duration]");
  const radioProgress = radioConsole?.querySelector("[data-radio-progress]");
  const radioStatus = radioConsole?.querySelector("[data-radio-status]");
  const appleLink = radioConsole?.querySelector("[data-radio-link]");
  const trackButtons = [...document.querySelectorAll("[data-radio-track]")];
  let tracks = [];

  try {
    tracks = JSON.parse(globalPlayer.querySelector("[data-global-tracks]")?.textContent || "[]");
  } catch {
    tracks = [];
  }

  const previewCache = globalPlayer.previewCache ?? new Map();
  globalPlayer.previewCache = previewCache;

  const normalizeIndex = (index) => tracks.length ? (Number(index) + tracks.length) % tracks.length : 0;
  const getActiveIndex = () => normalizeIndex(globalPlayer.dataset.activeIndex || 0);
  const getActiveTrack = () => tracks[getActiveIndex()] ?? null;

  const formatAudioTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const setStatus = (playerMessage, pageMessage = playerMessage) => {
    if (globalStatus) globalStatus.textContent = playerMessage;
    if (radioStatus) radioStatus.textContent = pageMessage;
  };

  const setProgress = (value) => {
    const boundedValue = Math.min(100, Math.max(0, Number(value) || 0));
    globalPlayer.style.setProperty("--player-progress", `${boundedValue}%`);
    radioConsole?.style.setProperty("--radio-progress", `${boundedValue}%`);
    if (radioProgress) radioProgress.value = String(boundedValue);
  };

  const animateTrackChange = () => {
    if (!radioConsole || prefersReducedMotion) return;
    radioConsole.classList.remove("track-changing");
    void radioConsole.offsetWidth;
    radioConsole.classList.add("track-changing");
    window.setTimeout(() => radioConsole.classList.remove("track-changing"), 480);
  };

  const syncTrackDisplay = (animate = false) => {
    const track = getActiveTrack();
    if (!track) return;
    const activeIndex = getActiveIndex();
    const accent = track.accent || "#e48472";
    globalPlayer.style.setProperty("--player-accent", accent);
    radioConsole?.style.setProperty("--radio-accent", accent);
    const frequencyPosition = tracks.length > 1 ? 14 + (activeIndex / (tracks.length - 1)) * 72 : 50;
    radioConsole?.style.setProperty("--radio-frequency", `${frequencyPosition}%`);
    if (globalTitle) globalTitle.textContent = track.title;
    if (globalArtist) globalArtist.textContent = track.artist;
    if (radioTitle) radioTitle.textContent = track.title;
    if (radioArtist) radioArtist.textContent = track.artist;
    if (radioNote) radioNote.textContent = track.note;
    trackButtons.forEach((button) => {
      const selected = Number(button.dataset.trackIndex) === activeIndex;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    if (appleLink) appleLink.href = `https://music.apple.com/hk/search?term=${encodeURIComponent(track.query || `${track.artist} ${track.title}`)}`;
    if (animate) animateTrackChange();
    if ("mediaSession" in navigator && "MediaMetadata" in window) {
      navigator.mediaSession.metadata = new MediaMetadata({ title:track.title, artist:track.artist, album:"ZeYuan's Midnight Radio" });
    }
  };

  const syncPlayingState = (playing) => {
    const track = getActiveTrack();
    globalPlayer.classList.toggle("is-playing", playing);
    radioConsole?.classList.toggle("playing", playing);
    if (globalIcon) globalIcon.textContent = playing ? "Ⅱ" : "▶";
    if (radioPlayIcon) radioPlayIcon.textContent = playing ? "Ⅱ" : "▶";
    globalToggle?.setAttribute("aria-label", `${playing ? "暂停" : "播放"}${track?.title ?? "当前歌曲"}`);
    radioPlayButton?.setAttribute("aria-label", `${playing ? "暂停" : "播放"}${track?.title ?? "当前歌曲"}`);
    if (playing) {
      delete globalPlayer.dataset.stopped;
      setStatus("MIDNIGHT RADIO · ON AIR", audio?.dataset.sourceLabel || "正在播放");
    } else if (globalPlayer.dataset.stopped === "true") {
      setStatus("MIDNIGHT RADIO · 已停止", "已停止播放");
    } else if (audio?.src) {
      setStatus("MIDNIGHT RADIO · 已暂停", audio.dataset.sourceLabel || "试听已暂停");
    }
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = playing ? "playing" : globalPlayer.dataset.stopped === "true" ? "none" : "paused";
  };

  const searchPreview = async (query, selectedArtist) => {
    if (previewCache.has(query)) return previewCache.get(query);
    const endpoint = new URL("https://itunes.apple.com/search");
    endpoint.search = new URLSearchParams({ term:query, country:"HK", media:"music", entity:"song", limit:"8" }).toString();
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Preview lookup failed: ${response.status}`);
    const payload = await response.json();
    const artistKey = selectedArtist.slice(-2);
    const result = payload.results.find((item) => item.previewUrl && item.artistName?.includes(artistKey))
      ?? payload.results.find((item) => item.previewUrl)
      ?? null;
    previewCache.set(query, result);
    return result;
  };

  const startAudio = async () => {
    if (!audio?.src) return;
    try {
      delete globalPlayer.dataset.stopped;
      await audio.play();
    } catch {
      setStatus("MIDNIGHT RADIO · 待播放", "试听已就绪 · 点播放开始");
    }
  };

  const loadActiveTrack = async (autoplay = false) => {
    const track = getActiveTrack();
    if (!audio || !track) return;
    if (audio.dataset.trackId === track.id && audio.src) {
      if (autoplay) await startAudio();
      return;
    }

    const selectionVersion = (globalPlayer.selectionVersion ?? 0) + 1;
    globalPlayer.selectionVersion = selectionVersion;
    delete globalPlayer.dataset.stopped;
    audio.pause();
    audio.removeAttribute("src");
    audio.removeAttribute("data-source-label");
    audio.load();
    setProgress(0);
    if (radioCurrent) radioCurrent.textContent = "0:00";
    if (radioDuration) radioDuration.textContent = "0:30";
    setStatus("MIDNIGHT RADIO · 调频中", "正在连接官方试听源…");

    try {
      let source = track.audio ? { previewUrl:track.audio, trackViewUrl:null, sourceLabel:"站内音频 · 由本站托管" } : null;
      if (!source) {
        const preview = await searchPreview(track.query || `${track.artist} ${track.title}`, track.artist || "");
        source = preview ? { ...preview, sourceLabel:"官方试听 · Apple Music" } : null;
      }
      if (selectionVersion !== globalPlayer.selectionVersion) return;
      if (!source?.previewUrl) {
        setStatus("MIDNIGHT RADIO · 暂无音源", "暂无官方试听 · 可前往 Apple Music 搜索");
        return;
      }
      audio.dataset.trackId = track.id;
      audio.dataset.sourceLabel = source.sourceLabel;
      audio.src = source.previewUrl;
      audio.load();
      if (appleLink && source.trackViewUrl) appleLink.href = source.trackViewUrl;
      setStatus("MIDNIGHT RADIO · 待播放", source.sourceLabel);
      if (autoplay) await startAudio();
    } catch {
      if (selectionVersion === globalPlayer.selectionVersion) setStatus("MIDNIGHT RADIO · 连接失败", "试听暂时不可用 · 可前往 Apple Music 搜索");
    }
  };

  const selectTrack = async (index, autoplay = true) => {
    globalPlayer.dataset.activeIndex = String(normalizeIndex(index));
    syncTrackDisplay(true);
    await loadActiveTrack(autoplay);
  };

  const togglePlayback = async () => {
    if (!audio) return;
    if (!audio.src || audio.dataset.trackId !== getActiveTrack()?.id) await loadActiveTrack(true);
    else if (audio.paused) await startAudio();
    else audio.pause();
  };

  const stopPlayback = () => {
    if (!audio) return;
    globalPlayer.dataset.stopped = "true";
    audio.pause();
    if (audio.readyState > 0) audio.currentTime = 0;
    setProgress(0);
    if (radioCurrent) radioCurrent.textContent = "0:00";
    setStatus("MIDNIGHT RADIO · 已停止", "已停止播放");
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  };

  globalToggle?.addEventListener("click", togglePlayback, { signal });
  globalPrevious?.addEventListener("click", () => selectTrack(getActiveIndex() - 1, true), { signal });
  globalNext?.addEventListener("click", () => selectTrack(getActiveIndex() + 1, true), { signal });
  globalStop?.addEventListener("click", stopPlayback, { signal });
  radioPlayButton?.addEventListener("click", togglePlayback, { signal });
  trackButtons.forEach((button) => button.addEventListener("click", () => selectTrack(Number(button.dataset.trackIndex), true), { signal }));
  radioProgress?.addEventListener("input", () => {
    setProgress(radioProgress.value);
    if (audio && Number.isFinite(audio.duration)) audio.currentTime = (Number(radioProgress.value) / 100) * audio.duration;
  }, { signal });

  audio?.addEventListener("play", () => syncPlayingState(true), { signal });
  audio?.addEventListener("pause", () => syncPlayingState(false), { signal });
  audio?.addEventListener("loadedmetadata", () => {
    if (radioDuration) radioDuration.textContent = formatAudioTime(audio.duration);
  }, { signal });
  audio?.addEventListener("timeupdate", () => {
    if (radioCurrent) radioCurrent.textContent = formatAudioTime(audio.currentTime);
    if (Number.isFinite(audio.duration) && audio.duration > 0) setProgress((audio.currentTime / audio.duration) * 100);
  }, { signal });
  audio?.addEventListener("ended", () => selectTrack(getActiveIndex() + 1, true), { signal });

  if ("mediaSession" in navigator) {
    const mediaActions = {
      play:startAudio,
      pause:() => audio?.pause(),
      previoustrack:() => selectTrack(getActiveIndex() - 1, true),
      nexttrack:() => selectTrack(getActiveIndex() + 1, true),
      stop:stopPlayback,
    };
    Object.entries(mediaActions).forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* The action is optional in some browsers. */ }
    });
  }

  syncTrackDisplay(false);
  syncPlayingState(Boolean(audio?.src && !audio.paused));
  if (!audio?.src) loadActiveTrack(false);
}

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
}, { signal });

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }, { signal });
});

const sectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const syncActiveLink = () => {
  const hash = window.location.hash || "#top";
  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === hash);
  });
};

window.addEventListener("hashchange", syncActiveLink, { signal });

const navObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: [0, 0.25, 0.5] },
);

sections.forEach((section) => navObserver.observe(section));
};

document.addEventListener("astro:page-load", setupPage);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupPage, { once:true });
else setupPage();
