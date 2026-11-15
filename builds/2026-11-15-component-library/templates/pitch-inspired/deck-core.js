/* Standalone presentation controller. Supports staged reveals, pacing, keyboard and touch. */
(function () {
  "use strict";
  const deck = document.querySelector("[data-deck]");
  if (!deck) return;
  const slides = Array.from(deck.querySelectorAll("[data-slide]"));
  const prevButton = document.querySelector("[data-prev]");
  const nextButton = document.querySelector("[data-next]");
  const autoButton = document.querySelector("[data-auto]");
  const count = document.querySelector("[data-count]");
  const progress = document.querySelector("[data-progress]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paceMs = Math.max(500, Number(deck.dataset.pace || 1800));
  let slideIndex = 0, revealIndex = 0, autoTimer = null;
  function revealables(slide) { return Array.from(slide.querySelectorAll("[data-reveal]")); }
  function update() {
    slides.forEach((slide, i) => {
      const active = i === slideIndex;
      slide.classList.toggle("is-current", active);
      slide.setAttribute("aria-hidden", String(!active));
      const reveals = revealables(slide);
      reveals.forEach((el, j) => {
        const shown = active && j < revealIndex;
        el.classList.toggle("is-visible", shown);
        el.setAttribute("aria-hidden", String(!shown));
        if (el.classList.contains("bars")) el.classList.toggle("is-visible", shown);
      });
    });
    const current = slides[slideIndex];
    const steps = revealables(current).length;
    const totalSteps = slides.reduce((sum, slide) => sum + Math.max(1, revealables(slide).length), 0);
    const elapsed = slides.slice(0, slideIndex).reduce((sum, slide) => sum + Math.max(1, revealables(slide).length), 0) + Math.max(1, revealIndex);
    if (count) count.textContent = String(slideIndex + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0") + (steps ? " · " + revealIndex + "/" + steps : "");
    if (progress) progress.style.width = (elapsed / totalSteps * 100) + "%";
    if (prevButton) prevButton.disabled = slideIndex === 0 && revealIndex === 0;
    if (nextButton) nextButton.disabled = slideIndex === slides.length - 1 && revealIndex >= steps;
    document.title = (current.dataset.title || "Presentation") + " · " + (slideIndex + 1) + "/" + slides.length;
  }
  function next() {
    const steps = revealables(slides[slideIndex]).length;
    if (revealIndex < steps) revealIndex++;
    else if (slideIndex < slides.length - 1) { slideIndex++; revealIndex = 0; }
    else { stopAuto(); return; }
    update();
  }
  function prev() {
    if (revealIndex > 0) revealIndex--;
    else if (slideIndex > 0) { slideIndex--; revealIndex = revealables(slides[slideIndex]).length; }
    update();
  }
  function stopAuto() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
    if (autoButton) { autoButton.textContent = "Auto pace"; autoButton.setAttribute("aria-pressed", "false"); }
  }
  function toggleAuto() {
    if (autoTimer) { stopAuto(); return; }
    if (autoButton) { autoButton.textContent = "Pause"; autoButton.setAttribute("aria-pressed", "true"); }
    autoTimer = window.setInterval(next, reduced ? Math.max(paceMs, 2200) : paceMs);
  }
  prevButton?.addEventListener("click", () => { stopAuto(); prev(); });
  nextButton?.addEventListener("click", () => { stopAuto(); next(); });
  autoButton?.addEventListener("click", toggleAuto);
  document.addEventListener("keydown", (event) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName || "")) return;
    if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(event.key)) { event.preventDefault(); stopAuto(); next(); }
    if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); stopAuto(); prev(); }
    if (event.key === "Home") { event.preventDefault(); stopAuto(); slideIndex = 0; revealIndex = 0; update(); }
    if (event.key === "End") { event.preventDefault(); stopAuto(); slideIndex = slides.length - 1; revealIndex = revealables(slides[slideIndex]).length; update(); }
    if (event.key.toLowerCase() === "p" || event.key === "Escape") { event.preventDefault(); stopAuto(); }
  });
  let startX = null;
  deck.addEventListener("touchstart", event => { startX = event.touches[0]?.clientX ?? null; }, {passive:true});
  deck.addEventListener("touchend", event => {
    if (startX === null) return;
    const diff = (event.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(diff) > 60) { stopAuto(); diff < 0 ? next() : prev(); }
    startX = null;
  }, {passive:true});
  update();
})();
