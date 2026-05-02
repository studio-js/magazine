document.documentElement.classList.add("js");

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
const progressBar = document.querySelector<HTMLElement>("[data-scroll-progress]");
const header = document.querySelector<HTMLElement>("[data-header]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setMenuOpen = (isOpen: boolean): void => {
  if (!menuButton || !mobileMenu) {
    return;
  }

  mobileMenu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
};

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    setMenuOpen(!mobileMenu.classList.contains("is-open"));
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      setMenuOpen(false);
    }
  });
}

let scrollFrame = 0;

const updateScrollState = (): void => {
  scrollFrame = 0;

  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  if (progressBar) {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(window.scrollY / maxScroll, 1);
    progressBar.style.transform = `scaleX(${progress})`;
  }
};

const requestScrollState = (): void => {
  if (scrollFrame === 0) {
    scrollFrame = window.requestAnimationFrame(updateScrollState);
  }
};

updateScrollState();
window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState);

const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (revealItems.length > 0) {
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12%" }
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

    if (!reduceMotion) {
      previewImage.animate(
        [
          { opacity: 0.62, transform: "translateY(0.45rem) scale(0.985)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ],
        { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    }
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
    const selectedCategory = button.dataset.filter || "all";

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
const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion;

if (canTilt) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -5;
      card.style.setProperty("--tilt-x", `${y}deg`);
      card.style.setProperty("--tilt-y", `${x}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

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
