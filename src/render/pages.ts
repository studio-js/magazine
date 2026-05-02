import type { Article, CategoryDefinition, Locale, LocalizedText, Note, PrimaryCategory, SiteContent, SubcategoryKey } from "../types";

interface LayoutOptions {
  title: string;
  description: string;
  body: string;
  locale: Locale;
  currentPath: string;
  site: SiteContent;
}

const ui = {
  ko: {
    features: "주요 글",
    notes: "노트",
    archive: "아카이브",
    about: "소개",
    menu: "메뉴",
    all: "전체",
    read: "읽기",
    readFeature: "대표 글 읽기",
    selectedStories: "선별한 글",
    categoryIndex: "카테고리 인덱스",
    latest: "최근 발행",
    editorNotes: "에디터 노트",
    aboutTitle: "The Thing은 서로 다른 분야를 하나의 편집 리듬으로 묶는 독립 디지털 매거진입니다.",
    aboutBody:
      "예술의 이미지, 테크의 시스템, 디자인의 구조, 철학의 질문을 한 화면 안에서 연결합니다. 빠른 피드보다 한 호의 흐름과 디파트먼트의 밀도를 먼저 설계합니다.",
    subscribe: "새 글 알림 받기",
    subscribeSuccess: "구독 신청이 기록되었습니다.",
    fullArchive: "모든 글",
    archiveLead: "카테고리를 선택하면 목록과 하위 카테고리가 함께 정리됩니다. 데스크톱과 모바일 모두 선택 상태가 즉시 반영됩니다.",
    related: "이어 읽기",
    back: "아카이브로 돌아가기",
    notFound: "요청한 페이지를 찾을 수 없습니다.",
    notFoundBody: "주소가 바뀌었거나 아직 발행되지 않은 글입니다."
  },
  en: {
    features: "Features",
    notes: "Notes",
    archive: "Archive",
    about: "About",
    menu: "Menu",
    all: "All",
    read: "Read",
    readFeature: "Read Feature",
    selectedStories: "Selected Stories",
    categoryIndex: "Category Index",
    latest: "Latest Entries",
    editorNotes: "Editor's Notes",
    aboutTitle: "The Thing is an independent digital magazine that connects different fields through one editorial rhythm.",
    aboutBody:
      "It links images from art, systems from tech, structures from design, and questions from philosophy on one surface. It is shaped around the pace of an issue rather than the speed of a feed.",
    subscribe: "Get New Notes",
    subscribeSuccess: "Subscription request noted.",
    fullArchive: "All Articles",
    archiveLead: "Choose a category to refine the list and reveal its subcategories. The selected state updates immediately on desktop and mobile.",
    related: "Related Reading",
    back: "Back to Archive",
    notFound: "The requested page could not be found.",
    notFoundBody: "The address may have changed, or the article has not been published yet."
  }
} satisfies Record<Locale, Record<string, string>>;

const escapeHtml = (value: string): string =>
  value.replace(/[&<>'"]/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };

    return entities[char] ?? char;
  });

const text = (value: LocalizedText, locale: Locale): string => value[locale];

const formatDate = (date: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: locale === "ko" ? "2-digit" : "short",
    day: "2-digit"
  })
    .format(new Date(date))
    .replace(/\. /g, ".")
    .replace(/\.$/, "");

const withLocale = (path: string, locale: Locale): string => {
  const [pathAndQuery, hash] = path.split("#");
  const [pathname, query] = pathAndQuery.split("?");
  const localizedPath = locale === "en" ? (pathname === "/" ? "/en/" : `/en${pathname}`) : pathname;
  return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
};

const articleHref = (article: Article, locale: Locale): string => withLocale(`/articles/${article.slug}`, locale);

const archiveHref = (locale: Locale, category?: PrimaryCategory, subcategory?: SubcategoryKey): string => {
  if (category && subcategory) {
    return withLocale(`/archive/${category}/${subcategory}/`, locale);
  }

  return withLocale(category ? `/archive/${category}/` : "/archive", locale);
};

const categoryLabel = (categories: CategoryDefinition[], key: PrimaryCategory, locale: Locale): string =>
  text(categories.find((category) => category.key === key)?.label ?? { ko: key, en: key }, locale);

