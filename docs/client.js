"use strict";
document.documentElement.classList.add("js");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const progressBar = document.querySelector("[data-scroll-progress]");
const header = document.querySelector("[data-header]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollMotionItems = document.querySelectorAll("[data-scroll-motion]");
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
const setImageBlockVisual = (element, visualClass, imageUrl = "") => {
    element.classList.remove(...imageClasses);
    element.classList.toggle("has-custom-image", imageUrl.length > 0);
    if (imageUrl.length > 0) {
        element.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
        return;
    }
    element.style.backgroundImage = "";
    element.classList.add(visualClass || "image-material");
};
const currentImageClass = (element) => imageClasses.find((imageClass) => element.classList.contains(imageClass)) || imageClasses[0];
const nextImageClass = (currentClass, direction) => {
    const currentIndex = imageClasses.indexOf(currentClass);
    const nextIndex = (currentIndex + direction + imageClasses.length) % imageClasses.length;
    return imageClasses[nextIndex] || imageClasses[0];
};
const clickDirection = (event, element) => {
    const rect = element.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2 ? -1 : 1;
};
const cycleGeneratedVisual = (element, direction) => {
    const nextClass = nextImageClass(currentImageClass(element), direction);
    setImageBlockVisual(element, nextClass);
    return nextClass;
};
document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || target.closest("[data-write-editor]")) {
        return;
    }
    const visual = target.closest("[data-visual-cycle]");
    if (!visual || visual.classList.contains("has-custom-image")) {
        return;
    }
    event.preventDefault();
    cycleGeneratedVisual(visual, clickDirection(event, visual));
});
document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("[data-visual-cycle]") || target.closest("[data-write-editor]") || target.classList.contains("has-custom-image")) {
        return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Enter" && event.key !== " ") {
        return;
    }
    event.preventDefault();
    cycleGeneratedVisual(target, event.key === "ArrowLeft" ? -1 : 1);
});
const animateTextSwap = (elements) => {
    if (reduceMotion) {
        return;
    }
    elements.forEach((element, index) => {
        element.animate([
            { opacity: 0.54 },
            { opacity: 1 }
        ], { duration: 130, delay: index * 12, easing: "linear" });
    });
};
const setMenuOpen = (isOpen) => {
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
const desktopNav = document.querySelector(".site-header .nav");
const desktopNavItems = desktopNav
    ? Array.from(desktopNav.querySelectorAll(":scope > .nav-item"))
    : [];
if (desktopNav && desktopNavItems.length > 0) {
    let navCloseTimer = 0;
    let activeSubnavItem = null;
    const clearNavCloseTimer = () => {
        if (navCloseTimer !== 0) {
            window.clearTimeout(navCloseTimer);
            navCloseTimer = 0;
        }
    };
    const closeSubnav = () => {
        clearNavCloseTimer();
        activeSubnavItem = null;
        document.documentElement.style.setProperty("--active-nav-height", "0px");
        header?.classList.remove("is-nav-expanded");
        desktopNav.classList.remove("is-submenu-active");
        desktopNavItems.forEach((item) => item.classList.remove("is-submenu-open"));
    };
    const openSubnav = (item) => {
        const submenu = item.querySelector(".nav-submenu");
        const submenuHeight = submenu ? Math.ceil(submenu.getBoundingClientRect().height) : 0;
        clearNavCloseTimer();
        activeSubnavItem = item;
        document.documentElement.style.setProperty("--active-nav-height", `${submenuHeight}px`);
        header?.classList.add("is-nav-expanded");
        desktopNav.classList.add("is-submenu-active");
        desktopNavItems.forEach((navItem) => navItem.classList.toggle("is-submenu-open", navItem === item));
    };
    const scheduleSubnavClose = () => {
        clearNavCloseTimer();
        navCloseTimer = window.setTimeout(closeSubnav, 220);
    };
    desktopNavItems.forEach((item) => {
        const submenu = item.querySelector(".nav-submenu");
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
    window.addEventListener("resize", () => {
        if (window.innerWidth <= 960) {
            closeSubnav();
            return;
        }
        if (activeSubnavItem) {
            openSubnav(activeSubnavItem);
        }
    });
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSubnav();
        }
    });
}
const writer = document.querySelector("[data-write-editor]");
if (writer) {
    const storageKey = writer.dataset.writeStorageKey || "the-thing-admin-articles";
    const issueStorageKey = `${storageKey}-issue`;
    const modeStorageKey = `${storageKey}-mode`;
    const authKey = `${storageKey}-auth`;
    const adminPassword = writer.dataset.adminPassword || "promise";
    const lock = writer.querySelector("[data-admin-lock]");
    const loginForm = writer.querySelector("[data-admin-login]");
    const loginInput = writer.querySelector("[data-admin-password-input]");
    const loginError = writer.querySelector("[data-admin-login-error]");
    const articleData = writer.querySelector("[data-write-articles]");
    const issueData = writer.querySelector("[data-write-issue]");
    const issueList = writer.querySelector("[data-write-issue-list]");
    const issueCount = writer.querySelector("[data-write-issue-count]");
    const issueSummaryTitle = writer.querySelector("[data-write-issue-summary-title]");
    const issueSummarySubtitle = writer.querySelector("[data-write-issue-summary-subtitle]");
    const issueSummaryMeta = writer.querySelector("[data-write-issue-summary-meta]");
    const adminList = writer.querySelector("[data-admin-list]");
    const adminFilters = writer.querySelector("[data-admin-filters]");
    const adminCount = writer.querySelector("[data-admin-count]");
    const currentTitle = writer.querySelector("[data-admin-current-title]");
    const outputArea = writer.querySelector("[data-write-output]");
    const status = writer.querySelector("[data-write-status]");
    const modeButtons = writer.querySelectorAll("[data-write-mode-button]");
    const categorySelect = writer.querySelector('[data-write-meta="category"]');
    const subcategorySelect = writer.querySelector('[data-write-meta="subcategory"]');
    const railModeSelect = writer.querySelector('[data-write-meta="railMode"]');
    const imageUrlField = writer.querySelector(".writer-image-url-field");
    const heroShell = writer.querySelector("[data-write-hero-shell]");
    const heroPreview = writer.querySelector("[data-write-hero-preview]");
    const rail = writer.querySelector("[data-write-rail]");
    const kicker = writer.querySelector("[data-write-kicker]");
    const issueEditor = writer.querySelector("[data-write-issue-editor]");
    const issueStatus = writer.querySelector("[data-write-issue-status]");
    const issueTitle = writer.querySelector("[data-write-issue-title]");
    const issueFeatures = writer.querySelector("[data-write-issue-features]");
    const issueCredits = writer.querySelector("[data-write-issue-credits]");
    const issueOutput = writer.querySelector("[data-write-issue-output]");
    let saveTimer = 0;
    let issueSaveTimer = 0;
    let currentIndex = 0;
    let currentIssueIndex = 0;
    let activeCategoryFilter = "all";
    const quoteTs = (value) => JSON.stringify(value.trim());
    const splitTags = (value) => value.split(",").map((tag) => tag.trim()).filter(Boolean);
    const toSlug = (value) => value
        .trim()
        .toLowerCase()
        .replace(/["']/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "new-article";
    const setStatus = (message) => {
        if (status) {
            status.textContent = message;
        }
    };
    const setIssueStatus = (message) => {
        if (issueStatus) {
            issueStatus.textContent = message;
        }
    };
    const setWriteMode = (mode) => {
        writer.dataset.writeMode = mode;
        window.localStorage.setItem(modeStorageKey, mode);
        modeButtons.forEach((button) => {
            const isActive = button.dataset.writeModeButton === mode;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    };
    const escapeHtmlClient = (value) => value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    const linesFromTextarea = (value) => value.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const today = () => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    };
    const fallbackArticle = () => ({
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
        railClass: "image-material",
        railImage: "",
        hideRailImage: false,
        railTitle: { ko: "좌측 레일 제목", en: "Rail title" },
        railText: { ko: "좌측 레일 설명을 이곳에서 직접 수정합니다.", en: "Edit the rail text here." },
        sections: [
            {
                heading: { ko: "첫 번째 섹션", en: "First Section" },
                paragraphs: { ko: ["첫 번째 문단을 작성합니다."], en: ["Write the first paragraph."] },
                railTitle: { ko: "좌측 레일 제목", en: "Rail title" },
                railText: { ko: "좌측 레일 설명을 이곳에서 직접 수정합니다.", en: "Edit the rail text here." },
                railClass: "image-material",
                railImage: "",
                hideRailImage: false,
                sectionImageClass: "",
                sectionImage: "",
                sectionImageCaption: { ko: "", en: "" },
                hideSectionImage: true
            }
        ]
    });
    const fallbackIssueFeature = () => ({
        slug: "new-scene",
        role: { ko: "Scene", en: "Scene" },
        title: { ko: "새 이슈 장면", en: "New Issue Scene" },
        intro: { ko: "이 장면의 한 줄 소개를 작성합니다.", en: "Write a one-line introduction for this scene." },
        excerpt: { ko: "이슈 목차에 보일 요약을 작성합니다.", en: "Write the summary shown in the issue table of contents." },
        body: { ko: ["첫 번째 문단을 작성합니다."], en: ["Write the first paragraph."] },
        credit: { ko: "Editorial Desk", en: "Editorial Desk" },
        location: { ko: "Editorial", en: "Editorial" },
        readTime: { ko: "노트", en: "Note" },
        heroClass: "image-material"
    });
    const fallbackIssue = () => ({
        number: "No. 01",
        title: { ko: "Screen of Things", en: "Screen of Things" },
        subtitle: { ko: "이슈 부제를 작성합니다.", en: "Write the issue subtitle." },
        deck: { ko: "이슈 덱을 작성합니다.", en: "Write the issue deck." },
        date: { ko: "2026년 5월", en: "May 2026" },
        format: { ko: "온라인 에디션", en: "Online edition" },
        availability: { ko: "오픈 액세스", en: "Open access" },
        coverCredit: { ko: "커버 크레딧", en: "Cover credit" },
        editorNote: { ko: "에디터 노트를 작성합니다.", en: "Write the editor's note." },
        credits: [{ label: { ko: "편집", en: "Editor" }, value: { ko: "The Thing Editorial Desk", en: "The Thing Editorial Desk" } }],
        features: [fallbackIssueFeature()]
    });
    const normalizeIssueFeature = (feature) => {
        const fallback = fallbackIssueFeature();
        return {
            ...fallback,
            ...feature,
            role: { ...fallback.role, ...feature.role },
            title: { ...fallback.title, ...feature.title },
            intro: { ...fallback.intro, ...feature.intro },
            excerpt: { ...fallback.excerpt, ...feature.excerpt },
            body: { ...fallback.body, ...feature.body },
            credit: { ...fallback.credit, ...feature.credit },
            location: { ...fallback.location, ...feature.location },
            readTime: { ...fallback.readTime, ...feature.readTime },
            heroClass: feature.heroClass || fallback.heroClass
        };
    };
    const normalizeIssue = (issue) => {
        const fallback = fallbackIssue();
        return {
            ...fallback,
            ...issue,
            title: { ...fallback.title, ...issue.title },
            subtitle: { ...fallback.subtitle, ...issue.subtitle },
            deck: { ...fallback.deck, ...issue.deck },
            date: { ...fallback.date, ...issue.date },
            format: { ...fallback.format, ...issue.format },
            availability: { ...fallback.availability, ...issue.availability },
            coverCredit: { ...fallback.coverCredit, ...issue.coverCredit },
            editorNote: { ...fallback.editorNote, ...issue.editorNote },
            credits: (issue.credits && issue.credits.length > 0 ? issue.credits : fallback.credits).map((credit) => ({
                label: { ko: credit.label?.ko || "", en: credit.label?.en || "" },
                value: { ko: credit.value?.ko || "", en: credit.value?.en || "" }
            })),
            features: (issue.features && issue.features.length > 0 ? issue.features : fallback.features).map(normalizeIssueFeature)
        };
    };
    const firstSubcategoryForCategory = (category) => Array.from(subcategorySelect?.options || []).find((option) => option.dataset.category === category) || null;
    const fallbackArticleForFilter = () => {
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
    const articleMatchesFilter = (article) => activeCategoryFilter === "all" || article.category === activeCategoryFilter;
    const normalizeArticle = (article) => {
        const fallback = fallbackArticle();
        const firstSection = article.sections?.[0];
        const articleSections = article.sections && article.sections.length > 0 ? article.sections : fallback.sections;
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
            railClass: article.railClass || article.heroClass || fallback.railClass,
            railImage: article.railImage || "",
            hideRailImage: Boolean(article.hideRailImage),
            railTitle: article.railTitle || firstSection?.heading || fallback.railTitle,
            railText: article.railText || {
                ko: firstSection?.paragraphs.ko[0] || fallback.railText?.ko || "",
                en: firstSection?.paragraphs.en[0] || fallback.railText?.en || ""
            },
            sections: articleSections.map((section, index) => {
                const fallbackSection = fallback.sections[index] || fallback.sections[0];
                const heading = { ...fallbackSection.heading, ...section.heading };
                const paragraphs = { ...fallbackSection.paragraphs, ...section.paragraphs };
                const sectionRailTitle = section.railTitle || (index === 0 ? article.railTitle : undefined) || heading;
                const sectionRailText = section.railText || (index === 0 ? article.railText : undefined) || {
                    ko: paragraphs.ko[0] || fallbackSection.railText?.ko || "",
                    en: paragraphs.en[0] || fallbackSection.railText?.en || ""
                };
                const sectionImageCaption = section.sectionImageCaption || fallbackSection.sectionImageCaption || { ko: "", en: "" };
                return {
                    ...fallbackSection,
                    ...section,
                    heading,
                    paragraphs,
                    railTitle: sectionRailTitle,
                    railText: sectionRailText,
                    railClass: section.railClass || article.railClass || article.heroClass || fallback.railClass,
                    railImage: section.railImage || "",
                    hideRailImage: Boolean(section.hideRailImage),
                    sectionImageClass: section.sectionImageClass || "",
                    sectionImage: section.sectionImage || "",
                    sectionImageCaption,
                    hideSectionImage: section.hideSectionImage === true || (!section.sectionImage && !section.sectionImageClass)
                };
            })
        };
    };
    const initialArticles = () => {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
            try {
                return JSON.parse(stored).map(normalizeArticle);
            }
            catch {
                window.localStorage.removeItem(storageKey);
            }
        }
        try {
            return JSON.parse(articleData?.textContent || "[]").map(normalizeArticle);
        }
        catch {
            return [fallbackArticle()];
        }
    };
    const normalizeIssueCollection = (value) => {
        const issues = Array.isArray(value)
            ? value
            : value && typeof value === "object"
                ? [value]
                : [];
        const normalizedIssues = issues.map((issue) => normalizeIssue(issue));
        return normalizedIssues.length > 0 ? normalizedIssues : [fallbackIssue()];
    };
    const initialIssues = () => {
        const stored = window.localStorage.getItem(issueStorageKey);
        if (stored) {
            try {
                return normalizeIssueCollection(JSON.parse(stored));
            }
            catch {
                window.localStorage.removeItem(issueStorageKey);
            }
        }
        try {
            return normalizeIssueCollection(JSON.parse(issueData?.textContent || "[]"));
        }
        catch {
            return [fallbackIssue()];
        }
    };
    let adminArticles = initialArticles();
    let adminIssues = initialIssues();
    let adminIssue = adminIssues[0] || fallbackIssue();
    if (adminArticles.length === 0) {
        adminArticles = [fallbackArticle()];
    }
    if (adminIssues.length === 0) {
        adminIssues = [fallbackIssue()];
        adminIssue = adminIssues[0];
    }
    const unlockAdmin = () => {
        writer.classList.add("is-admin-unlocked");
        lock?.setAttribute("hidden", "true");
        window.sessionStorage.setItem(authKey, "true");
    };
    if (window.sessionStorage.getItem(authKey) === "true") {
        unlockAdmin();
    }
    else {
        loginInput?.focus();
    }
    setWriteMode(window.localStorage.getItem(modeStorageKey) === "issue" ? "issue" : "article");
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
    const metaField = (key) => writer.querySelector(`[data-write-meta="${key}"]`);
    const textField = (key) => writer.querySelector(`[data-write-text="${key}"]`);
    const metaValue = (key) => metaField(key)?.value.trim() || "";
    const textValue = (key) => textField(key)?.innerText.trim() || "";
    const issueField = (key) => issueEditor?.querySelector(`[data-write-issue-field="${key}"]`) || null;
    const issueFieldValue = (key) => issueField(key)?.value.trim() || "";
    const writeIssueField = (key, value) => {
        const field = issueField(key);
        if (field) {
            field.value = value;
        }
    };
    const writeText = (key, value) => {
        const field = textField(key);
        if (field) {
            field.innerText = value;
        }
    };
    const createSelect = (options, value) => {
        const select = document.createElement("select");
        options.forEach((optionValue) => {
            const option = document.createElement("option");
            option.value = optionValue.value;
            option.textContent = optionValue.label;
            option.selected = optionValue.value === value;
            select.append(option);
        });
        return select;
    };
    const imageClassOptions = imageClasses.map((imageClass) => ({ value: imageClass, label: imageClass }));
    const cycleSelectVisual = (select, direction) => {
        if (!select) {
            return "image-material";
        }
        select.value = nextImageClass(select.value || "image-material", direction);
        return select.value;
    };
    const imageClassOptionsHtml = (selectedClass) => imageClasses
        .map((imageClass) => `<option value="${imageClass}"${imageClass === selectedClass ? " selected" : ""}>${imageClass}</option>`)
        .join("");
    const issueFeatureField = (feature, key) => {
        const [group, locale] = key.split(".");
        const value = feature[group];
        return escapeHtmlClient(value?.[locale] || "");
    };
    const issueCreditField = (credit, key) => {
        const [group, locale] = key.split(".");
        const value = credit[group];
        return escapeHtmlClient(value?.[locale] || "");
    };
    const renderIssueFeatures = () => {
        if (!issueFeatures) {
            return;
        }
        issueFeatures.innerHTML = adminIssue.features.map((feature, index) => `
      <article class="issue-feature-editor" data-write-issue-feature>
        <div class="issue-feature-editor-head">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtmlClient(feature.title.ko || feature.title.en || feature.slug)}</strong>
          <button type="button" data-write-issue-feature-remove>삭제</button>
        </div>
        <div class="issue-feature-editor-grid">
          <button type="button" class="issue-feature-visual-button" data-write-issue-feature-preview aria-label="이슈 장면 비주얼 좌우 클릭으로 변경">
            <span class="image-block ${escapeHtmlClient(feature.heroClass)}"></span>
            <small>Left / Right visual</small>
          </button>
          <label><span>Slug</span><input type="text" value="${escapeHtmlClient(feature.slug)}" data-write-issue-feature-field="slug" /></label>
          <label><span>Role KR</span><input type="text" value="${issueFeatureField(feature, "role.ko")}" data-write-issue-feature-field="role.ko" /></label>
          <label><span>Role EN</span><input type="text" value="${issueFeatureField(feature, "role.en")}" data-write-issue-feature-field="role.en" /></label>
          <label><span>Visual</span><select data-write-issue-feature-field="heroClass">${imageClassOptionsHtml(feature.heroClass)}</select></label>
          <label><span>Title KR</span><input type="text" value="${issueFeatureField(feature, "title.ko")}" data-write-issue-feature-field="title.ko" /></label>
          <label><span>Title EN</span><input type="text" value="${issueFeatureField(feature, "title.en")}" data-write-issue-feature-field="title.en" /></label>
          <label><span>Intro KR</span><textarea rows="2" data-write-issue-feature-field="intro.ko">${issueFeatureField(feature, "intro.ko")}</textarea></label>
          <label><span>Intro EN</span><textarea rows="2" data-write-issue-feature-field="intro.en">${issueFeatureField(feature, "intro.en")}</textarea></label>
          <label><span>Excerpt KR</span><textarea rows="2" data-write-issue-feature-field="excerpt.ko">${issueFeatureField(feature, "excerpt.ko")}</textarea></label>
          <label><span>Excerpt EN</span><textarea rows="2" data-write-issue-feature-field="excerpt.en">${issueFeatureField(feature, "excerpt.en")}</textarea></label>
          <label><span>Body KR</span><textarea rows="4" data-write-issue-feature-field="body.ko">${escapeHtmlClient(feature.body.ko.join("\n"))}</textarea></label>
          <label><span>Body EN</span><textarea rows="4" data-write-issue-feature-field="body.en">${escapeHtmlClient(feature.body.en.join("\n"))}</textarea></label>
          <label><span>Credit KR</span><input type="text" value="${issueFeatureField(feature, "credit.ko")}" data-write-issue-feature-field="credit.ko" /></label>
          <label><span>Credit EN</span><input type="text" value="${issueFeatureField(feature, "credit.en")}" data-write-issue-feature-field="credit.en" /></label>
          <label><span>Location KR</span><input type="text" value="${issueFeatureField(feature, "location.ko")}" data-write-issue-feature-field="location.ko" /></label>
          <label><span>Location EN</span><input type="text" value="${issueFeatureField(feature, "location.en")}" data-write-issue-feature-field="location.en" /></label>
          <label><span>Read KR</span><input type="text" value="${issueFeatureField(feature, "readTime.ko")}" data-write-issue-feature-field="readTime.ko" /></label>
          <label><span>Read EN</span><input type="text" value="${issueFeatureField(feature, "readTime.en")}" data-write-issue-feature-field="readTime.en" /></label>
        </div>
      </article>`).join("");
    };
    const renderIssueCredits = () => {
        if (!issueCredits) {
            return;
        }
        issueCredits.innerHTML = adminIssue.credits.map((credit, index) => `
      <div class="issue-credit-editor" data-write-issue-credit>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <label><small>Label KR</small><input type="text" value="${issueCreditField(credit, "label.ko")}" data-write-issue-credit-field="label.ko" /></label>
        <label><small>Label EN</small><input type="text" value="${issueCreditField(credit, "label.en")}" data-write-issue-credit-field="label.en" /></label>
        <label><small>Value KR</small><input type="text" value="${issueCreditField(credit, "value.ko")}" data-write-issue-credit-field="value.ko" /></label>
        <label><small>Value EN</small><input type="text" value="${issueCreditField(credit, "value.en")}" data-write-issue-credit-field="value.en" /></label>
        <button type="button" data-write-issue-credit-remove>삭제</button>
      </div>`).join("");
    };
    const renderIssueList = () => {
        if (!issueList) {
            return;
        }
        issueList.innerHTML = adminIssues.map((issue, index) => `
      <button type="button" class="issue-admin-list-item ${index === currentIssueIndex ? "is-active" : ""}" data-write-issue-index="${index}" aria-pressed="${index === currentIssueIndex ? "true" : "false"}">
        <span><strong>${escapeHtmlClient(issue.number)}</strong><small>${index === 0 ? "Latest" : `Stack ${String(index + 1).padStart(2, "0")}`}</small></span>
        <strong>${escapeHtmlClient(issue.title.ko || issue.title.en || issue.number)}</strong>
        <small>${escapeHtmlClient(issue.date.ko || issue.date.en)} / ${issue.features.length} scenes</small>
      </button>`).join("");
        if (issueCount) {
            issueCount.textContent = String(adminIssues.length);
        }
    };
    const updateIssueSummary = () => {
        if (issueSummaryTitle) {
            issueSummaryTitle.textContent = adminIssue.title.ko || adminIssue.title.en || adminIssue.number;
        }
        if (issueSummarySubtitle) {
            issueSummarySubtitle.textContent = adminIssue.subtitle.ko || adminIssue.subtitle.en;
        }
        if (issueSummaryMeta) {
            issueSummaryMeta.textContent = `장면 ${adminIssue.features.length} / 크레딧 ${adminIssue.credits.length}`;
        }
    };
    const collectIssueFeature = (feature) => {
        const field = (key) => feature.querySelector(`[data-write-issue-feature-field="${key}"]`)?.value.trim() || "";
        return normalizeIssueFeature({
            slug: toSlug(field("slug") || field("title.en") || field("title.ko") || "new-scene"),
            role: { ko: field("role.ko"), en: field("role.en") },
            title: { ko: field("title.ko"), en: field("title.en") },
            intro: { ko: field("intro.ko"), en: field("intro.en") },
            excerpt: { ko: field("excerpt.ko"), en: field("excerpt.en") },
            body: { ko: linesFromTextarea(field("body.ko")), en: linesFromTextarea(field("body.en")) },
            credit: { ko: field("credit.ko"), en: field("credit.en") },
            location: { ko: field("location.ko"), en: field("location.en") },
            readTime: { ko: field("readTime.ko"), en: field("readTime.en") },
            heroClass: field("heroClass") || "image-material"
        });
    };
    const collectIssueCredit = (credit) => {
        const field = (key) => credit.querySelector(`[data-write-issue-credit-field="${key}"]`)?.value.trim() || "";
        return {
            label: { ko: field("label.ko"), en: field("label.en") },
            value: { ko: field("value.ko"), en: field("value.en") }
        };
    };
    const formIssue = () => normalizeIssue({
        number: issueFieldValue("number") || adminIssue.number,
        title: { ko: issueFieldValue("title.ko"), en: issueFieldValue("title.en") },
        subtitle: { ko: issueFieldValue("subtitle.ko"), en: issueFieldValue("subtitle.en") },
        deck: { ko: issueFieldValue("deck.ko"), en: issueFieldValue("deck.en") },
        date: { ko: issueFieldValue("date.ko"), en: issueFieldValue("date.en") },
        format: { ko: issueFieldValue("format.ko"), en: issueFieldValue("format.en") },
        availability: { ko: issueFieldValue("availability.ko"), en: issueFieldValue("availability.en") },
        coverCredit: { ko: issueFieldValue("coverCredit.ko"), en: issueFieldValue("coverCredit.en") },
        editorNote: { ko: issueFieldValue("editorNote.ko"), en: issueFieldValue("editorNote.en") },
        credits: Array.from(issueCredits?.querySelectorAll("[data-write-issue-credit]") || []).map(collectIssueCredit),
        features: Array.from(issueFeatures?.querySelectorAll("[data-write-issue-feature]") || []).map(collectIssueFeature)
    });
    const createParagraph = (text) => {
        const paragraph = document.createElement("p");
        paragraph.contentEditable = "true";
        paragraph.spellcheck = true;
        paragraph.dataset.writeParagraph = "";
        paragraph.innerText = text;
        return paragraph;
    };
    const createSection = (heading = "새 섹션 제목", paragraphs = ["새 문단을 입력하세요."], railClass = "image-material", railImage = "", hideRailImage = false, railTitle = "좌측 레일 제목", railText = "좌측 레일 설명을 이곳에서 직접 수정합니다.", sectionImageClass = "", sectionImage = "", hideSectionImage = true, sectionImageCaption = "") => {
        const section = document.createElement("section");
        section.className = "article-section writer-section";
        section.dataset.writeSection = "";
        const railCard = document.createElement("aside");
        railCard.className = "writer-section-rail-card";
        railCard.dataset.writeSectionRailCard = "";
        const railNo = document.createElement("span");
        railNo.className = "article-rail-no";
        railNo.dataset.writeSectionRailNo = "";
        const railImageButton = document.createElement("button");
        railImageButton.type = "button";
        railImageButton.className = "writer-section-rail-image";
        railImageButton.dataset.writeSectionRailImageButton = "";
        railImageButton.setAttribute("aria-label", "섹션 레일 이미지 수정");
        const railPreview = document.createElement("span");
        railPreview.className = `image-block ${railClass}`;
        railPreview.dataset.writeSectionRailPreview = "";
        const railImageHint = document.createElement("span");
        railImageHint.textContent = "이미지 클릭";
        railImageButton.append(railPreview, railImageHint);
        const railCardTitle = document.createElement("strong");
        railCardTitle.contentEditable = "true";
        railCardTitle.spellcheck = true;
        railCardTitle.dataset.writeSectionRailTitle = "";
        railCardTitle.innerText = railTitle || heading;
        const railCardText = document.createElement("p");
        railCardText.contentEditable = "true";
        railCardText.spellcheck = true;
        railCardText.dataset.writeSectionRailText = "";
        railCardText.innerText = railText || paragraphs[0] || "";
        const railSettings = document.createElement("div");
        railSettings.className = "writer-section-rail-settings";
        railSettings.contentEditable = "false";
        const railClassLabel = document.createElement("label");
        const railClassText = document.createElement("span");
        railClassText.textContent = "자동 비주얼";
        const railClassSelect = createSelect(imageClassOptions, railClass);
        railClassSelect.dataset.writeSectionRailClass = "";
        railClassLabel.append(railClassText, railClassSelect);
        const railImageInput = document.createElement("input");
        railImageInput.type = "url";
        railImageInput.hidden = true;
        railImageInput.value = railImage;
        railImageInput.dataset.writeSectionRailImage = "";
        const railHiddenInput = document.createElement("input");
        railHiddenInput.type = "hidden";
        railHiddenInput.value = hideRailImage ? "true" : "false";
        railHiddenInput.dataset.writeSectionRailHidden = "";
        const useVisual = document.createElement("button");
        useVisual.type = "button";
        useVisual.dataset.writeSectionRailUseVisual = "";
        useVisual.textContent = "자동 비주얼";
        const hideImage = document.createElement("button");
        hideImage.type = "button";
        hideImage.dataset.writeSectionRailHide = "";
        hideImage.textContent = "이미지 숨김";
        railSettings.append(railClassLabel, railImageInput, railHiddenInput, useVisual, hideImage);
        railCard.append(railNo, railImageButton, railCardTitle, railCardText, railSettings);
        section.append(railCard);
        const title = document.createElement("h2");
        title.contentEditable = "true";
        title.spellcheck = true;
        title.dataset.writeSectionHeading = "";
        title.innerText = heading;
        section.append(title);
        const sectionMedia = document.createElement("figure");
        sectionMedia.className = "writer-section-media";
        sectionMedia.dataset.writeSectionMedia = "";
        sectionMedia.contentEditable = "false";
        const sectionImageButton = document.createElement("button");
        sectionImageButton.type = "button";
        sectionImageButton.className = "writer-section-media-button";
        sectionImageButton.dataset.writeSectionImageButton = "";
        sectionImageButton.setAttribute("aria-label", "본문 이미지 수정");
        const sectionImagePreview = document.createElement("span");
        sectionImagePreview.className = `image-block ${sectionImageClass || railClass || "image-material"}`;
        sectionImagePreview.dataset.writeSectionImagePreview = "";
        const sectionImageLabel = document.createElement("span");
        sectionImageLabel.dataset.writeSectionImageLabel = "";
        sectionImageLabel.textContent = "본문 이미지 추가";
        sectionImageButton.append(sectionImagePreview, sectionImageLabel);
        const caption = document.createElement("figcaption");
        caption.contentEditable = "true";
        caption.spellcheck = true;
        caption.dataset.writeSectionImageCaption = "";
        caption.innerText = sectionImageCaption;
        const mediaTools = document.createElement("div");
        mediaTools.className = "writer-section-media-tools";
        mediaTools.contentEditable = "false";
        const imageClassLabel = document.createElement("label");
        const imageClassText = document.createElement("span");
        imageClassText.textContent = "이미지 비주얼";
        const imageClassSelect = createSelect(imageClassOptions, sectionImageClass || railClass || "image-material");
        imageClassSelect.dataset.writeSectionImageClass = "";
        imageClassLabel.append(imageClassText, imageClassSelect);
        const sectionImageInput = document.createElement("input");
        sectionImageInput.type = "url";
        sectionImageInput.hidden = true;
        sectionImageInput.value = sectionImage;
        sectionImageInput.dataset.writeSectionImage = "";
        const sectionImageEnabled = document.createElement("input");
        sectionImageEnabled.type = "hidden";
        sectionImageEnabled.value = hideSectionImage ? "false" : "true";
        sectionImageEnabled.dataset.writeSectionImageEnabled = "";
        const sectionImageFile = document.createElement("input");
        sectionImageFile.type = "file";
        sectionImageFile.accept = "image/gif,image/jpeg,image/png,image/webp";
        sectionImageFile.hidden = true;
        sectionImageFile.dataset.writeSectionImageFile = "";
        const useSectionUrl = document.createElement("button");
        useSectionUrl.type = "button";
        useSectionUrl.dataset.writeSectionImageUrl = "";
        useSectionUrl.textContent = "URL";
        const useSectionFile = document.createElement("button");
        useSectionFile.type = "button";
        useSectionFile.dataset.writeSectionImageFileButton = "";
        useSectionFile.textContent = "파일";
        const useSectionVisual = document.createElement("button");
        useSectionVisual.type = "button";
        useSectionVisual.dataset.writeSectionImageUseVisual = "";
        useSectionVisual.textContent = "자동 이미지";
        const hideSectionVisual = document.createElement("button");
        hideSectionVisual.type = "button";
        hideSectionVisual.dataset.writeSectionImageHide = "";
        hideSectionVisual.textContent = "이미지 끄기";
        mediaTools.append(imageClassLabel, sectionImageInput, sectionImageEnabled, sectionImageFile, useSectionUrl, useSectionFile, useSectionVisual, hideSectionVisual);
        sectionMedia.append(sectionImageButton, caption, mediaTools);
        section.append(sectionMedia);
        paragraphs.forEach((paragraph) => section.append(createParagraph(paragraph)));
        const tools = document.createElement("div");
        tools.className = "writer-section-tools";
        tools.contentEditable = "false";
        const addSection = document.createElement("button");
        addSection.type = "button";
        addSection.dataset.writeAddSectionAfter = "";
        addSection.textContent = "다음 섹션";
        const removeSection = document.createElement("button");
        removeSection.type = "button";
        removeSection.dataset.writeRemoveSection = "";
        removeSection.textContent = "섹션 삭제";
        tools.append(addSection, removeSection);
        section.append(tools);
        return section;
    };
    const focusEditableEnd = (element) => {
        if (!element) {
            return;
        }
        window.requestAnimationFrame(() => {
            element.focus();
            const range = document.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        });
    };
    const focusFirstParagraph = (section) => {
        let paragraph = section.querySelector("[data-write-paragraph]");
        if (!paragraph) {
            paragraph = createParagraph("");
            section.querySelector(".writer-section-tools")?.before(paragraph);
        }
        focusEditableEnd(paragraph);
    };
    const addSectionAfter = (section) => {
        const nextSection = createSection();
        if (section) {
            section.after(nextSection);
        }
        else {
            sectionsContainer()?.append(nextSection);
        }
        focusEditableEnd(nextSection.querySelector("[data-write-section-heading]"));
        return nextSection;
    };
    const promptSectionImage = (section) => {
        const imageInput = section.querySelector("[data-write-section-image]");
        const enabledInput = section.querySelector("[data-write-section-image-enabled]");
        const nextImage = window.prompt("본문 이미지 URL을 입력하세요. 비우면 자동 이미지로 사용됩니다.", imageInput?.value || "");
        if (nextImage === null) {
            return false;
        }
        if (imageInput) {
            imageInput.value = nextImage.trim();
        }
        if (enabledInput) {
            enabledInput.value = "true";
        }
        return true;
    };
    const sectionsContainer = () => writer.querySelector("[data-write-body]");
    const sections = () => Array.from(writer.querySelectorAll("[data-write-section]"));
    const updateSectionRailCards = () => {
        sections().forEach((section) => {
            const index = sections().indexOf(section);
            const railClass = section.querySelector("[data-write-section-rail-class]")?.value || metaValue("heroClass") || "image-material";
            const railImage = section.querySelector("[data-write-section-rail-image]")?.value.trim() || "";
            const isHidden = section.querySelector("[data-write-section-rail-hidden]")?.value === "true";
            const preview = section.querySelector("[data-write-section-rail-preview]");
            const card = section.querySelector("[data-write-section-rail-card]");
            const railNo = section.querySelector("[data-write-section-rail-no]");
            const hideButton = section.querySelector("[data-write-section-rail-hide]");
            const sectionImageClass = section.querySelector("[data-write-section-image-class]")?.value || railClass;
            const sectionImage = section.querySelector("[data-write-section-image]")?.value.trim() || "";
            const imageEnabled = section.querySelector("[data-write-section-image-enabled]")?.value === "true";
            const sectionMedia = section.querySelector("[data-write-section-media]");
            const sectionImagePreview = section.querySelector("[data-write-section-image-preview]");
            const sectionImageLabel = section.querySelector("[data-write-section-image-label]");
            if (railNo) {
                railNo.textContent = String(index + 1).padStart(2, "0");
            }
            card?.classList.toggle("is-rail-image-hidden", isHidden);
            if (preview) {
                setImageBlockVisual(preview, railClass, !isHidden ? railImage : "");
            }
            if (hideButton) {
                hideButton.textContent = isHidden ? "이미지 보이기" : "이미지 숨김";
            }
            sectionMedia?.classList.toggle("is-section-image-disabled", !imageEnabled);
            if (sectionImagePreview) {
                setImageBlockVisual(sectionImagePreview, sectionImageClass, imageEnabled ? sectionImage : "");
            }
            if (sectionImageLabel) {
                sectionImageLabel.textContent = imageEnabled
                    ? sectionImage ? "본문 이미지 수정" : "자동 본문 이미지"
                    : "본문 이미지 추가";
            }
        });
    };
    const sectionData = () => sections().map((section) => ({
        heading: section.querySelector("[data-write-section-heading]")?.innerText.trim() || "",
        paragraphs: Array.from(section.querySelectorAll("[data-write-paragraph]")).map((paragraph) => paragraph.innerText.trim()).filter(Boolean),
        railTitle: section.querySelector("[data-write-section-rail-title]")?.innerText.trim() || "",
        railText: section.querySelector("[data-write-section-rail-text]")?.innerText.trim() || "",
        railClass: section.querySelector("[data-write-section-rail-class]")?.value || "",
        railImage: section.querySelector("[data-write-section-rail-hidden]")?.value === "true"
            ? ""
            : section.querySelector("[data-write-section-rail-image]")?.value.trim() || "",
        hideRailImage: section.querySelector("[data-write-section-rail-hidden]")?.value === "true",
        sectionImageClass: section.querySelector("[data-write-section-image-enabled]")?.value === "true"
            ? section.querySelector("[data-write-section-image-class]")?.value || ""
            : "",
        sectionImage: section.querySelector("[data-write-section-image-enabled]")?.value === "true"
            ? section.querySelector("[data-write-section-image]")?.value.trim() || ""
            : "",
        sectionImageCaption: section.querySelector("[data-write-section-image-caption]")?.innerText.trim() || "",
        hideSectionImage: section.querySelector("[data-write-section-image-enabled]")?.value !== "true"
    }));
    const selectedSubcategory = () => subcategorySelect?.selectedOptions.item(0) || null;
    const updateSubcategoryOptions = () => {
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
    const categoryLabel = () => categorySelect?.selectedOptions.item(0)?.textContent?.trim() || "";
    const subcategoryLabel = () => selectedSubcategory()?.textContent?.trim() || "";
    const updateVisualClass = () => {
        const heroClass = metaValue("heroClass") || "image-material";
        const imageMode = metaValue("imageMode") || "visual";
        const heroImage = metaValue("heroImage");
        const useCustomImage = imageMode === "custom" && heroImage.length > 0;
        const isHidden = imageMode === "none";
        heroShell?.classList.toggle("is-hidden", isHidden);
        imageUrlField?.classList.toggle("is-visible", imageMode === "custom");
        updateSectionRailCards();
        if (heroPreview) {
            setImageBlockVisual(heroPreview, heroClass, useCustomImage ? heroImage : "");
        }
    };
    const updateRailMode = () => {
        const mode = (railModeSelect?.value || "default");
        rail?.classList.remove("article-side-default", "article-side-image", "article-side-text");
        rail?.classList.add(`article-side-${mode}`);
    };
    const formatDateForPreview = (value) => value.replace(/-/g, ".");
    const currentBase = () => adminArticles[currentIndex] || fallbackArticle();
    const formArticle = () => {
        const base = currentBase();
        const subcategory = selectedSubcategory();
        const subcategoryKey = metaValue("subcategory") || base.subcategoryKey;
        const tags = splitTags(metaValue("tags"));
        const sectionValues = sectionData();
        const nextSections = sectionValues.map((section, index) => {
            const previous = base.sections[index];
            const heading = { ko: section.heading || previous?.heading.ko || "섹션 제목", en: previous?.heading.en || "TODO: English section heading" };
            const paragraphs = {
                ko: section.paragraphs.length > 0 ? section.paragraphs : previous?.paragraphs.ko || [""],
                en: previous?.paragraphs.en || section.paragraphs.map(() => "TODO: English paragraph")
            };
            return {
                heading,
                paragraphs,
                railTitle: { ko: section.railTitle || previous?.railTitle?.ko || heading.ko, en: previous?.railTitle?.en || heading.en },
                railText: { ko: section.railText || previous?.railText?.ko || paragraphs.ko[0] || "", en: previous?.railText?.en || paragraphs.en[0] || "" },
                railClass: section.railClass || previous?.railClass || metaValue("railClass") || base.railClass || base.heroClass,
                railImage: section.railImage,
                hideRailImage: section.hideRailImage,
                sectionImageClass: section.sectionImageClass || previous?.sectionImageClass || "",
                sectionImage: section.sectionImage,
                sectionImageCaption: { ko: section.sectionImageCaption || previous?.sectionImageCaption?.ko || "", en: previous?.sectionImageCaption?.en || "" },
                hideSectionImage: section.hideSectionImage
            };
        });
        const firstNextSection = nextSections[0];
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
            railMode: (metaValue("railMode") || "default"),
            railClass: metaValue("railClass") || base.railClass || base.heroClass,
            railImage: metaValue("railImageMode") === "custom" ? metaValue("railImage") : "",
            hideRailImage: metaValue("railImageMode") === "none",
            railTitle: firstNextSection?.railTitle || base.railTitle,
            railText: firstNextSection?.railText || base.railText,
            sections: nextSections.length > 0 ? nextSections : base.sections
        });
    };
    const articleCode = (article) => `import type { Article } from "../../types";\n\nexport const article = ${JSON.stringify(article, null, 2)} satisfies Article;\n`;
    const articlesArrayCode = () => `import type { Article } from "../types";\n\nexport const articles = ${JSON.stringify(adminArticles, null, 2)} satisfies Article[];\n`;
    const issueProjectsCode = () => `import type { IssueProject } from "../types";\n\nexport const issueProjects = ${JSON.stringify(adminIssues, null, 2)} satisfies IssueProject[];\n`;
    const generateArticleObject = () => {
        return articleCode(formArticle());
    };
    const updateIssueOutput = () => {
        adminIssue = formIssue();
        adminIssues[currentIssueIndex] = adminIssue;
        if (issueTitle) {
            issueTitle.textContent = `${adminIssue.number} · ${adminIssue.title.ko || adminIssue.title.en}`;
        }
        updateIssueSummary();
        renderIssueList();
        if (issueOutput) {
            issueOutput.value = issueProjectsCode();
        }
    };
    const downloadArticlesFile = () => {
        const blob = new Blob([articlesArrayCode()], { type: "text/typescript" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "articles.ts";
        link.click();
        URL.revokeObjectURL(url);
    };
    const downloadIssueFile = () => {
        const blob = new Blob([issueProjectsCode()], { type: "text/typescript" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "issue-projects.ts";
        link.click();
        URL.revokeObjectURL(url);
    };
    const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result || "")));
        reader.addEventListener("error", () => reject(reader.error || new Error("File read failed")));
        reader.readAsDataURL(file);
    });
    const uploadImageFile = async (file) => {
        if (!/^image\/(gif|jpe?g|png|webp)$/.test(file.type)) {
            throw new Error("GIF, JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
        }
        if (file.size > 8 * 1024 * 1024) {
            throw new Error("이미지는 8MB 이하로 올려주세요.");
        }
        const dataUrl = await readFileAsDataUrl(file);
        try {
            const response = await fetch("/api/admin/uploads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: file.name, dataUrl })
            });
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            const result = await response.json();
            if (!result.url) {
                throw new Error("Upload URL missing");
            }
            return result.url;
        }
        catch {
            setStatus("정적 페이지에서는 파일 업로드 서버가 없어 data URL로 임시 반영했습니다. 로컬 서버에서 파일 저장하면 public/uploads에 저장됩니다.");
            return dataUrl;
        }
    };
    const applyImageFileToSection = async (section, file) => {
        const imageInput = section.querySelector("[data-write-section-image]");
        const enabledInput = section.querySelector("[data-write-section-image-enabled]");
        const caption = section.querySelector("[data-write-section-image-caption]");
        const imageUrl = await uploadImageFile(file);
        if (imageInput) {
            imageInput.value = imageUrl;
        }
        if (enabledInput) {
            enabledInput.value = "true";
        }
        if (caption && caption.innerText.trim() === "") {
            caption.innerText = file.name.replace(/\.[^.]+$/, "");
        }
    };
    const saveArticlesToProject = async () => {
        adminArticles[currentIndex] = formArticle();
        saveCollection("저장 중...");
        try {
            const response = await fetch("/api/admin/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articles: adminArticles })
            });
            if (!response.ok) {
                throw new Error(`Save failed: ${response.status}`);
            }
            const result = await response.json().catch(() => null);
            setStatus(`src/content/magazine.ts에 저장했고 로컬 서버에 바로 반영했습니다.${result?.count ? ` (${result.count}개)` : ""}`);
        }
        catch {
            downloadArticlesFile();
            setStatus("정적 페이지에서는 폴더 저장이 불가해 articles.ts를 내려받았습니다. 로컬 서버에서 열면 폴더에 저장됩니다.");
        }
    };
    const saveIssueCollection = (message = "이슈 자동 저장됨") => {
        updateIssueOutput();
        window.localStorage.setItem(issueStorageKey, JSON.stringify(adminIssues));
        setIssueStatus(message);
    };
    const saveIssueToProject = async () => {
        saveIssueCollection("이슈 저장 중...");
        try {
            const response = await fetch("/api/admin/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueProjects: adminIssues })
            });
            if (!response.ok) {
                throw new Error(`Save failed: ${response.status}`);
            }
            setIssueStatus("src/content/magazine.ts의 issueProjects에 저장했고 로컬 서버에 바로 반영했습니다.");
        }
        catch {
            downloadIssueFile();
            setIssueStatus("정적 페이지에서는 이슈 저장이 불가해 issue-projects.ts를 내려받았습니다. 로컬 서버에서 열면 폴더에 저장됩니다.");
        }
    };
    const scheduleIssueSave = () => {
        updateIssueOutput();
        window.clearTimeout(issueSaveTimer);
        issueSaveTimer = window.setTimeout(() => saveIssueCollection(), 250);
    };
    const saveCollection = (message = "자동 저장됨") => {
        window.localStorage.setItem(storageKey, JSON.stringify(adminArticles));
        setStatus(message);
    };
    const renderAdminList = () => {
        if (!adminList) {
            return;
        }
        const categoryRank = (globalIndex) => {
            const article = adminArticles[globalIndex];
            if (!article) {
                return 0;
            }
            return adminArticles.slice(0, globalIndex + 1).filter((item) => item.category === article.category).length;
        };
        const visibleArticles = adminArticles
            .map((article, index) => ({ article, index }))
            .filter(({ article }) => articleMatchesFilter(article));
        adminList.innerHTML = visibleArticles.length > 0 ? visibleArticles.map(({ article, index }, rank) => {
            const globalNo = String(index + 1).padStart(2, "0");
            const filteredNo = String(rank + 1).padStart(2, "0");
            const categoryNo = String(categoryRank(index)).padStart(2, "0");
            const isFiltered = activeCategoryFilter !== "all";
            return `
      <button type="button" class="admin-list-item ${index === currentIndex ? "is-active" : ""}" data-admin-index="${index}">
        <span class="admin-list-no"><strong>${isFiltered ? filteredNo : globalNo}</strong><small>${isFiltered ? `전체 ${globalNo}` : `${article.category} ${categoryNo}`}</small></span>
        <strong>${article.title.ko}</strong>
        <small>${article.category} / ${article.subcategoryKey}</small>
      </button>`;
        }).join("") : `<p class="admin-empty">이 카테고리의 기사가 아직 없습니다. 새 기사를 만들면 현재 필터에 맞춰 시작합니다.</p>`;
        if (adminCount) {
            adminCount.textContent = activeCategoryFilter === "all" ? String(adminArticles.length) : `${visibleArticles.length}/${adminArticles.length}`;
        }
        adminFilters?.querySelectorAll("[data-admin-filter]").forEach((button) => {
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
    const moveCurrentArticle = (direction) => {
        adminArticles[currentIndex] = formArticle();
        const visibleIndexes = adminArticles
            .map((_, index) => index)
            .filter((index) => activeCategoryFilter === "all" || adminArticles[index]?.category === activeCategoryFilter);
        const position = visibleIndexes.indexOf(currentIndex);
        const targetIndex = visibleIndexes[position + direction];
        if (targetIndex === undefined) {
            return false;
        }
        [adminArticles[currentIndex], adminArticles[targetIndex]] = [adminArticles[targetIndex], adminArticles[currentIndex]];
        applyArticle(targetIndex);
        return true;
    };
    const moveCurrentIssue = (direction) => {
        adminIssues[currentIssueIndex] = formIssue();
        const targetIndex = currentIssueIndex + direction;
        if (targetIndex < 0 || targetIndex >= adminIssues.length) {
            return false;
        }
        [adminIssues[currentIssueIndex], adminIssues[targetIndex]] = [adminIssues[targetIndex], adminIssues[currentIssueIndex]];
        applyIssue(targetIndex);
        return true;
    };
    const writeMeta = (key, value) => {
        const field = metaField(key);
        if (field) {
            field.value = value;
        }
    };
    const applyIssue = (index) => {
        currentIssueIndex = Math.max(0, Math.min(index, adminIssues.length - 1));
        adminIssue = normalizeIssue(adminIssues[currentIssueIndex] || fallbackIssue());
        adminIssues[currentIssueIndex] = adminIssue;
        writeIssueField("number", adminIssue.number);
        writeIssueField("title.ko", adminIssue.title.ko);
        writeIssueField("title.en", adminIssue.title.en);
        writeIssueField("subtitle.ko", adminIssue.subtitle.ko);
        writeIssueField("subtitle.en", adminIssue.subtitle.en);
        writeIssueField("deck.ko", adminIssue.deck.ko);
        writeIssueField("deck.en", adminIssue.deck.en);
        writeIssueField("date.ko", adminIssue.date.ko);
        writeIssueField("date.en", adminIssue.date.en);
        writeIssueField("format.ko", adminIssue.format.ko);
        writeIssueField("format.en", adminIssue.format.en);
        writeIssueField("availability.ko", adminIssue.availability.ko);
        writeIssueField("availability.en", adminIssue.availability.en);
        writeIssueField("coverCredit.ko", adminIssue.coverCredit.ko);
        writeIssueField("coverCredit.en", adminIssue.coverCredit.en);
        writeIssueField("editorNote.ko", adminIssue.editorNote.ko);
        writeIssueField("editorNote.en", adminIssue.editorNote.en);
        renderIssueFeatures();
        renderIssueCredits();
        renderIssueList();
        updateIssueSummary();
        updateIssueOutput();
    };
    const applyArticle = (index) => {
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
        writeMeta("railClass", article.railClass || article.heroClass);
        writeMeta("railImageMode", article.hideRailImage ? "none" : article.railImage ? "custom" : "visual");
        writeMeta("railImage", article.railImage || "");
        writeMeta("readTime", article.readTime.ko);
        writeMeta("location", article.location.ko);
        writeMeta("tags", article.tags.ko.join(", "));
        writeText("title", article.title.ko);
        writeText("deck", article.deck.ko);
        writeText("quote", article.quote.ko);
        const container = sectionsContainer();
        if (container) {
            container.querySelectorAll("[data-write-section]").forEach((section) => section.remove());
            article.sections.forEach((section) => container.append(createSection(section.heading.ko, section.paragraphs.ko, section.railClass || article.railClass || article.heroClass, section.railImage || "", Boolean(section.hideRailImage), section.railTitle?.ko || section.heading.ko, section.railText?.ko || section.paragraphs.ko[0] || "", section.sectionImageClass || "", section.sectionImage || "", Boolean(section.hideSectionImage), section.sectionImageCaption?.ko || "")));
        }
        renderAdminList();
        updatePreview();
    };
    const updatePreview = () => {
        updateSubcategoryOptions();
        updateVisualClass();
        updateRailMode();
        if (kicker) {
            kicker.textContent = `${categoryLabel()} / ${subcategoryLabel()}`;
        }
        writer.querySelector('[data-write-preview="date"]').textContent = formatDateForPreview(metaValue("date"));
        writer.querySelector('[data-write-preview="location"]').textContent = metaValue("location");
        writer.querySelector('[data-write-preview="readTime"]').textContent = metaValue("readTime");
        writer.querySelector('[data-write-preview="tags"]').textContent = splitTags(metaValue("tags")).join(" / ");
        currentTitle && (currentTitle.textContent = `${String(currentIndex + 1).padStart(2, "0")} · ${textValue("title") || metaValue("slug")}`);
        if (outputArea) {
            outputArea.value = generateArticleObject();
        }
    };
    const saveState = () => {
        adminArticles[currentIndex] = formArticle();
        renderAdminList();
        saveCollection();
    };
    const scheduleSave = () => {
        updatePreview();
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveState, 250);
    };
    const handleEditorKeydown = async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
            event.preventDefault();
            if (writer.dataset.writeMode === "issue") {
                await saveIssueToProject();
            }
            else {
                await saveArticlesToProject();
            }
            return;
        }
        const section = target.closest("[data-write-section]");
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            addSectionAfter(section);
            scheduleSave();
            return;
        }
        if (event.key === "Backspace" && target.matches("[data-write-paragraph]") && target.innerText.trim() === "" && section) {
            const sectionParagraphs = Array.from(section.querySelectorAll("[data-write-paragraph]"));
            if (sectionParagraphs.length > 1) {
                event.preventDefault();
                const index = sectionParagraphs.indexOf(target);
                const nextFocus = sectionParagraphs[index - 1] || section.querySelector("[data-write-section-heading]");
                target.remove();
                focusEditableEnd(nextFocus);
                scheduleSave();
            }
            return;
        }
        if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) {
            return;
        }
        if (target.matches("[data-write-section-heading]") && section) {
            event.preventDefault();
            focusFirstParagraph(section);
            return;
        }
        if (!target.matches("[data-write-paragraph]") || !section) {
            return;
        }
        const value = target.innerText.trim().toLowerCase();
        if (value === "/image") {
            event.preventDefault();
            if (promptSectionImage(section)) {
                target.remove();
                focusFirstParagraph(section);
                scheduleSave();
            }
            return;
        }
        if (value === "/section" || value === "") {
            event.preventDefault();
            if (value === "" && section.querySelectorAll("[data-write-paragraph]").length > 1) {
                target.remove();
            }
            addSectionAfter(section);
            scheduleSave();
            return;
        }
        event.preventDefault();
        const paragraph = createParagraph("");
        target.after(paragraph);
        focusEditableEnd(paragraph);
        scheduleSave();
    };
    const handleWriterChange = async (event) => {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.matches("[data-write-section-image-file]")) {
            const section = target.closest("[data-write-section]");
            const file = target.files?.[0];
            if (section && file) {
                try {
                    setStatus("이미지 파일을 저장 중...");
                    await applyImageFileToSection(section, file);
                    setStatus("본문 이미지 파일을 반영했습니다.");
                }
                catch (error) {
                    setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
                }
                target.value = "";
            }
        }
        scheduleSave();
    };
    applyIssue(0);
    applyArticle(0);
    writer.addEventListener("keydown", (event) => {
        void handleEditorKeydown(event);
    });
    writer.addEventListener("input", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("[data-write-issue-editor]")) {
            scheduleIssueSave();
            return;
        }
        scheduleSave();
    });
    writer.addEventListener("change", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.closest("[data-write-issue-editor]")) {
            scheduleIssueSave();
            return;
        }
        void handleWriterChange(event);
    });
    writer.addEventListener("click", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const modeButton = target.closest("[data-write-mode-button]");
        if (modeButton) {
            setWriteMode(modeButton.dataset.writeModeButton === "issue" ? "issue" : "article");
            return;
        }
        const issueListItem = target.closest("[data-write-issue-index]");
        if (issueListItem) {
            adminIssues[currentIssueIndex] = formIssue();
            applyIssue(Number(issueListItem.dataset.writeIssueIndex || 0));
            saveIssueCollection("선택한 이슈를 불러왔습니다.");
            return;
        }
        if (target.closest("[data-write-issue-new]")) {
            adminIssues[currentIssueIndex] = formIssue();
            const nextIssue = fallbackIssue();
            nextIssue.number = `No. ${String(adminIssues.length + 1).padStart(2, "0")}`;
            nextIssue.title.ko = "새 이슈";
            nextIssue.title.en = "New Issue";
            adminIssues.unshift(nextIssue);
            applyIssue(0);
            saveIssueCollection("새 이슈를 만들었습니다.");
            return;
        }
        if (target.closest("[data-write-issue-duplicate]")) {
            adminIssues[currentIssueIndex] = formIssue();
            const duplicateIssue = normalizeIssue(JSON.parse(JSON.stringify(adminIssues[currentIssueIndex])));
            duplicateIssue.number = `No. ${String(adminIssues.length + 1).padStart(2, "0")}`;
            duplicateIssue.title.ko = `${duplicateIssue.title.ko} 복사`;
            duplicateIssue.title.en = `${duplicateIssue.title.en} Copy`;
            adminIssues.splice(currentIssueIndex + 1, 0, duplicateIssue);
            applyIssue(currentIssueIndex + 1);
            saveIssueCollection("이슈를 복제했습니다.");
            return;
        }
        if (target.closest("[data-write-issue-delete]") && window.confirm("현재 이슈를 삭제할까요?")) {
            if (adminIssues.length > 1) {
                adminIssues.splice(currentIssueIndex, 1);
                applyIssue(Math.min(currentIssueIndex, adminIssues.length - 1));
                saveIssueCollection("이슈를 삭제했습니다.");
            }
            return;
        }
        if (target.closest("[data-write-issue-move-up]")) {
            if (moveCurrentIssue(-1)) {
                saveIssueCollection("이슈 순서를 위로 이동했습니다.");
            }
            return;
        }
        if (target.closest("[data-write-issue-move-down]")) {
            if (moveCurrentIssue(1)) {
                saveIssueCollection("이슈 순서를 아래로 이동했습니다.");
            }
            return;
        }
        if (target.closest("[data-write-issue-add-feature]")) {
            adminIssue = formIssue();
            const nextFeature = fallbackIssueFeature();
            nextFeature.slug = `scene-${adminIssue.features.length + 1}`;
            nextFeature.title.ko = `새 이슈 장면 ${adminIssue.features.length + 1}`;
            nextFeature.title.en = `New Issue Scene ${adminIssue.features.length + 1}`;
            adminIssue.features.push(nextFeature);
            adminIssues[currentIssueIndex] = adminIssue;
            applyIssue(currentIssueIndex);
            saveIssueCollection("이슈 장면을 추가했습니다.");
            return;
        }
        const issueFeatureCard = target.closest("[data-write-issue-feature]");
        const issueFeatureVisual = target.closest("[data-write-issue-feature-preview]");
        if (issueFeatureVisual && issueFeatureCard) {
            const nextVisual = cycleSelectVisual(issueFeatureCard.querySelector('[data-write-issue-feature-field="heroClass"]'), clickDirection(event, issueFeatureVisual));
            setImageBlockVisual(issueFeatureVisual.querySelector(".image-block") || issueFeatureVisual, nextVisual);
            scheduleIssueSave();
            return;
        }
        if (target.closest("[data-write-issue-feature-remove]") && issueFeatureCard) {
            adminIssue = formIssue();
            const featureIndex = Array.from(issueFeatures?.querySelectorAll("[data-write-issue-feature]") || []).indexOf(issueFeatureCard);
            if (featureIndex >= 0 && adminIssue.features.length > 1) {
                adminIssue.features.splice(featureIndex, 1);
                adminIssues[currentIssueIndex] = adminIssue;
                applyIssue(currentIssueIndex);
                saveIssueCollection("이슈 장면을 삭제했습니다.");
            }
            return;
        }
        if (target.closest("[data-write-issue-add-credit]")) {
            adminIssue = formIssue();
            adminIssue.credits.push({ label: { ko: "크레딧", en: "Credit" }, value: { ko: "이름", en: "Name" } });
            adminIssues[currentIssueIndex] = adminIssue;
            applyIssue(currentIssueIndex);
            saveIssueCollection("이슈 크레딧을 추가했습니다.");
            return;
        }
        const issueCreditCard = target.closest("[data-write-issue-credit]");
        if (target.closest("[data-write-issue-credit-remove]") && issueCreditCard) {
            adminIssue = formIssue();
            const creditIndex = Array.from(issueCredits?.querySelectorAll("[data-write-issue-credit]") || []).indexOf(issueCreditCard);
            if (creditIndex >= 0 && adminIssue.credits.length > 1) {
                adminIssue.credits.splice(creditIndex, 1);
                adminIssues[currentIssueIndex] = adminIssue;
                applyIssue(currentIssueIndex);
                saveIssueCollection("이슈 크레딧을 삭제했습니다.");
            }
            return;
        }
        if (target.closest("[data-write-issue-copy]")) {
            saveIssueCollection("이슈 코드를 준비했습니다.");
            const code = issueProjectsCode();
            try {
                await navigator.clipboard.writeText(code);
            }
            catch {
                issueOutput?.focus();
                issueOutput?.select();
                document.execCommand("copy");
            }
            setIssueStatus("issueProjects 배열을 복사했습니다.");
            return;
        }
        if (target.closest("[data-write-issue-download]")) {
            saveIssueCollection("이슈 파일을 내려받았습니다.");
            downloadIssueFile();
            return;
        }
        if (target.closest("[data-write-issue-save]")) {
            await saveIssueToProject();
            return;
        }
        if (target.closest("[data-write-issue-reset]") && window.confirm("이슈 로컬 변경 내용을 지우고 원래 이슈를 다시 불러올까요?")) {
            window.localStorage.removeItem(issueStorageKey);
            window.location.reload();
            return;
        }
        if (target.closest("[data-write-add-section]")) {
            addSectionAfter(sections().at(-1));
            scheduleSave();
            return;
        }
        const section = target.closest("[data-write-section]");
        const heroVisual = target.closest("[data-write-hero-preview]");
        if (heroVisual) {
            cycleSelectVisual(metaField("heroClass"), clickDirection(event, heroVisual));
            const imageMode = metaField("imageMode");
            const heroImage = metaField("heroImage");
            if (imageMode) {
                imageMode.value = "visual";
            }
            if (heroImage) {
                heroImage.value = "";
            }
            scheduleSave();
            return;
        }
        const railVisual = target.closest("[data-write-section-rail-preview]");
        if (railVisual && section) {
            cycleSelectVisual(section.querySelector("[data-write-section-rail-class]"), clickDirection(event, railVisual));
            const imageInput = section.querySelector("[data-write-section-rail-image]");
            const hiddenInput = section.querySelector("[data-write-section-rail-hidden]");
            if (imageInput) {
                imageInput.value = "";
            }
            if (hiddenInput) {
                hiddenInput.value = "false";
            }
            scheduleSave();
            return;
        }
        const sectionVisual = target.closest("[data-write-section-image-preview]");
        if (sectionVisual && section) {
            cycleSelectVisual(section.querySelector("[data-write-section-image-class]"), clickDirection(event, sectionVisual));
            const imageInput = section.querySelector("[data-write-section-image]");
            const enabledInput = section.querySelector("[data-write-section-image-enabled]");
            if (imageInput) {
                imageInput.value = "";
            }
            if (enabledInput) {
                enabledInput.value = "true";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-rail-image-button]") && section) {
            const imageInput = section.querySelector("[data-write-section-rail-image]");
            const hiddenInput = section.querySelector("[data-write-section-rail-hidden]");
            const nextImage = window.prompt("섹션 레일 이미지 URL을 입력하세요. 비우면 자동 비주얼로 돌아갑니다.", imageInput?.value || "");
            if (nextImage === null) {
                return;
            }
            if (imageInput) {
                imageInput.value = nextImage.trim();
            }
            if (hiddenInput) {
                hiddenInput.value = "false";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-rail-use-visual]") && section) {
            const imageInput = section.querySelector("[data-write-section-rail-image]");
            const hiddenInput = section.querySelector("[data-write-section-rail-hidden]");
            if (imageInput) {
                imageInput.value = "";
            }
            if (hiddenInput) {
                hiddenInput.value = "false";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-rail-hide]") && section) {
            const hiddenInput = section.querySelector("[data-write-section-rail-hidden]");
            if (hiddenInput) {
                hiddenInput.value = hiddenInput.value === "true" ? "false" : "true";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-image-button]") && section) {
            if (!promptSectionImage(section)) {
                return;
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-image-url]") && section) {
            if (!promptSectionImage(section)) {
                return;
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-image-file-button]") && section) {
            section.querySelector("[data-write-section-image-file]")?.click();
            return;
        }
        if (target.closest("[data-write-section-image-use-visual]") && section) {
            const imageInput = section.querySelector("[data-write-section-image]");
            const enabledInput = section.querySelector("[data-write-section-image-enabled]");
            if (imageInput) {
                imageInput.value = "";
            }
            if (enabledInput) {
                enabledInput.value = "true";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-section-image-hide]") && section) {
            const enabledInput = section.querySelector("[data-write-section-image-enabled]");
            if (enabledInput) {
                enabledInput.value = "false";
            }
            scheduleSave();
            return;
        }
        if (target.closest("[data-write-add-section-after]") && section) {
            addSectionAfter(section);
            scheduleSave();
            return;
        }
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
            }
            catch {
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
        const filterButton = target.closest("[data-admin-filter]");
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
        const listItem = target.closest("[data-admin-index]");
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
        if (target.closest("[data-admin-move-up]")) {
            if (moveCurrentArticle(-1)) {
                saveCollection(activeCategoryFilter === "all" ? "전체 순서를 위로 이동했습니다." : "현재 카테고리 안에서 순서를 위로 이동했습니다.");
            }
            return;
        }
        if (target.closest("[data-admin-move-down]")) {
            if (moveCurrentArticle(1)) {
                saveCollection(activeCategoryFilter === "all" ? "전체 순서를 아래로 이동했습니다." : "현재 카테고리 안에서 순서를 아래로 이동했습니다.");
            }
            return;
        }
        if (target.closest("[data-admin-copy-all]")) {
            adminArticles[currentIndex] = formArticle();
            const code = articlesArrayCode();
            outputArea && (outputArea.value = code);
            try {
                await navigator.clipboard.writeText(code);
            }
            catch {
                outputArea?.focus();
                outputArea?.select();
                document.execCommand("copy");
            }
            saveCollection("전체 articles 배열을 복사했습니다.");
            return;
        }
        if (target.closest("[data-admin-save-file]")) {
            await saveArticlesToProject();
            return;
        }
        if (target.closest("[data-admin-download-all]")) {
            adminArticles[currentIndex] = formArticle();
            downloadArticlesFile();
            saveCollection("전체 파일을 내려받았습니다.");
        }
    });
}
let scrollFrame = 0;
const updateScrollState = () => {
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
const requestScrollState = () => {
    if (scrollFrame === 0) {
        scrollFrame = window.requestAnimationFrame(updateScrollState);
    }
};
updateScrollState();
window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState);
const revealItems = document.querySelectorAll("[data-reveal]");
if (revealItems.length > 0) {
    if ("IntersectionObserver" in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -12%" });
        revealItems.forEach((item) => revealObserver.observe(item));
    }
    else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }
}
const previewRows = document.querySelectorAll("[data-preview-class]");
const previewImage = document.querySelector("[data-preview-image]");
const previewKicker = document.querySelector("[data-preview-kicker]");
const previewTitle = document.querySelector("[data-preview-title]");
let setArchivePreview = null;
if (previewRows.length > 0 && previewImage && previewKicker && previewTitle) {
    setArchivePreview = (row) => {
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
            previewImage.animate([
                { filter: "contrast(0.94)", opacity: 0.72 },
                { filter: "contrast(1)", opacity: 1 }
            ], { duration: 160, easing: "linear" });
        }
    };
    previewRows.forEach((row) => {
        row.addEventListener("pointerenter", () => setArchivePreview?.(row));
        row.addEventListener("focus", () => setArchivePreview?.(row));
    });
    setArchivePreview(previewRows[0]);
}
const featureCard = document.querySelector("[data-feature-card]");
const featureImage = document.querySelector("[data-feature-image]");
const featureKicker = document.querySelector("[data-feature-kicker]");
const featureTitle = document.querySelector("[data-feature-title]");
const featureLinks = document.querySelectorAll("[data-feature-link]");
if (featureCard && featureImage && featureKicker && featureTitle && featureLinks.length > 0) {
    const setFeaturePreview = (link) => {
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
            featureImage.animate([
                { filter: "contrast(0.92)", opacity: 0.7 },
                { filter: "contrast(1)", opacity: 1 }
            ], { duration: 150, easing: "linear" });
        }
    };
    featureLinks.forEach((link) => {
        link.addEventListener("pointerenter", () => setFeaturePreview(link));
        link.addEventListener("focus", () => setFeaturePreview(link));
    });
}
const scrollSections = document.querySelectorAll("[data-scroll-section]");
if (scrollSections.length > 0) {
    if ("IntersectionObserver" in window && !reduceMotion) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle("is-current-section", entry.isIntersecting);
            });
        }, { rootMargin: "-34% 0px -48%" });
        scrollSections.forEach((section) => sectionObserver.observe(section));
    }
    else {
        scrollSections.forEach((section) => section.classList.add("is-current-section"));
    }
}
const articleRail = document.querySelector("[data-article-rail]");
const articleRailNo = document.querySelector("[data-article-rail-no]");
const articleRailTitle = document.querySelector("[data-article-rail-title]");
const articleRailText = document.querySelector("[data-article-rail-text]");
const articleRailVisual = document.querySelector("[data-article-rail-visual]");
const articleSections = document.querySelectorAll("[data-article-section]");
if (articleRail && articleRailNo && articleRailTitle && articleRailText && articleSections.length > 0) {
    let activeArticleSection = null;
    let articleRailFrame = 0;
    const setArticleRail = (section) => {
        if (activeArticleSection === section) {
            return;
        }
        activeArticleSection = section;
        articleRailNo.textContent = section.dataset.railNo || "";
        articleRailTitle.textContent = section.dataset.railTitle || "";
        articleRailText.textContent = section.dataset.railText || "";
        articleRail.classList.toggle("is-rail-image-hidden", section.dataset.railImageHidden === "true");
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
    const getArticleRailActivationPoint = () => {
        const activationRatio = window.innerWidth <= 960 ? 0.52 : 0.38;
        return Math.max(170, window.innerHeight * activationRatio);
    };
    const updateArticleRailFromScroll = () => {
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
    const requestArticleRailUpdate = () => {
        if (articleRailFrame === 0) {
            articleRailFrame = window.requestAnimationFrame(updateArticleRailFromScroll);
        }
    };
    updateArticleRailFromScroll();
    window.addEventListener("scroll", requestArticleRailUpdate, { passive: true });
    window.addEventListener("resize", requestArticleRailUpdate);
}
const filterButtons = document.querySelectorAll("[data-filter]");
const filterPanels = document.querySelectorAll("[data-filter-panel]");
const filterStatus = document.querySelector("[data-filter-status]");
const archiveBoard = document.querySelector("[data-archive-board]");
if (filterButtons.length > 0) {
    const isKorean = document.documentElement.lang === "ko";
    const applyFilter = (button, updateUrl = true) => {
        const selectedCategory = button.dataset.filter || "all";
        const selectedLabel = button.dataset.filterLabel || button.textContent?.trim() || selectedCategory;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });
        const visibleRows = [];
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
                    row.animate([
                        { opacity: 0.28, transform: "translateY(0.35rem)" },
                        { opacity: 1, transform: "translateY(0)" }
                    ], { duration: 260, delay: Math.min(index, 5) * 28, easing: "cubic-bezier(.2,.8,.2,1)" });
                });
            }
        }
        if (updateUrl && window.location.pathname.includes("/archive")) {
            const url = new URL(window.location.href);
            if (selectedCategory === "all") {
                url.searchParams.delete("category");
            }
            else {
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
const subscribeForm = document.querySelector(".subscribe-form");
const formMessage = document.querySelector("[data-form-message]");
if (subscribeForm) {
    subscribeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        subscribeForm.reset();
        if (formMessage) {
            formMessage.textContent = subscribeForm.dataset.successMessage || "Subscription recorded.";
        }
    });
}
//# sourceMappingURL=client.js.map