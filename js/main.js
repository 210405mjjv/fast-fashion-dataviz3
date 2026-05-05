// main.js

// ── Intro / brand collage: pinned scroll-driven reveal ───────────
const introSection = document.getElementById('s-intro');
const logoItems = Array.from(document.querySelectorAll('.logo-item'));
logoItems.sort((a, b) => +a.dataset.order - +b.dataset.order);

function getIntroProgress() {
  const rect = introSection.getBoundingClientRect();
  const scrollRange = introSection.offsetHeight - window.innerHeight;

  if (scrollRange <= 0) return 0;

  return Math.max(0, Math.min(1, -rect.top / scrollRange));
}

function onIntroScroll() {
  const p = getIntroProgress();

  // Use ~85% of the section to reveal logos, then let the user exit
  const revealP = Math.max(0, Math.min(1, p / 0.85));

  logoItems.forEach((item, i) => {
    const threshold = i / logoItems.length;
    if (revealP >= threshold) {
      item.classList.add('visible');
    } else {
      item.classList.remove('visible');
    }
  });
}

window.addEventListener('scroll', onIntroScroll, { passive: true });
window.addEventListener('resize', onIntroScroll);
onIntroScroll();


// ── Line chart scroller ──────────────────────────────────────────
const lineScroller = scrollama();
lineScroller
  .setup({ step: "#s-production", offset: 0.65 })
  .onStepEnter(() => { animateLineChart(); });


// ── Growth section: scroll-driven pinned animation ───────────────
const HAUL_COUNT = 8;

const growthSection  = document.getElementById("s-growth");
const haulItems      = Array.from(document.querySelectorAll(".haul-item"));
const haulCollage    = document.getElementById("haul-collage");
const growthText2    = document.getElementById("growth-text-2");
const chartContainer = document.querySelector(".s-growth__chart");

haulItems.sort((a, b) => +a.dataset.haulIndex - +b.dataset.haulIndex);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getGrowthProgress() {
  const rect = growthSection.getBoundingClientRect();
  const scrollRange = growthSection.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  return clamp(scrolled / scrollRange, 0, 1);
}

function onGrowthScroll() {
  const p = getGrowthProgress();

  // Phase map:
  // 0.00 → 0.42 : haul images appear one by one
  // 0.42 → 0.88 : chart appears and bars rise
  // 0.88 → 1.00 : second paragraph appears

  const haulPhaseEnd = 0.42;
  const chartPhaseStart = 0.42;
  const textPhaseStart = 0.88;

  // 1) Haul images appear only through scroll progress
  const haulP = clamp(p / haulPhaseEnd, 0, 1);
  haulItems.forEach((item, i) => {
    const threshold = (i + 1) / HAUL_COUNT;
    if (haulP >= threshold) {
      item.classList.add("visible");
    } else {
      item.classList.remove("visible");
    }
  });

  // 2) Chart phase
  if (p >= chartPhaseStart) {
    haulCollage.classList.add("is-hidden");
    chartContainer.classList.add("visible");

    const barProgress = clamp(
      (Math.min(p, textPhaseStart) - chartPhaseStart) / (textPhaseStart - chartPhaseStart),
      0,
      1
    );

    if (typeof window.driveBarChart === "function") {
      window.driveBarChart(barProgress);
    }
  } else {
    haulCollage.classList.remove("is-hidden");
    chartContainer.classList.remove("visible");

    if (typeof window.driveBarChart === "function") {
      window.driveBarChart(0);
    }
  }

  // 3) Second paragraph appears only after bars are done
  if (p >= textPhaseStart) {
    growthText2.classList.add("visible");
    growthText2.removeAttribute("aria-hidden");
  } else {
    growthText2.classList.remove("visible");
    growthText2.setAttribute("aria-hidden", "true");
  }
}

window.addEventListener("scroll", onGrowthScroll, { passive: true });
window.addEventListener("resize", onGrowthScroll);
onGrowthScroll();

// ── Composition section ───────────────

const compositionSection = document.getElementById("s-materials-composition");

function getCompositionProgress() {
  const rect = compositionSection.getBoundingClientRect();
  const scrollRange = compositionSection.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  return Math.max(0, Math.min(1, scrolled / scrollRange));
}

function onCompositionScroll() {
  const p = getCompositionProgress();
  if (typeof window.driveCompositionChart === "function") {
    window.driveCompositionChart(p);
  }
}

window.addEventListener("scroll", onCompositionScroll, { passive: true });
window.addEventListener("resize", onCompositionScroll);
onCompositionScroll();