const assetVersion = "20260503-reading-pass";

const renderLanguageSwitch = (currentPath: string, locale: Locale): string => `
  <div class="language-switch" aria-label="Language switcher">
    <a class="${locale === "ko" ? "is-active" : ""}" href="${withLocale(currentPath, "ko")}">KR</a>
    <a class="${locale === "en" ? "is-active" : ""}" href="${withLocale(currentPath, "en")}">EN</a>
  </div>`;

const renderLayout = ({ title, description, body, locale, currentPath, site }: LayoutOptions): string => {
  const labels = ui[locale];
  const currentPathname = currentPath.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const categoryLinks = site.categories
    .map((category) => {
      const categoryPath = `/archive/${category.key}`;
      const isCategoryActive = currentPathname === categoryPath || currentPathname.startsWith(`${categoryPath}/`);
      const isCategoryExact = currentPathname === categoryPath;

      return `
        <div class="nav-item ${isCategoryActive ? "is-active" : ""}">
          <a class="nav-link ${isCategoryActive ? "is-active" : ""}" href="${archiveHref(locale, category.key)}"${isCategoryExact ? " aria-current=\"page\"" : ""}>
            <span>${escapeHtml(text(category.label, locale))}</span>
          </a>
          <div class="nav-submenu" aria-label="${escapeHtml(`${text(category.label, locale)} ${locale === "ko" ? "하위 카테고리" : "subcategories"}`)}">
            <p>${escapeHtml(text(category.description, locale))}</p>
            ${category.subcategories
              .map((subcategory) => {
                const subcategoryPath = `/archive/${category.key}/${subcategory.key}`;
                const isSubcategoryActive = currentPathname === subcategoryPath;

                return `
                  <a class="${isSubcategoryActive ? "is-active" : ""}" href="${archiveHref(locale, category.key, subcategory.key)}"${isSubcategoryActive ? " aria-current=\"page\"" : ""}>
                    <span>${escapeHtml(text(subcategory.label, locale))}</span>
                  </a>`;
              })
              .join("")}
          </div>
        </div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css?v=${assetVersion}" />
    <script src="/client.js?v=${assetVersion}" defer></script>
  </head>
  <body>
    <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>

    <header class="site-header" data-header>
      <a class="brand" href="${withLocale("/", locale)}" aria-label="The Thing home">
        <span class="brand-text">The Thing</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        ${categoryLinks}
      </nav>

      <div class="header-tools">
        <a href="${archiveHref(locale)}">${escapeHtml(labels.archive)}</a>
        ${renderLanguageSwitch(currentPath, locale)}
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button>
          ${escapeHtml(labels.menu)}
        </button>
      </div>
    </header>

    <div class="mobile-menu" id="mobile-menu" data-mobile-menu>
      ${categoryLinks}
      <a href="${archiveHref(locale)}">${escapeHtml(labels.archive)}</a>
      <a href="${withLocale("/#notes", locale)}">${escapeHtml(labels.notes)}</a>
      <a href="${withLocale("/#about", locale)}">${escapeHtml(labels.about)}</a>
      ${renderLanguageSwitch(currentPath, locale)}
    </div>

    <main id="top">${body}</main>

    <footer class="site-footer">
      <p>${escapeHtml(text(site.title, locale))} / ${escapeHtml(site.issue)}</p>
      <p>${escapeHtml(locale === "ko" ? "예술, 기술, 디자인, 사유를 위한 편집 표면" : "An editorial surface for art, technology, design, and thought")}</p>
    </footer>
  </body>
</html>`;
};

const renderKeywords = (keywords: string[]): string => `
  <section class="issue-strip" aria-label="Issue rhythm" data-scroll-section>
    <p class="issue-strip-label">Issue vocabulary</p>
    <div class="issue-strip-list">
      ${keywords
        .map((keyword, index) => `<span><small>${String(index + 1).padStart(2, "0")}</small>${escapeHtml(keyword)}</span>`)
        .join("")}
    </div>
  </section>`;

const renderNotes = (notes: Note[], locale: Locale): string => notes
  .map(
    (note) => `
      <article class="note-item" data-reveal>
        <span>${escapeHtml(note.date)}</span>
        <h3>${escapeHtml(text(note.title, locale))}</h3>
        <p>${escapeHtml(text(note.body, locale))}</p>
      </article>`
  )
  .join("");

const renderArchiveRows = (articleList: Article[], site: SiteContent, locale: Locale): string => articleList
  .map((article) => {
    const label = `${categoryLabel(site.categories, article.category, locale)} / ${text(article.subcategory, locale)}`;

    return `
      <a
        href="${articleHref(article, locale)}"
        class="archive-row"
        data-preview-class="${article.heroClass}"
        data-preview-kicker="${escapeHtml(label)}"
        data-preview-title="${escapeHtml(text(article.title, locale))}"
        data-category="${article.category}"
        data-action-card
      >
        <span class="archive-date">${formatDate(article.date, locale)}</span>
        <span class="archive-title">${escapeHtml(text(article.title, locale))}</span>
        <span class="archive-category">${escapeHtml(label)}</span>
      </a>`;
  })
  .join("");

const articleHasSubcategory = (article: Article, subcategory: SubcategoryKey): boolean =>
  article.subcategoryKeys.includes(subcategory);

const renderArchiveBoard = (
  site: SiteContent,
  articleList: Article[],
  locale: Locale,
  includeFilters: boolean,
  selectedCategory?: PrimaryCategory,
  selectedSubcategory?: SubcategoryKey
): string => {
  const selectedCategoryDefinition = selectedCategory ? site.categories.find((category) => category.key === selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const visibleArticles = articleList.filter((article) => {
    if (selectedCategoryDefinition && article.category !== selectedCategoryDefinition.key) {
      return false;
    }

    return !selectedSubcategoryDefinition || articleHasSubcategory(article, selectedSubcategoryDefinition.key);
  });
  const firstArticle = visibleArticles[0];
  const firstLabel = firstArticle ? `${categoryLabel(site.categories, firstArticle.category, locale)} / ${text(firstArticle.subcategory, locale)}` : "";
  const activeLabel = selectedCategoryDefinition && selectedSubcategoryDefinition
    ? `${text(selectedCategoryDefinition.label, locale)} / ${text(selectedSubcategoryDefinition.label, locale)}`
    : selectedCategoryDefinition
      ? text(selectedCategoryDefinition.label, locale)
      : ui[locale].all;
  const filters = includeFilters
    ? `<div class="filter-shell" data-filter-shell>
      <div class="filter-row" aria-label="Archive category filter">
        <a class="filter-button ${selectedCategoryDefinition ? "" : "is-active"}" href="${archiveHref(locale)}"${selectedCategoryDefinition ? "" : " aria-current=\"page\""}>
          <span>${escapeHtml(ui[locale].all)}</span>
          <small>${articleList.length}</small>
        </a>
        ${site.categories
          .map((category) => {
            const count = articleList.filter((article) => article.category === category.key).length;
            const label = text(category.label, locale);
            const isActive = selectedCategoryDefinition?.key === category.key;
            return `<a class="filter-button ${isActive ? "is-active" : ""}" href="${archiveHref(locale, category.key)}"${isActive ? " aria-current=\"page\"" : ""}>
              <span>${escapeHtml(label)}</span>
              <small>${count}</small>
            </a>`;
          })
          .join("")}
      </div>
      <div class="filter-detail" aria-live="polite">
        ${selectedCategoryDefinition
          ? `<div class="filter-panel is-active">
              <strong>${escapeHtml(activeLabel)}</strong>
              <p>${escapeHtml(text(selectedCategoryDefinition.description, locale))}</p>
              <span class="subcategory-filter" aria-label="${escapeHtml(locale === "ko" ? "하위 카테고리 필터" : "Subcategory filter")}">
                <a class="${selectedSubcategoryDefinition ? "" : "is-active"}" href="${archiveHref(locale, selectedCategoryDefinition.key)}"${selectedSubcategoryDefinition ? "" : " aria-current=\"page\""}>${escapeHtml(locale === "ko" ? "전체" : "All")}</a>
                ${selectedCategoryDefinition.subcategories
                  .map((subcategory) => {
                    const count = articleList.filter((article) => article.category === selectedCategoryDefinition.key && articleHasSubcategory(article, subcategory.key)).length;
                    const isActive = selectedSubcategoryDefinition?.key === subcategory.key;
                    return `<a class="${isActive ? "is-active" : ""}" href="${archiveHref(locale, selectedCategoryDefinition.key, subcategory.key)}"${isActive ? " aria-current=\"page\"" : ""}>${escapeHtml(text(subcategory.label, locale))}<small>${count}</small></a>`;
                  })
                  .join("")}
              </span>
            </div>`
          : `<div class="filter-panel is-active">
              <strong>${escapeHtml(locale === "ko" ? "전체 디파트먼트" : "All Departments")}</strong>
              <p>${escapeHtml(locale === "ko" ? "카테고리와 하위 카테고리를 선택해 한 호의 글을 좁혀 읽습니다." : "Choose a category and subcategory to narrow the issue with intent.")}</p>
        </div>`}
      </div>
      <p class="filter-status" data-filter-status>${escapeHtml(activeLabel)} · ${visibleArticles.length} ${escapeHtml(locale === "ko" ? "개의 글 표시 중" : "articles showing")}</p>
    </div>`
    : "";

  return `
    ${filters}
    <div class="archive-board ${visibleArticles.length === 0 ? "is-empty" : ""}" data-archive-board data-reveal>
      <div class="archive-list" data-archive-list>
        ${visibleArticles.length > 0
          ? renderArchiveRows(visibleArticles, site, locale)
          : `<p class="archive-empty">${escapeHtml(locale === "ko" ? "아직 이 하위 카테고리로 묶인 글이 없습니다. 다른 하위 카테고리를 선택해 주세요." : "No articles are filed under this subcategory yet. Choose another subcategory to continue reading.")}</p>`}
      </div>

      ${firstArticle
        ? `<aside class="archive-preview" aria-label="Article preview">
            <span class="preview-kicker" data-preview-kicker>${escapeHtml(firstLabel)}</span>
            <span class="image-block ${firstArticle.heroClass}" data-preview-image></span>
            <h3 data-preview-title>${escapeHtml(text(firstArticle.title, locale))}</h3>
          </aside>`
        : ""}
    </div>`;
};

const renderDepartmentCards = (site: SiteContent, articleList: Article[], locale: Locale): string => site.categories
  .map((category, index) => {
    const count = articleList.filter((article) => article.category === category.key).length;
    const label = text(category.label, locale);

    return `
      <a class="department-card" href="${archiveHref(locale, category.key)}" data-reveal data-action-card data-scroll-motion>
        <span class="department-top">
          <span class="department-no">${String(index + 1).padStart(2, "0")}</span>
          <span class="department-meta">${count} ${escapeHtml(locale === "ko" ? "개의 글" : "stories")}</span>
        </span>
        <span class="department-name">${escapeHtml(label)}</span>
        <span class="department-desc">${escapeHtml(text(category.description, locale))}</span>
        <span class="subcategory-chips" aria-label="${escapeHtml(`${label} ${locale === "ko" ? "하위 카테고리" : "subcategories"}`)}">
          ${category.subcategories
            .map((subcategory) => `<span>${escapeHtml(text(subcategory.label, locale))}</span>`)
            .join("")}
        </span>
      </a>`;
  })
  .join("");

export const renderHomePage = (site: SiteContent, articleList: Article[], locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const [featuredArticle, secondaryArticle] = articleList;
  const digestArticles = articleList.slice(1, 4);
  const riverArticles = articleList.slice(3, 8);

  const body = `
    <section class="cover section-pad" aria-labelledby="hero-title" data-scroll-section>
      <div class="cover-grid">
        <div class="cover-copy" data-reveal>
          <div class="cover-edition" aria-label="Issue information">
            <span>${escapeHtml(site.issue)}</span>
            <span>${escapeHtml(text(site.month, locale))}</span>
            <span>${escapeHtml(locale === "ko" ? "독립 웹 매거진" : "Independent Web Magazine")}</span>
          </div>
          <p class="kicker">${escapeHtml(text(site.heroKicker, locale))}</p>
          <h1 id="hero-title">${escapeHtml(text(site.heroTitle, locale))}</h1>
          <p class="cover-deck">${escapeHtml(locale === "ko" ? "작업실의 사물, 화면의 질서, 브랜드의 숨, 느린 판단의 감각을 하나의 편집 표면 위에 놓았다." : "Objects in studios, order on screens, the breath of brands, and the texture of slower judgment gathered on one editorial surface.")}</p>
        </div>

        <a class="cover-art" href="${articleHref(featuredArticle, locale)}" aria-label="${escapeHtml(labels.readFeature)}" data-reveal data-action-card data-scroll-motion data-feature-card>
          <span class="image-block ${featuredArticle.heroClass}" data-feature-image></span>
          <span class="cover-caption">
            <small data-feature-kicker>${escapeHtml(categoryLabel(site.categories, featuredArticle.category, locale))} / ${escapeHtml(formatDate(featuredArticle.date, locale))}</small>
            <strong data-feature-title>${escapeHtml(text(featuredArticle.title, locale))}</strong>
          </span>
        </a>

        <aside class="cover-sidebar" data-reveal>
          <p>${escapeHtml(text(site.heroLead, locale))}</p>
          <div class="cover-links" aria-label="Issue opening articles">
            ${digestArticles
              .map(
                (article, index) => `
                  <a href="${articleHref(article, locale)}" data-feature-link data-feature-class="${article.heroClass}" data-feature-kicker="${escapeHtml(`${categoryLabel(site.categories, article.category, locale)} / ${formatDate(article.date, locale)}`)}" data-feature-title="${escapeHtml(text(article.title, locale))}">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <small>${escapeHtml(categoryLabel(site.categories, article.category, locale))}</small>
                    <strong>${escapeHtml(text(article.title, locale))}</strong>
                  </a>`
              )
              .join("")}
          </div>
        </aside>
      </div>
    </section>

    ${renderKeywords(site.keywords[locale])}

    <section class="issue-brief section-pad" aria-label="Editorial position" data-scroll-section>
      <div class="brief-copy" data-reveal>
        <p class="kicker">${escapeHtml(locale === "ko" ? "Editor’s Letter" : "Editor’s Letter")}</p>
        <h2>${escapeHtml(locale === "ko" ? "이미지가 먼저 말하고, 문장은 늦게 도착하는 한 호." : "An issue where images speak first and sentences arrive slowly.")}</h2>
      </div>
      <p class="brief-text" data-reveal>${escapeHtml(locale === "ko" ? "이번 호는 조각가의 작업대, 조용한 AI 인터페이스, 데이터 화면의 독서성, 숨 쉴 공간이 있는 브랜드 시스템을 나란히 놓는다. 빠르게 소비되는 주제를 느린 시선으로 다시 배열하는 것이 이 매거진의 방식이다." : "This issue places the sculptor's desk, quiet AI interfaces, readable data screens, and breathable brand systems side by side. The magazine rearranges fast subjects for slower attention.")}</p>
      <div class="brief-index" data-reveal>
        ${digestArticles
          .map(
            (article) => `
              <a href="${articleHref(article, locale)}">
                <span>${escapeHtml(categoryLabel(site.categories, article.category, locale))}</span>
                <strong>${escapeHtml(text(article.title, locale))}</strong>
              </a>`
          )
          .join("")}
      </div>
    </section>

    <section class="departments section-pad" aria-labelledby="departments-title" data-scroll-section>
      <div class="section-head" data-reveal>
        <p class="kicker">Routes</p>
        <h2 id="departments-title">${escapeHtml(locale === "ko" ? "네 개의 경로로 나뉘는 하나의 편집면." : "One editorial surface, divided into four routes.")}</h2>
        <p>${escapeHtml(locale === "ko" ? "아래 카드는 단순한 분류표가 아니라 이번 호를 어떤 순서로 읽을지 제안하는 경로다. 카드 위에 머무르면 각 경로의 톤이 조용히 드러난다." : "These cards are not a taxonomy table, but suggested reading routes. Hovering over each one quietly reveals its tone.")}</p>
      </div>
      <div class="department-list">
        ${renderDepartmentCards(site, articleList, locale)}
      </div>
    </section>

    <section class="issue-river section-pad" id="features" aria-labelledby="features-title" data-scroll-section>
      <div class="section-head" data-reveal>
        <p class="kicker">${escapeHtml(labels.selectedStories)}</p>
        <h2 id="features-title">${locale === "ko" ? "서로 다른 분야가 한 호 안에서 만나는 방식." : "How different fields meet inside one issue."}</h2>
      </div>

      <div class="river-layout">
        <a class="river-lead" href="${articleHref(secondaryArticle, locale)}" data-reveal data-action-card data-scroll-motion>
          <span class="image-block ${secondaryArticle.heroClass}"></span>
          <span class="river-lead-copy">
            <small>${escapeHtml(categoryLabel(site.categories, secondaryArticle.category, locale))} / ${escapeHtml(text(secondaryArticle.subcategory, locale))}</small>
            <strong>${escapeHtml(text(secondaryArticle.title, locale))}</strong>
            <em>${escapeHtml(text(secondaryArticle.excerpt, locale))}</em>
          </span>
        </a>

        <div class="river-stack">
          ${riverArticles
            .map(
              (article, index) => `
                <a class="river-card" href="${articleHref(article, locale)}" data-reveal data-action-card>
                  <span class="river-no">${String(index + 1).padStart(2, "0")}</span>
                  <span class="image-block ${article.heroClass}"></span>
                  <span class="river-card-copy">
                    <small>${escapeHtml(categoryLabel(site.categories, article.category, locale))} / ${escapeHtml(formatDate(article.date, locale))}</small>
                    <strong>${escapeHtml(text(article.title, locale))}</strong>
                    <em>${escapeHtml(text(article.excerpt, locale))}</em>
                  </span>
                </a>`
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="notes section-pad" id="notes" aria-labelledby="notes-title" data-scroll-section>
      <div class="notes-intro" data-reveal>
        <p class="kicker">${escapeHtml(labels.editorNotes)}</p>
        <h2 id="notes-title">${locale === "ko" ? "이번 호를 지나가는 세 개의 관찰." : "Three observations moving through this issue."}</h2>
      </div>

      <div class="note-list">
        ${renderNotes(site.notes, locale)}
      </div>
    </section>

    <section class="archive section-pad" id="archive" aria-labelledby="archive-title" data-scroll-section>
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">Reading Index</p>
          <h2 id="archive-title">${escapeHtml(labels.latest)}</h2>
        </div>
        <p>${escapeHtml(locale === "ko" ? "제목에 머무르면 오른쪽 프리뷰가 즉시 바뀐다. 목록은 목차이면서 동시에 이번 호의 시각적 리듬을 확인하는 장치다." : "Hover over a title and the preview updates immediately. The list is both table of contents and a way to read the issue's visual rhythm.")}</p>
      </div>

      ${renderArchiveBoard(site, articleList, locale, false)}
    </section>

    <section class="about section-pad" id="about" aria-labelledby="about-title" data-scroll-section>
      <div class="about-card" data-reveal>
        <p class="kicker">About the Magazine</p>
        <h2 id="about-title">${escapeHtml(labels.aboutTitle)}</h2>
        <p>${escapeHtml(labels.aboutBody)}</p>
      </div>

      <form class="subscribe-form" aria-label="Newsletter subscribe form" data-reveal data-success-message="${escapeHtml(labels.subscribeSuccess)}">
        <label for="email">${escapeHtml(labels.subscribe)}</label>
        <div>
          <input id="email" name="email" type="email" placeholder="name@example.com" />
          <button type="submit">Subscribe</button>
        </div>
        <p class="form-message" data-form-message aria-live="polite"></p>
      </form>
    </section>`;

  return renderLayout({ title: text(site.title, locale), description: text(site.description, locale), body, locale, currentPath, site });
};

export const renderArticlePage = (
  site: SiteContent,
  article: Article,
  relatedArticles: Article[],
  locale: Locale,
  currentPath: string
): string => {
  const labels = ui[locale];
  const category = categoryLabel(site.categories, article.category, locale);

  const body = `
    <article class="article-detail section-pad">
      <a class="back-link" href="${withLocale("/archive", locale)}">${escapeHtml(labels.back)}</a>

      <header class="article-hero-grid" data-reveal>
        <div class="article-title-block">
          <p class="kicker">${escapeHtml(article.issue)} / ${escapeHtml(category)} / ${escapeHtml(text(article.subcategory, locale))}</p>
          <h1>${escapeHtml(text(article.title, locale))}</h1>
          <p>${escapeHtml(text(article.deck, locale))}</p>
        </div>
        <div class="article-meta-card">
          <span>${formatDate(article.date, locale)}</span>
          <span>${escapeHtml(text(article.location, locale))}</span>
          <span>${escapeHtml(text(article.readTime, locale))}</span>
          <span>${article.tags[locale].map(escapeHtml).join(" / ")}</span>
        </div>
      </header>

      <div class="article-visual" data-reveal data-action-card data-scroll-motion>
        <span class="image-block ${article.heroClass}"></span>
      </div>

      <div class="article-body-grid">
        <aside class="article-side" data-reveal>
          <p>${escapeHtml(text(article.subtitle, locale))}</p>
        </aside>

        <div class="article-body">
          <blockquote data-reveal>${escapeHtml(text(article.quote, locale))}</blockquote>
          ${article.sections
            .map(
              (section) => `
                <section class="article-section" data-reveal>
                  <h2>${escapeHtml(text(section.heading, locale))}</h2>
                  ${section.paragraphs[locale].map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                </section>`
            )
            .join("")}
        </div>
      </div>
    </article>

    <section class="related section-pad" aria-labelledby="related-title">
      <div class="section-heading" data-reveal>
        <p class="kicker">Related</p>
        <h2 id="related-title">${escapeHtml(labels.related)}</h2>
      </div>
      <div class="related-grid">
        ${relatedArticles
          .map(
            (related) => `
              <a class="story-card" href="${articleHref(related, locale)}" data-reveal data-action-card>
                <span class="image-block ${related.heroClass}"></span>
                <div>
                  <p class="kicker">${escapeHtml(categoryLabel(site.categories, related.category, locale))} / ${escapeHtml(text(related.subcategory, locale))}</p>
                  <h3>${escapeHtml(text(related.title, locale))}</h3>
                  <p>${escapeHtml(text(related.excerpt, locale))}</p>
                </div>
              </a>`
          )
          .join("")}
      </div>
    </section>`;

  return renderLayout({
    title: `${text(article.title, locale)} | ${text(site.title, locale)}`,
    description: text(article.deck, locale),
    body,
    locale,
    currentPath,
    site
  });
};

export const renderArchivePage = (
  site: SiteContent,
  articleList: Article[],
  locale: Locale,
  currentPath: string,
  selectedCategory?: PrimaryCategory,
  selectedSubcategory?: SubcategoryKey
): string => {
  const labels = ui[locale];
  const selectedCategoryDefinition = selectedCategory ? site.categories.find((category) => category.key === selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const archiveTitle = selectedCategoryDefinition && selectedSubcategoryDefinition
    ? `${text(selectedCategoryDefinition.label, locale)} / ${text(selectedSubcategoryDefinition.label, locale)}`
    : selectedCategoryDefinition
      ? text(selectedCategoryDefinition.label, locale)
      : labels.fullArchive;
  const archiveLead = selectedCategoryDefinition ? text(selectedCategoryDefinition.description, locale) : labels.archiveLead;
  const body = `
    <section class="archive archive-page section-pad" aria-labelledby="archive-title">
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">${escapeHtml(selectedCategoryDefinition ? "Department Archive" : "Full Archive")}</p>
          <h1 id="archive-title">${escapeHtml(archiveTitle)}</h1>
        </div>
        <p>${escapeHtml(archiveLead)}</p>
      </div>

      ${renderArchiveBoard(site, articleList, locale, true, selectedCategory, selectedSubcategory)}
    </section>`;

  return renderLayout({ title: `${archiveTitle} | ${text(site.title, locale)}`, description: archiveLead, body, locale, currentPath, site });
};

export const renderNotFoundPage = (site: SiteContent, locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const body = `
    <section class="not-found section-pad">
      <p class="kicker">404</p>
      <h1>${escapeHtml(labels.notFound)}</h1>
      <p>${escapeHtml(labels.notFoundBody)}</p>
      <a class="text-link" href="${withLocale("/", locale)}">Return home</a>
    </section>`;

  return renderLayout({ title: `Not Found | ${text(site.title, locale)}`, description: text(site.description, locale), body, locale, currentPath, site });
};
