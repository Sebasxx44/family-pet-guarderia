// ==================== COMPOSABLE ====================
export const useCanineMotion = () => {
  // ==================== ELEMENTS AND STATE ====================
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.querySelector(".motion-toggle");
  const journeys = [
    ...document.querySelectorAll("[data-canine-scroll]"),
  ].filter((element) => element instanceof HTMLElement);
  let paused = preference.matches;
  let scheduled = false;

  // ==================== SCROLL MOTION ====================
  const updateJourneys = () => {
    scheduled = false;
    journeys.forEach((journey) => {
      if (paused || document.hidden) {
        journey.classList.remove("is-running");
        if (!journey.style.getPropertyValue("--run-progress")) {
          journey.style.setProperty("--run-progress", "0.35");
        }
        return;
      }
      const bounds = journey.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight - bounds.top) /
            (window.innerHeight + bounds.height),
        ),
      );
      journey.style.setProperty("--run-progress", String(progress));
      journey.classList.toggle(
        "is-running",
        bounds.bottom > 0 && bounds.top < window.innerHeight,
      );
    });
  };

  const requestUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateJourneys);
  };

  // ==================== MOTION PREFERENCE ====================
  const updatePreference = () => {
    document.documentElement.classList.toggle("motion-off", paused);
    if (toggle instanceof HTMLButtonElement) {
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused
        ? "Activar animaciones"
        : "Pausar animaciones";
    }
    requestUpdate();
  };

  toggle?.addEventListener("click", () => {
    paused = !paused;
    updatePreference();
  });

  preference.addEventListener("change", () => {
    paused = preference.matches;
    updatePreference();
  });

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  document.addEventListener("visibilitychange", requestUpdate);
  updatePreference();

  // ==================== SECTION REVEALS ====================
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 },
  );

  document.querySelectorAll(".reveal").forEach((element, index) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
    observer.observe(element);
  });
  document.documentElement.classList.add("motion-ready");
};
