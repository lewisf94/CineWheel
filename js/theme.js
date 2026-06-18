// ============================================================================
//  Theme switcher
// ----------------------------------------------------------------------------
//  A handful of palettes, applied by setting data-theme on <html> and styled
//  entirely by CSS variables (see the [data-theme="…"] blocks in styles.css).
//  The choice is remembered in localStorage. This module is self-contained and
//  does not depend on Firebase, so themes work even on the setup screen.
// ============================================================================

const THEMES = [
  { id: "noir",     name: "Cinema Noir", dots: ["#0d0d10", "#e7b54e"] },
  { id: "amethyst", name: "Amethyst",    dots: ["#14101f", "#f72585"] },
  { id: "sunset",   name: "Sunset",      dots: ["#1c1018", "#ff7e5f"] },
  { id: "sea",      name: "Deep Sea",    dots: ["#0a1220", "#22d3ee"] },
  { id: "forest",   name: "Forest",      dots: ["#0e1711", "#a7c957"] },
  { id: "day",      name: "Daylight",    dots: ["#eceef5", "#6366f1"] },
];
const KEY = "cinewheel_theme";
const DEFAULT = "noir";

function saved() {
  try { return localStorage.getItem(KEY) || DEFAULT; } catch (_) { return DEFAULT; }
}
function remember(id) {
  try { localStorage.setItem(KEY, id); } catch (_) {}
}

function apply(id) {
  if (!THEMES.some((t) => t.id === id)) id = DEFAULT;
  document.documentElement.setAttribute("data-theme", id);
  const meta = document.querySelector('meta[name="theme-color"]');
  const theme = THEMES.find((t) => t.id === id);
  if (meta && theme) meta.setAttribute("content", theme.dots[0]);
}

function buildPicker() {
  const btn = document.getElementById("theme-btn");
  if (!btn) return;

  const pop = document.createElement("div");
  pop.className = "theme-pop hidden";
  pop.innerHTML = THEMES.map(
    (t) => `
    <button class="theme-opt" data-theme-id="${t.id}">
      <span class="theme-swatch" style="background:${t.dots[0]}"><i style="background:${t.dots[1]}"></i></span>
      <span>${t.name}</span>
      <span class="theme-check">✓</span>
    </button>`
  ).join("");
  document.body.appendChild(pop);

  const markActive = () => {
    const cur = document.documentElement.getAttribute("data-theme");
    pop.querySelectorAll(".theme-opt").forEach((o) =>
      o.classList.toggle("active", o.dataset.themeId === cur)
    );
  };
  const place = () => {
    const r = btn.getBoundingClientRect();
    pop.style.top = `${r.bottom + 8}px`;
    pop.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  };
  const open = () => { place(); markActive(); pop.classList.remove("hidden"); };
  const close = () => pop.classList.add("hidden");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    pop.classList.contains("hidden") ? open() : close();
  });
  pop.addEventListener("click", (e) => {
    const opt = e.target.closest(".theme-opt");
    if (!opt) return;
    apply(opt.dataset.themeId);
    remember(opt.dataset.themeId);
    markActive();
    close();
  });
  document.addEventListener("click", (e) => {
    if (e.target !== btn && !pop.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  window.addEventListener("resize", () => { if (!pop.classList.contains("hidden")) place(); });
}

// Apply the saved theme as early as possible, then wire up the picker.
apply(saved());
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildPicker);
} else {
  buildPicker();
}
