document.documentElement.classList.add("js");

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
const progressBar = document.querySelector<HTMLElement>("[data-scroll-progress]");
const header = document.querySelector<HTMLElement>("[data-header]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollMotionItems = document.querySelectorAll<HTMLElement>("[data-scroll-motion]");
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

const animateTextSwap = (elements: HTMLElement[]): void => {
  if (reduceMotion) {
    return;
  }

  elements.forEach((element, index) => {
    element.animate(
      [
        { opacity: 0.54 },
        { opacity: 1 }
      ],
      { duration: 130, delay: index * 12, easing: "linear" }
    );
  });
};

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

const desktopNav = document.querySelector<HTMLElement>(".site-header .nav");
const desktopNavItems = desktopNav
  ? Array.from(desktopNav.querySelectorAll<HTMLElement>(":scope > .nav-item"))
  : [];

if (desktopNav && desktopNavItems.length > 0) {
  let navCloseTimer = 0;

  const clearNavCloseTimer = (): void => {
    if (navCloseTimer !== 0) {
      window.clearTimeout(navCloseTimer);
      navCloseTimer = 0;
    }
  };

  const closeSubnav = (): void => {
    clearNavCloseTimer();
    desktopNav.classList.remove("is-submenu-active");
    desktopNavItems.forEach((item) => item.classList.remove("is-submenu-open"));
  };

  const openSubnav = (item: HTMLElement): void => {
    clearNavCloseTimer();
    desktopNav.classList.add("is-submenu-active");
    desktopNavItems.forEach((navItem) => navItem.classList.toggle("is-submenu-open", navItem === item));
  };

  const scheduleSubnavClose = (): void => {
    clearNavCloseTimer();
    navCloseTimer = window.setTimeout(closeSubnav, 220);
  };

  desktopNavItems.forEach((item) => {
    const submenu = item.querySelector<HTMLElement>(".nav-submenu");

    item.addEventListener("pointerenter", () => openSubnav(item));
    item.addEventListener("pointerleave", scheduleSubnavClose);
    item.addEventListener("focusin", () => openSubnav(item));
    item.addEventListener("focusout", (event) => {
      const nextTarget = event.relatedTarget;

      if (!(nextTarget instanceof Node) || !item.contains(nextTarget)) {
        scheduleSubnavClose();
      }
    });

    submenu?.addEventListener("pointerenter", () => openSubnav(item));
    submenu?.addEventListener("pointerleave", scheduleSubnavClose);
  });

  desktopNav.addEventListener("pointerleave", scheduleSubnavClose);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSubnav();
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

  if (!reduceMotion) {
    scrollMotionItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const shift = Math.max(-1, Math.min(1, (itemCenter - viewportCenter) / window.innerHeight));
      item.style.setProperty("--scroll-shift", shift.toFixed(3));
    });
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
let setArchivePreview: ((row: HTMLElement) => void) | null = null;

if (previewRows.length > 0 && previewImage && previewKicker && previewTitle) {
  setArchivePreview = (row: HTMLElement): void => {
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
    animateTextSwap([previewKicker, previewTitle]);

    if (!reduceMotion) {
      previewImage.animate(
        [
          { filter: "contrast(0.94)", opacity: 0.72 },
          { filter: "contrast(1)", opacity: 1 }
        ],
        { duration: 160, easing: "linear" }
      );
    }
  };

  previewRows.forEach((row) => {
    row.addEventListener("pointerenter", () => setArchivePreview?.(row));
    row.addEventListener("focus", () => setArchivePreview?.(row));
  });

  setArchivePreview(previewRows[0]);
}

const featureCard = document.querySelector<HTMLAnchorElement>("[data-feature-card]");
const featureImage = document.querySelector<HTMLElement>("[data-feature-image]");
const featureKicker = document.querySelector<HTMLElement>("[data-feature-kicker]");
const featureTitle = document.querySelector<HTMLElement>("[data-feature-title]");
const featureLinks = document.querySelectorAll<HTMLAnchorElement>("[data-feature-link]");

if (featureCard && featureImage && featureKicker && featureTitle && featureLinks.length > 0) {
  const setFeaturePreview = (link: HTMLAnchorElement): void => {
    const imageClass = link.dataset.featureClass;
    const kicker = link.dataset.featureKicker;
    const title = link.dataset.featureTitle;

    if (!imageClass || !kicker || !title) {
      return;
    }

    featureCard.href = link.href;
    featureImage.classList.remove(...imageClasses);
    featureImage.classList.add(imageClass);
    featureKicker.textContent = kicker;
    featureTitle.textContent = title;
    animateTextSwap([featureKicker, featureTitle]);

    featureLinks.forEach((featureLink) => featureLink.classList.toggle("is-active", featureLink === link));

    if (!reduceMotion) {
      featureImage.animate(
        [
          { filter: "contrast(0.92)", opacity: 0.7 },
          { filter: "contrast(1)", opacity: 1 }
        ],
        { duration: 150, easing: "linear" }
      );
    }
  };

  featureLinks.forEach((link) => {
    link.addEventListener("pointerenter", () => setFeaturePreview(link));
    link.addEventListener("focus", () => setFeaturePreview(link));
  });
}

const scrollSections = document.querySelectorAll<HTMLElement>("[data-scroll-section]");

if (scrollSections.length > 0) {
  if ("IntersectionObserver" in window && !reduceMotion) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-current-section", entry.isIntersecting);
        });
      },
      { rootMargin: "-34% 0px -48%" }
    );

    scrollSections.forEach((section) => sectionObserver.observe(section));
  } else {
    scrollSections.forEach((section) => section.classList.add("is-current-section"));
  }
}

