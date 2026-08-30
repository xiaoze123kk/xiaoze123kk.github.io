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
  if (prefersReducedMotion || pageIsTransitioning || event.defaultPrevented) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

  event.preventDefault();
  pageIsTransitioning = true;
  const label = destination.pathname === "/" ? "首页" : (link.textContent.trim() || "下一页");
  setTransitionCopy(label);
  pageTransition.classList.add("covering");

  try {
    window.sessionStorage.setItem("zeyuan-page-transition", JSON.stringify({ label }));
  } catch {
    // Navigation still works when browser storage is unavailable.
  }

  window.setTimeout(() => window.location.assign(destination.href), 700);
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  pageIsTransitioning = false;
  pageTransition.classList.remove("covering", "arriving", "revealed");
});

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
    });

    tiltScene.addEventListener("pointerleave", () => {
      nextTiltX = 0;
      nextTiltY = 0;
      if (!tiltFrame) tiltFrame = window.requestAnimationFrame(paintTilt);
    });
  } else {
    tiltScene.classList.add("auto-tilt");
  }
}

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
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

window.addEventListener("hashchange", syncActiveLink);

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
