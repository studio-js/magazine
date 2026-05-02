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

const setImageBlockVisual = (element: HTMLElement, visualClass: string, imageUrl = ""): void => {
  element.classList.remove(...imageClasses);
  element.classList.toggle("has-custom-image", imageUrl.length > 0);

  if (imageUrl.length > 0) {
    element.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
    return;
  }

  element.style.backgroundImage = "";
  element.classList.add(visualClass || "image-material");
};

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

const writer = document.querySelector<HTMLElement>("[data-write-editor]");

if (writer) {
  type RailMode = "default" | "image" | "text";
  type AdminLocalizedText = { ko: string; en: string };
  type AdminLocalizedList = { ko: string[]; en: string[] };
  type AdminSection = { heading: AdminLocalizedText; paragraphs: AdminLocalizedList };
  type AdminArticle = {
    slug: string;
    title: AdminLocalizedText;
    subtitle: AdminLocalizedText;
    deck: AdminLocalizedText;
    category: string;
    subcategoryKey: string;
    subcategoryKeys: string[];
    subcategory: AdminLocalizedText;
    date: string;
    issue: string;
    readTime: AdminLocalizedText;
    location: AdminLocalizedText;
    heroClass: string;
    heroImage?: string;
    hideHeroImage?: boolean;
    tags: AdminLocalizedList;
    excerpt: AdminLocalizedText;
    quote: AdminLocalizedText;
    railMode?: RailMode;
    railTitle?: AdminLocalizedText;
    railText?: AdminLocalizedText;
    sections: AdminSection[];
  };

  const storageKey = writer.dataset.writeStorageKey || "the-thing-admin-articles";
  const authKey = `${storageKey}-auth`;
  const adminPassword = writer.dataset.adminPassword || "promise";
  const lock = writer.querySelector<HTMLElement>("[data-admin-lock]");
  const loginForm = writer.querySelector<HTMLFormElement>("[data-admin-login]");
  const loginInput = writer.querySelector<HTMLInputElement>("[data-admin-password-input]");
  const loginError = writer.querySelector<HTMLElement>("[data-admin-login-error]");
  const articleData = writer.querySelector<HTMLScriptElement>("[data-write-articles]");
  const adminList = writer.querySelector<HTMLElement>("[data-admin-list]");
  const adminFilters = writer.querySelector<HTMLElement>("[data-admin-filters]");
  const adminCount = writer.querySelector<HTMLElement>("[data-admin-count]");
  const currentTitle = writer.querySelector<HTMLElement>("[data-admin-current-title]");
  const outputArea = writer.querySelector<HTMLTextAreaElement>("[data-write-output]");
  const status = writer.querySelector<HTMLElement>("[data-write-status]");
  const categorySelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="category"]');
  const subcategorySelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="subcategory"]');
  const railModeSelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="railMode"]');
  const imageUrlField = writer.querySelector<HTMLElement>(".writer-image-url-field");
  const heroShell = writer.querySelector<HTMLElement>("[data-write-hero-shell]");
  const heroPreview = writer.querySelector<HTMLElement>("[data-write-hero-preview]");
  const railVisual = writer.querySelector<HTMLElement>("[data-write-rail-visual]");
  const railTitle = writer.querySelector<HTMLElement>("[data-write-rail-title]");
  const railText = writer.querySelector<HTMLElement>("[data-write-rail-text]");
  const rail = writer.querySelector<HTMLElement>("[data-write-rail]");
  const kicker = writer.querySelector<HTMLElement>("[data-write-kicker]");
  let saveTimer = 0;
  let currentIndex = 0;
  let activeCategoryFilter = "all";

  const quoteTs = (value: string): string => JSON.stringify(value.trim());
  const splitTags = (value: string): string[] => value.split(",").map((tag) => tag.trim()).filter(Boolean);
  const toSlug = (value: string): string => value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-article";

  const setStatus = (message: string): void => {
    if (status) {
      status.textContent = message;
    }
  };

  const today = (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const fallbackArticle = (): AdminArticle => ({
    slug: "new-article",
    title: { ko: "새 기사 제목", en: "New Article Title" },
    subtitle: { ko: "새 기사 부제", en: "New article subtitle" },
    deck: { ko: "이 문장을 클릭해서 기사 덱을 작성합니다.", en: "Click this sentence to write the article deck." },
    category: "art",
    subcategoryKey: "exhibitions",
    subcategoryKeys: ["exhibitions"],
    subcategory: { ko: "전시", en: "Exhibitions" },
    date: today(),
    issue: "Issue 01",
    readTime: { ko: "6분 읽기", en: "6 min read" },
    location: { ko: "서울", en: "Seoul" },
    heroClass: "image-material",
    heroImage: "",
    hideHeroImage: false,
    tags: { ko: ["태그"], en: ["Tag"] },
    excerpt: { ko: "목록에 표시될 요약 문장입니다.", en: "Summary sentence for archive lists." },
    quote: { ko: "기사 상단 인용문을 이곳에 작성합니다.", en: "Write the pull quote here." },
    railMode: "default",
    railTitle: { ko: "좌측 레일 제목", en: "Rail title" },
    railText: { ko: "좌측 레일 설명을 이곳에서 직접 수정합니다.", en: "Edit the rail text here." },
    sections: [
      {
        heading: { ko: "첫 번째 섹션", en: "First Section" },
        paragraphs: { ko: ["첫 번째 문단을 작성합니다."], en: ["Write the first paragraph."] }
      }
    ]
  });

  const firstSubcategoryForCategory = (category: string): HTMLOptionElement | null =>
    Array.from(subcategorySelect?.options || []).find((option) => option.dataset.category === category) || null;

  const fallbackArticleForFilter = (): AdminArticle => {
    const article = fallbackArticle();

    if (activeCategoryFilter === "all") {
      return article;
    }

    const subcategory = firstSubcategoryForCategory(activeCategoryFilter);
    article.category = activeCategoryFilter;
    article.subcategoryKey = subcategory?.value || article.subcategoryKey;
    article.subcategoryKeys = [article.subcategoryKey];
    article.subcategory = {
      ko: subcategory?.dataset.labelKo || article.subcategory.ko,
      en: subcategory?.dataset.labelEn || article.subcategory.en
    };

    return article;
  };

  const articleMatchesFilter = (article: AdminArticle): boolean =>
    activeCategoryFilter === "all" || article.category === activeCategoryFilter;

  const normalizeArticle = (article: Partial<AdminArticle>): AdminArticle => {
    const fallback = fallbackArticle();
    const firstSection = article.sections?.[0];

    return {
      ...fallback,
      ...article,
      title: { ...fallback.title, ...article.title },
      subtitle: { ...fallback.subtitle, ...article.subtitle },
      deck: { ...fallback.deck, ...article.deck },
      subcategory: { ...fallback.subcategory, ...article.subcategory },
      readTime: { ...fallback.readTime, ...article.readTime },
      location: { ...fallback.location, ...article.location },
      heroImage: article.heroImage || "",
      hideHeroImage: Boolean(article.hideHeroImage),
      tags: { ...fallback.tags, ...article.tags },
      excerpt: { ...fallback.excerpt, ...article.excerpt },
      quote: { ...fallback.quote, ...article.quote },
      railMode: article.railMode || "default",
      railTitle: article.railTitle || firstSection?.heading || fallback.railTitle,
      railText: article.railText || {
        ko: firstSection?.paragraphs.ko[0] || fallback.railText?.ko || "",
        en: firstSection?.paragraphs.en[0] || fallback.railText?.en || ""
      },
      sections: article.sections && article.sections.length > 0 ? article.sections : fallback.sections
    };
  };

  const initialArticles = (): AdminArticle[] => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      try {
        return (JSON.parse(stored) as AdminArticle[]).map(normalizeArticle);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    try {
      return (JSON.parse(articleData?.textContent || "[]") as AdminArticle[]).map(normalizeArticle);
    } catch {
      return [fallbackArticle()];
    }
  };

  let adminArticles = initialArticles();

  if (adminArticles.length === 0) {
    adminArticles = [fallbackArticle()];
  }

  const unlockAdmin = (): void => {
    writer.classList.add("is-admin-unlocked");
    lock?.setAttribute("hidden", "true");
    window.sessionStorage.setItem(authKey, "true");
  };

  if (window.sessionStorage.getItem(authKey) === "true") {
    unlockAdmin();
  } else {
    loginInput?.focus();
  }

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (loginInput?.value === adminPassword) {
      unlockAdmin();
      setStatus("관리자 잠금이 해제되었습니다.");
      return;
    }

    if (loginError) {
      loginError.textContent = "비밀번호가 맞지 않습니다.";
    }
  });

  const metaField = (key: string): HTMLInputElement | HTMLSelectElement | null =>
    writer.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-write-meta="${key}"]`);

  const textField = (key: string): HTMLElement | null =>
    writer.querySelector<HTMLElement>(`[data-write-text="${key}"]`);

  const metaValue = (key: string): string => metaField(key)?.value.trim() || "";
  const textValue = (key: string): string => textField(key)?.innerText.trim() || "";

  const writeText = (key: string, value: string): void => {
    const field = textField(key);

    if (field) {
      field.innerText = value;
    }
  };

  const createParagraph = (text: string): HTMLParagraphElement => {
    const paragraph = document.createElement("p");
    paragraph.contentEditable = "true";
    paragraph.spellcheck = true;
    paragraph.dataset.writeParagraph = "";
    paragraph.innerText = text;
    return paragraph;
  };

  const createSection = (heading = "새 섹션 제목", paragraphs = ["새 문단을 입력하세요."]): HTMLElement => {
    const section = document.createElement("section");
    section.className = "article-section writer-section";
    section.dataset.writeSection = "";

    const title = document.createElement("h2");
    title.contentEditable = "true";
    title.spellcheck = true;
    title.dataset.writeSectionHeading = "";
    title.innerText = heading;
    section.append(title);

    paragraphs.forEach((paragraph) => section.append(createParagraph(paragraph)));

    const tools = document.createElement("div");
    tools.className = "writer-section-tools";
    tools.contentEditable = "false";

    const addParagraph = document.createElement("button");
    addParagraph.type = "button";
    addParagraph.dataset.writeAddParagraph = "";
    addParagraph.textContent = "문단 추가";

    const removeSection = document.createElement("button");
    removeSection.type = "button";
    removeSection.dataset.writeRemoveSection = "";
    removeSection.textContent = "섹션 삭제";

    tools.append(addParagraph, removeSection);
    section.append(tools);
    return section;
  };

  const sectionsContainer = (): HTMLElement | null => writer.querySelector<HTMLElement>("[data-write-body]");
  const sections = (): HTMLElement[] => Array.from(writer.querySelectorAll<HTMLElement>("[data-write-section]"));

  const sectionData = (): Array<{ heading: string; paragraphs: string[] }> => sections().map((section) => ({
    heading: section.querySelector<HTMLElement>("[data-write-section-heading]")?.innerText.trim() || "",
    paragraphs: Array.from(section.querySelectorAll<HTMLElement>("[data-write-paragraph]")).map((paragraph) => paragraph.innerText.trim()).filter(Boolean)
  }));

  const selectedSubcategory = (): HTMLOptionElement | null =>
    subcategorySelect?.selectedOptions.item(0) || null;

  const updateSubcategoryOptions = (): void => {
    if (!categorySelect || !subcategorySelect) {
      return;
    }

    const category = categorySelect.value;
    const visibleOptions = Array.from(subcategorySelect.options).filter((option) => option.dataset.category === category);

    Array.from(subcategorySelect.options).forEach((option) => {
      const isVisible = option.dataset.category === category;
      option.hidden = !isVisible;
      option.disabled = !isVisible;
    });

    if (!visibleOptions.some((option) => option.selected)) {
      subcategorySelect.value = visibleOptions[0]?.value || "";
    }
  };

  const categoryLabel = (): string => categorySelect?.selectedOptions.item(0)?.textContent?.trim() || "";
  const subcategoryLabel = (): string => selectedSubcategory()?.textContent?.trim() || "";

  const updateVisualClass = (): void => {
    const heroClass = metaValue("heroClass") || "image-material";
    const imageMode = metaValue("imageMode") || "visual";
    const heroImage = metaValue("heroImage");
    const useCustomImage = imageMode === "custom" && heroImage.length > 0;
    const isHidden = imageMode === "none";

    heroShell?.classList.toggle("is-hidden", isHidden);
    imageUrlField?.classList.toggle("is-visible", imageMode === "custom");

    [heroPreview, railVisual].forEach((element) => {
      if (!element) {
        return;
      }

      setImageBlockVisual(element, heroClass, useCustomImage ? heroImage : "");
    });
  };

  const updateRailMode = (): void => {
    const mode = (railModeSelect?.value || "default") as RailMode;
    rail?.classList.remove("article-side-default", "article-side-image", "article-side-text");
    rail?.classList.add(`article-side-${mode}`);
  };

  const formatDateForPreview = (value: string): string => value.replace(/-/g, ".");

  const currentBase = (): AdminArticle => adminArticles[currentIndex] || fallbackArticle();

  const formArticle = (): AdminArticle => {
    const base = currentBase();
    const subcategory = selectedSubcategory();
    const subcategoryKey = metaValue("subcategory") || base.subcategoryKey;
    const tags = splitTags(metaValue("tags"));
    const sectionValues = sectionData();
    const nextSections = sectionValues.map((section, index): AdminSection => {
      const previous = base.sections[index];
      return {
        heading: { ko: section.heading || previous?.heading.ko || "섹션 제목", en: previous?.heading.en || "TODO: English section heading" },
        paragraphs: {
          ko: section.paragraphs.length > 0 ? section.paragraphs : previous?.paragraphs.ko || [""],
          en: previous?.paragraphs.en || section.paragraphs.map(() => "TODO: English paragraph")
        }
      };
    });

    return normalizeArticle({
      ...base,
      slug: toSlug(metaValue("slug") || textValue("title") || base.slug),
      title: { ko: textValue("title") || base.title.ko, en: base.title.en },
      subtitle: { ko: textValue("deck") || base.subtitle.ko, en: base.subtitle.en },
      deck: { ko: textValue("deck") || base.deck.ko, en: base.deck.en },
      category: metaValue("category") || base.category,
      subcategoryKey,
      subcategoryKeys: [subcategoryKey],
      subcategory: {
        ko: subcategory?.dataset.labelKo || base.subcategory.ko,
        en: subcategory?.dataset.labelEn || base.subcategory.en
      },
      date: metaValue("date") || base.date,
      readTime: { ko: metaValue("readTime") || base.readTime.ko, en: base.readTime.en },
      location: { ko: metaValue("location") || base.location.ko, en: base.location.en },
      heroClass: metaValue("heroClass") || base.heroClass,
      heroImage: metaValue("imageMode") === "custom" ? metaValue("heroImage") : "",
      hideHeroImage: metaValue("imageMode") === "none",
      tags: { ko: tags.length > 0 ? tags : base.tags.ko, en: base.tags.en },
      excerpt: { ko: textValue("deck") || base.excerpt.ko, en: base.excerpt.en },
      quote: { ko: textValue("quote") || base.quote.ko, en: base.quote.en },
      railMode: (metaValue("railMode") || "default") as RailMode,
      railTitle: { ko: textValue("railTitle") || base.railTitle?.ko || "", en: base.railTitle?.en || base.title.en },
      railText: { ko: textValue("railText") || base.railText?.ko || "", en: base.railText?.en || base.deck.en },
      sections: nextSections.length > 0 ? nextSections : base.sections
    });
  };

  const articleCode = (article: AdminArticle): string => `import type { Article } from "../../types";\n\nexport const article = ${JSON.stringify(article, null, 2)} satisfies Article;\n`;

  const articlesArrayCode = (): string => `import type { Article } from "../types";\n\nexport const articles = ${JSON.stringify(adminArticles, null, 2)} satisfies Article[];\n`;

  const generateArticleObject = (): string => {
    return articleCode(formArticle());
  };

  const saveCollection = (message = "자동 저장됨"): void => {
    window.localStorage.setItem(storageKey, JSON.stringify(adminArticles));
    setStatus(message);
  };

  const renderAdminList = (): void => {
    if (!adminList) {
      return;
    }

    const visibleArticles = adminArticles
      .map((article, index) => ({ article, index }))
      .filter(({ article }) => articleMatchesFilter(article));

    adminList.innerHTML = visibleArticles.length > 0 ? visibleArticles.map(({ article, index }) => `
      <button type="button" class="admin-list-item ${index === currentIndex ? "is-active" : ""}" data-admin-index="${index}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <strong>${article.title.ko}</strong>
        <small>${article.category} / ${article.subcategoryKey}</small>
      </button>`).join("") : `<p class="admin-empty">이 카테고리의 기사가 아직 없습니다. 새 기사를 만들면 현재 필터에 맞춰 시작합니다.</p>`;

    if (adminCount) {
      adminCount.textContent = activeCategoryFilter === "all" ? String(adminArticles.length) : `${visibleArticles.length}/${adminArticles.length}`;
    }

    adminFilters?.querySelectorAll<HTMLElement>("[data-admin-filter]").forEach((button) => {
      const filter = button.dataset.adminFilter || "all";
      const isActive = filter === activeCategoryFilter;
      const count = filter === "all" ? adminArticles.length : adminArticles.filter((article) => article.category === filter).length;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      const countElement = button.querySelector("small");
      if (countElement) {
        countElement.textContent = String(count);
      }
    });
  };

  const writeMeta = (key: string, value: string): void => {
    const field = metaField(key);

    if (field) {
      field.value = value;
    }
  };

  const applyArticle = (index: number): void => {
    currentIndex = Math.max(0, Math.min(index, adminArticles.length - 1));
    const article = currentBase();

    writeMeta("slug", article.slug);
    writeMeta("date", article.date);
    writeMeta("category", article.category);
    updateSubcategoryOptions();
    writeMeta("subcategory", article.subcategoryKey);
    writeMeta("heroClass", article.heroClass);
    writeMeta("imageMode", article.hideHeroImage ? "none" : article.heroImage ? "custom" : "visual");
    writeMeta("heroImage", article.heroImage || "");
    writeMeta("railMode", article.railMode || "default");
    writeMeta("readTime", article.readTime.ko);
    writeMeta("location", article.location.ko);
    writeMeta("tags", article.tags.ko.join(", "));

    writeText("title", article.title.ko);
    writeText("deck", article.deck.ko);
    writeText("quote", article.quote.ko);
    writeText("railTitle", article.railTitle?.ko || article.sections[0]?.heading.ko || article.title.ko);
    writeText("railText", article.railText?.ko || article.sections[0]?.paragraphs.ko[0] || article.deck.ko);

    const container = sectionsContainer();

    if (container) {
      container.querySelectorAll("[data-write-section]").forEach((section) => section.remove());
      article.sections.forEach((section) => container.append(createSection(section.heading.ko, section.paragraphs.ko)));
    }

    renderAdminList();
    updatePreview();
  };

  const updatePreview = (): void => {
    updateSubcategoryOptions();
    updateVisualClass();
    updateRailMode();

    if (kicker) {
      kicker.textContent = `${categoryLabel()} / ${subcategoryLabel()}`;
    }

    writer.querySelector<HTMLElement>('[data-write-preview="date"]')!.textContent = formatDateForPreview(metaValue("date"));
    writer.querySelector<HTMLElement>('[data-write-preview="location"]')!.textContent = metaValue("location");
    writer.querySelector<HTMLElement>('[data-write-preview="readTime"]')!.textContent = metaValue("readTime");
    writer.querySelector<HTMLElement>('[data-write-preview="tags"]')!.textContent = splitTags(metaValue("tags")).join(" / ");

    currentTitle && (currentTitle.textContent = `${String(currentIndex + 1).padStart(2, "0")} · ${textValue("title") || metaValue("slug")}`);

    if (outputArea) {
      outputArea.value = generateArticleObject();
    }
  };

  const saveState = (): void => {
    adminArticles[currentIndex] = formArticle();
    renderAdminList();
    saveCollection();
  };

  const scheduleSave = (): void => {
    updatePreview();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveState, 250);
  };

  applyArticle(0);

  writer.addEventListener("input", scheduleSave);
  writer.addEventListener("change", scheduleSave);
  writer.addEventListener("click", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest("[data-write-add-section]")) {
      sectionsContainer()?.append(createSection());
      scheduleSave();
      return;
    }

    const section = target.closest<HTMLElement>("[data-write-section]");

    if (target.closest("[data-write-add-paragraph]") && section) {
      section.querySelector(".writer-section-tools")?.before(createParagraph("새 문단을 입력하세요."));
      scheduleSave();
      return;
    }

    if (target.closest("[data-write-remove-section]") && section && sections().length > 1) {
      section.remove();
      scheduleSave();
      return;
    }

    if (target.closest("[data-write-copy]")) {
      adminArticles[currentIndex] = formArticle();
      const articleObject = generateArticleObject();
      outputArea && (outputArea.value = articleObject);
      try {
        await navigator.clipboard.writeText(articleObject);
      } catch {
        outputArea?.focus();
        outputArea?.select();
        document.execCommand("copy");
      }
      setStatus("Article 객체를 복사했습니다.");
      return;
    }

    if (target.closest("[data-write-download]")) {
      adminArticles[currentIndex] = formArticle();
      const articleObject = generateArticleObject();
      const blob = new Blob([articleObject], { type: "text/typescript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${toSlug(metaValue("slug") || textValue("title"))}.ts`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("파일을 내려받았습니다.");
      return;
    }

    if (target.closest("[data-write-reset]") && window.confirm("로컬 변경 내용을 모두 지우고 원래 기사 목록을 다시 불러올까요?")) {
      window.localStorage.removeItem(storageKey);
      window.location.reload();
      return;
    }

    const filterButton = target.closest<HTMLElement>("[data-admin-filter]");

    if (filterButton) {
      adminArticles[currentIndex] = formArticle();
      activeCategoryFilter = filterButton.dataset.adminFilter || "all";

      if (!articleMatchesFilter(adminArticles[currentIndex])) {
        const nextIndex = adminArticles.findIndex(articleMatchesFilter);

        if (nextIndex >= 0) {
          applyArticle(nextIndex);
          saveCollection("카테고리 필터를 적용했습니다.");
          return;
        }
      }

      renderAdminList();
      updatePreview();
      saveCollection("카테고리 필터를 적용했습니다.");
      return;
    }

    const listItem = target.closest<HTMLElement>("[data-admin-index]");

    if (listItem) {
      adminArticles[currentIndex] = formArticle();
      applyArticle(Number(listItem.dataset.adminIndex || 0));
      saveCollection("선택한 기사를 불러왔습니다.");
      return;
    }

    if (target.closest("[data-admin-new]")) {
      adminArticles[currentIndex] = formArticle();
      adminArticles.unshift(fallbackArticleForFilter());
      applyArticle(0);
      saveCollection("새 기사를 만들었습니다.");
      return;
    }

    if (target.closest("[data-admin-delete]") && window.confirm("현재 기사를 삭제할까요?")) {
      adminArticles.splice(currentIndex, 1);

      if (adminArticles.length === 0) {
        adminArticles.push(fallbackArticle());
      }

      const nextFilteredIndex = activeCategoryFilter === "all" ? -1 : adminArticles.findIndex(articleMatchesFilter);
      applyArticle(nextFilteredIndex >= 0 ? nextFilteredIndex : Math.min(currentIndex, adminArticles.length - 1));
      saveCollection("기사를 삭제했습니다.");
      return;
    }

    if (target.closest("[data-admin-move-up]") && currentIndex > 0) {
      adminArticles[currentIndex] = formArticle();
      [adminArticles[currentIndex - 1], adminArticles[currentIndex]] = [adminArticles[currentIndex], adminArticles[currentIndex - 1]];
      applyArticle(currentIndex - 1);
      saveCollection("순서를 위로 이동했습니다.");
      return;
    }

    if (target.closest("[data-admin-move-down]") && currentIndex < adminArticles.length - 1) {
      adminArticles[currentIndex] = formArticle();
      [adminArticles[currentIndex + 1], adminArticles[currentIndex]] = [adminArticles[currentIndex], adminArticles[currentIndex + 1]];
      applyArticle(currentIndex + 1);
      saveCollection("순서를 아래로 이동했습니다.");
      return;
    }

    if (target.closest("[data-admin-copy-all]")) {
      adminArticles[currentIndex] = formArticle();
      const code = articlesArrayCode();
      outputArea && (outputArea.value = code);

      try {
        await navigator.clipboard.writeText(code);
      } catch {
        outputArea?.focus();
        outputArea?.select();
        document.execCommand("copy");
      }

      saveCollection("전체 articles 배열을 복사했습니다.");
      return;
    }

    if (target.closest("[data-admin-download-all]")) {
      adminArticles[currentIndex] = formArticle();
      const blob = new Blob([articlesArrayCode()], { type: "text/typescript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "articles.ts";
      link.click();
      URL.revokeObjectURL(url);
      saveCollection("전체 파일을 내려받았습니다.");
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

    setImageBlockVisual(previewImage, imageClass, row.dataset.previewImage || "");
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
    const imageUrl = link.dataset.featureImage || "";
    const kicker = link.dataset.featureKicker;
    const title = link.dataset.featureTitle;

    if (!imageClass || !kicker || !title) {
      return;
    }

    featureCard.href = link.href;
    setImageBlockVisual(featureImage, imageClass, imageUrl);
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
        setImageBlockVisual(articleRailVisual, visualClass, section.dataset.railImage || "");
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