const articleRail = document.querySelector<HTMLElement>("[data-article-rail]");
const articleRailNo = document.querySelector<HTMLElement>("[data-article-rail-no]");
const articleRailTitle = document.querySelector<HTMLElement>("[data-article-rail-title]");
const articleRailText = document.querySelector<HTMLElement>("[data-article-rail-text]");
const articleRailVisual = document.querySelector<HTMLElement>("[data-article-rail-visual]");
const articleSections = document.querySelectorAll<HTMLElement>("[data-article-section]");

if (articleRail && articleRailNo && articleRailTitle && articleRailText && articleSections.length > 0) {
  let activeArticleSection: HTMLElement | null = null;
  let articleRailFrame = 0;

  const setArticleRail = (section: HTMLElement): void => {
    if (activeArticleSection === section) {
      return;
    }

    activeArticleSection = section;
    articleRailNo.textContent = section.dataset.railNo || "";
    articleRailTitle.textContent = section.dataset.railTitle || "";
    articleRailText.textContent = section.dataset.railText || "";

    if (articleRailVisual) {
      const visualClass = section.dataset.railVisual;
      if (visualClass) {
        articleRailVisual.classList.remove(...imageClasses);
        articleRailVisual.classList.add(visualClass);
      }
    }

    articleSections.forEach((articleSection) => articleSection.classList.toggle("is-active-section", articleSection === section));

    if (!reduceMotion) {
      animateTextSwap([articleRailNo, articleRailTitle, articleRailText]);
    }
  };

  const getArticleRailActivationPoint = (): number => {
    const activationRatio = window.innerWidth <= 960 ? 0.52 : 0.38;
    return Math.max(170, window.innerHeight * activationRatio);
  };

  const updateArticleRailFromScroll = (): void => {
    articleRailFrame = 0;

    const activationPoint = getArticleRailActivationPoint();
    let activeSection = articleSections[0];

    articleSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationPoint) {
        activeSection = section;
      }
    });

    setArticleRail(activeSection);
  };

  const requestArticleRailUpdate = (): void => {
    if (articleRailFrame === 0) {
      articleRailFrame = window.requestAnimationFrame(updateArticleRailFromScroll);
    }
  };

  updateArticleRailFromScroll();
  window.addEventListener("scroll", requestArticleRailUpdate, { passive: true });
  window.addEventListener("resize", requestArticleRailUpdate);
}

const filterButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter]");
const filterPanels = document.querySelectorAll<HTMLElement>("[data-filter-panel]");
const filterStatus = document.querySelector<HTMLElement>("[data-filter-status]");
const archiveBoard = document.querySelector<HTMLElement>("[data-archive-board]");

if (filterButtons.length > 0) {
  const isKorean = document.documentElement.lang === "ko";

  const applyFilter = (button: HTMLButtonElement, updateUrl = true): void => {
    const selectedCategory = button.dataset.filter || "all";
    const selectedLabel = button.dataset.filterLabel || button.textContent?.trim() || selectedCategory;

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    const visibleRows: HTMLElement[] = [];
    previewRows.forEach((row) => {
      const shouldShow = selectedCategory === "all" || row.dataset.category === selectedCategory;
      row.toggleAttribute("hidden", !shouldShow);

      if (shouldShow) {
        visibleRows.push(row);
      }
    });

    filterPanels.forEach((panel) => {
      const isActive = panel.dataset.filterPanel === selectedCategory;
      panel.classList.toggle("is-active", isActive);
      panel.toggleAttribute("hidden", !isActive);
    });

    if (filterStatus) {
      filterStatus.textContent = `${selectedLabel} · ${visibleRows.length} ${isKorean ? "개의 글 표시 중" : "articles showing"}`;
    }

    if (archiveBoard) {
      archiveBoard.classList.toggle("is-filtered", selectedCategory !== "all");
      archiveBoard.dataset.activeCategory = selectedCategory;
    }

    if (visibleRows[0]) {
      setArchivePreview?.(visibleRows[0]);

      if (!reduceMotion) {
        visibleRows.forEach((row, index) => {
          row.animate(
            [
              { opacity: 0.28, transform: "translateY(0.35rem)" },
              { opacity: 1, transform: "translateY(0)" }
            ],
            { duration: 260, delay: Math.min(index, 5) * 28, easing: "cubic-bezier(.2,.8,.2,1)" }
          );
        });
      }
    }

    if (updateUrl && window.location.pathname.includes("/archive")) {
      const url = new URL(window.location.href);

      if (selectedCategory === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", selectedCategory);
      }

      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button));
  });

  const initialCategory = new URLSearchParams(window.location.search).get("category");
  const initialButton = Array.from(filterButtons).find((button) => button.dataset.filter === initialCategory);
  const allButton = Array.from(filterButtons).find((button) => button.dataset.filter === "all");
  const fallbackButton = initialButton || allButton || filterButtons.item(0);

  if (fallbackButton) {
    applyFilter(fallbackButton, false);
  }
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
