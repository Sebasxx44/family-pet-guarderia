// ==================== COMPONENT ====================
export const ActionHeaderTA = () => {
  // ==================== ELEMENTS ====================
  const header = document.querySelector(".site-header");
  const navigation = document.querySelector("#main-nav");
  const toggle = document.querySelector(".menu-toggle");
  if (
    !(header instanceof HTMLElement) ||
    !(navigation instanceof HTMLElement) ||
    !(toggle instanceof HTMLButtonElement)
  )
    return;

  // ==================== NAVIGATION ACTIONS ====================
  const closeNavigation = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    navigation.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    navigation.classList.toggle("is-open", open);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      toggle.getAttribute("aria-expanded") !== "true"
    )
      return;
    closeNavigation();
    toggle.focus();
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (navigation.contains(event.target) || toggle.contains(event.target))
      return;
    closeNavigation();
  });

  // ==================== HEADER STATE ====================
  const updateHeader = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", closeNavigation, { passive: true });
  updateHeader();
};
