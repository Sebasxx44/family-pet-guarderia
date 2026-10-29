// ==================== COMPOSABLE ====================
export const usePhotoGallery = () => {
  // ==================== ELEMENTS AND STATE ====================
  const dialog = document.querySelector("#photo-dialog");
  const image = document.querySelector("#dialog-image");
  const title = document.querySelector("#photo-title");
  if (
    !(dialog instanceof HTMLDialogElement) ||
    !(image instanceof HTMLImageElement) ||
    !(title instanceof HTMLElement)
  )
    return;
  /** @type {HTMLButtonElement | null} */
  let trigger = null;

  // ==================== DIALOG ACTIONS ====================
  const closePhoto = () => dialog.close();
  dialog.querySelector(".dialog-close")?.addEventListener("click", closePhoto);
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    trigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      closePhoto();
  });

  // ==================== PHOTO SELECTION ====================
  document.querySelectorAll("[data-photo]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener("click", () => {
      const photo = button.dataset.photo;
      if (!photo) return;
      trigger = button;
      image.src = photo;
      image.alt =
        button.querySelector("img")?.alt ||
        "Una aventura de la manada de Family Pet";
      title.textContent = button.dataset.caption || "La vida en Family Pet";
      dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
};
