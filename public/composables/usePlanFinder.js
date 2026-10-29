// ==================== COMPOSABLE ====================
export const usePlanFinder = () => {
  // ==================== ELEMENTS ====================
  const name = document.querySelector("#plan-name");
  const description = document.querySelector("#plan-description");
  const link = document.querySelector("#plan-link");
  const choices = [...document.querySelectorAll("[data-plan]")].filter(
    (element) => element instanceof HTMLButtonElement,
  );
  if (
    !(name instanceof HTMLElement) ||
    !(description instanceof HTMLElement) ||
    !(link instanceof HTMLAnchorElement)
  )
    return;

  // ==================== SERVICE SUGGESTIONS ====================
  /** @type {Record<import("@/types").ServiceName, import("@/types").ServiceSuggestion>} */
  const suggestions = {
    Guardería: {
      service: "Guardería",
      description:
        "Una rutina de juego, socialización y descanso durante el día, entre buenos amigos.",
      url: "/contacto/?servicio=Guarder%C3%ADa#hablemos",
    },
    Hotel: {
      service: "Hotel",
      description:
        "Compañía durante estancias nocturnas o largas, con descanso y cuidado en un entorno campestre.",
      url: "/contacto/?servicio=Hotel#hablemos",
    },
    Pasadía: {
      service: "Pasadía",
      description:
        "Un día de campo, juego y descanso, con transporte de ida y regreso.",
      url: "/contacto/?servicio=Pasad%C3%ADa#hablemos",
    },
  };

  // ==================== SELECTION ACTION ====================
  /** @param {import("@/types").ServiceName} service */
  const selectPlan = (service) => {
    const suggestion = suggestions[service];
    name.textContent = suggestion.service;
    description.textContent = suggestion.description;
    link.href = suggestion.url;
    choices.forEach((choice) => {
      choice.setAttribute(
        "aria-pressed",
        String(choice.dataset.plan === service),
      );
    });
  };

  choices.forEach((choice) => {
    choice.addEventListener("click", () => {
      const service = choice.dataset.plan;
      if (
        service !== "Guardería" &&
        service !== "Hotel" &&
        service !== "Pasadía"
      )
        return;
      selectPlan(service);
    });
  });

  const initialService = choices.find(
    (choice) => choice.getAttribute("aria-pressed") === "true",
  )?.dataset.plan;
  selectPlan(
    initialService === "Guardería" || initialService === "Hotel"
      ? initialService
      : "Pasadía",
  );
};
