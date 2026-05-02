document.documentElement.classList.add("js");

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
const progressBar = document.querySelector<HTMLElement>("[data-scroll-progress]");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      mobileMenu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

if (progressBar) {
  const updateScrollProgress = (): void => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(window.scrollY / maxScroll, 1);
    progressBar.style.transform = `scaleX(${progress})`;
  };

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
}

const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (revealItems.length > 0) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10%" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const previewRows = document.querySelectorAll<HTMLElement>("[data-preview-class]");
const previewImage = document.querySelector<HTMLElement>("[data-preview-image]");
const previewKicker = document.querySelector<HTMLElement>("[data-preview-kicker]");
const previewTitle = document.querySelector<HTMLElement>("[data-preview-title]");

if (previewRows.length > 0 && previewImage && previewKicker && previewTitle) {
  const imageClasses = [
    "image-atelier",
    "image-signal",
    "image-interface",
    "image-thought",
    "image-material",
    "image-system",
    "image-library",
    "image-field"
  ];

  const setPreview = (row: HTMLElement): void => {
    const imageClass = row.dataset.previewClass;

    if (!imageClass) {
      return;
    }

    previewRows.forEach((previewRow) => previewRow.classList.remove("is-active"));
    row.classList.add("is-active");

    previewImage.classList.remove(...imageClasses);
    previewImage.classList.add(imageClass);
    previewKicker.textContent = row.dataset.previewKicker || "";
    previewTitle.textContent = row.dataset.previewTitle || "";
  };

  previewRows.forEach((row) => {
    row.addEventListener("mouseenter", () => setPreview(row));
    row.addEventListener("focus", () => setPreview(row));
  });

  setPreview(previewRows[0]);
}

const filterButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");

if (filterButtons.length > 0 && previewRows.length > 0) {
  const applyFilter = (button: HTMLButtonElement): void => {
      const selectedCategory = button.dataset.filter || "All";

      filterButtons.forEach((filterButton) => filterButton.classList.remove("is-active"));
      button.classList.add("is-active");

      previewRows.forEach((row) => {
        const shouldShow = selectedCategory === "all" || row.dataset.category === selectedCategory;
        row.toggleAttribute("hidden", !shouldShow);
      });

      const firstVisibleRow = Array.from(previewRows).find((row) => !row.hidden);

      if (firstVisibleRow) {
        firstVisibleRow.focus({ preventScroll: true });
      }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button));
  });

  const initialCategory = new URLSearchParams(window.location.search).get("category");
  const initialButton = Array.from(filterButtons).find((button) => button.dataset.filter === initialCategory);

  if (initialButton) {
    applyFilter(initialButton);
  }
}

const tiltCards = document.querySelectorAll<HTMLElement>("[data-tilt]");

tiltCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    card.style.setProperty("--tilt-x", `${y}deg`);
    card.style.setProperty("--tilt-y", `${x}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

const subscribeForm = document.querySelector<HTMLFormElement>(".subscribe-form");
const formMessage = document.querySelector<HTMLElement>("[data-form-message]");

if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    subscribeForm.reset();

    if (formMessage) {
      formMessage.textContent = subscribeForm.dataset.successMessage || "Subscription recorded.";
    }
  });
}
