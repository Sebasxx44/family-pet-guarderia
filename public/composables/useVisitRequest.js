// ==================== COMPOSABLE ====================
export const useVisitRequest = () => {
  // ==================== ELEMENTS ====================
  const form = document.querySelector("#visit-form");
  const parentName = document.querySelector("#parent-name");
  const dogName = document.querySelector("#dog-name");
  const service = document.querySelector("#service");
  const message = document.querySelector("#message");
  const status = document.querySelector("#form-status");
  if (
    !(form instanceof HTMLFormElement) ||
    !(parentName instanceof HTMLInputElement) ||
    !(dogName instanceof HTMLInputElement) ||
    !(service instanceof HTMLSelectElement) ||
    !(message instanceof HTMLTextAreaElement)
  )
    return;

  // ==================== SERVICE PRESELECTION ====================
  const requestedService =
    new URLSearchParams(window.location.search).get("servicio") || "";
  const normalizedService = requestedService
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
  const selectedService =
    normalizedService === "guarderia"
      ? "Guardería"
      : normalizedService === "hotel"
        ? "Hotel"
        : normalizedService === "pasadia"
          ? "Pasadía"
          : null;
  if (selectedService) service.value = selectedService;

  // ==================== FORM VALIDATION ====================
  parentName.addEventListener("input", () => parentName.setCustomValidity(""));
  dogName.addEventListener("input", () => dogName.setCustomValidity(""));

  // ==================== WHATSAPP COMPOSITION ====================
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const owner = parentName.value.trim();
    const companion = dogName.value.trim();
    parentName.setCustomValidity(
      owner ? "" : "Escribe tu nombre para continuar.",
    );
    dogName.setCustomValidity(
      companion ? "" : "Escribe el nombre de tu perro para continuar.",
    );
    if (!form.reportValidity()) return;

    const interest =
      service.value === "Orientación"
        ? "recibir orientación sobre el mejor plan para él"
        : `conocer el servicio de ${service.value}`;
    const details = message.value.trim();
    const summary = [
      `Hola, Family Pet. Soy ${owner} y mi perro se llama ${companion}. Quisiera ${interest}.`,
      details,
      "¿Me ayudan con tarifas, disponibilidad y los próximos pasos?",
    ]
      .filter(Boolean)
      .join("\n\n");
    const whatsapp = new URL("https://wa.me/573148664384");
    whatsapp.searchParams.set("text", summary);
    window.open(whatsapp.href, "_blank", "noopener,noreferrer");
    if (status instanceof HTMLElement) {
      status.textContent =
        "Tu mensaje está preparado en WhatsApp. Revísalo antes de enviarlo.";
    }
  });
};
