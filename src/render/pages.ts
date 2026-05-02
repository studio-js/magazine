import type { Article, CategoryDefinition, Locale, LocalizedText, Note, PrimaryCategory, SiteContent } from "../types";

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
    aboutTitle: "The Thing은 서로 다른 분야를 하나의 편집 리듬으로 묶는 독립 웹매거진입니다.",
    aboutBody:
      "예술의 이미지, 테크의 시스템, 디자인의 구조, 철학의 질문을 한 화면 안에서 연결합니다. 블로그 피드보다 이슈와 디파트먼트가 먼저 보이는 편집형 웹 매거진을 지향합니다.",
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
    aboutTitle: "The Thing is an independent web magazine that connects different fields through one editorial rhythm.",
    aboutBody:
      "It links images from art, systems from tech, structures from design, and questions from philosophy on one surface. It is shaped as an issue-led editorial magazine rather than a chronological blog feed.",
    subscribe: "Get New Notes",
    subscribeSuccess: "Prototype subscription recorded.",
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

const categoryLabel = (categories: CategoryDefinition[], key: PrimaryCategory, locale: Locale): string =>
  text(categories.find((category) => category.key === key)?.label ?? { ko: key, en: key }, locale);

const renderSubcategoryChips = (category: CategoryDefinition, locale: Locale): string => `
  <span class="subcategory-chips" aria-label="${escapeHtml(locale === "ko" ? "하위 카테고리" : "Subcategories")}">
    ${category.subcategories.map((item) => `<span>${escapeHtml(text(item, locale))}</span>`).join("")}
  </span>`;

const renderLanguageSwitch = (currentPath: string, locale: Locale): string => `
  <div class="language-switch" aria-label="Language switcher">
    <a class="${locale === "ko" ? "is-active" : ""}" href="${withLocale(currentPath, "ko")}">KR</a>
    <a class="${locale === "en" ? "is-active" : ""}" href="${withLocale(currentPath, "en")}">EN</a>
  </div>`;

const renderLayout = ({ title, description, body, locale, currentPath, site }: LayoutOptions): string => {
  const labels = ui[locale];
  const categoryLinks = site.categories
    .map(
      (category) => `
        <a href="${withLocale(`/archive?category=${category.key}`, locale)}">
          <span>${escapeHtml(text(category.label, locale))}</span>
          <small>${escapeHtml(category.subcategories.map((item) => text(item, locale)).join(" / "))}</small>
        </a>`
    )
    .join("");

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/styles.css" />
    <script src="/client.js" defer></script>
  </head>
  <body>
    <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>

    <header class="site-header" data-header>
      <a class="brand" href="${withLocale("/", locale)}" aria-label="The Thing home">
        <span class="brand-mark">T</span>
        <span class="brand-text">The Thing</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
        ${categoryLinks}
      </nav>

      <div class="header-tools">
        <a href="${withLocale("/archive", locale)}">${escapeHtml(labels.archive)}</a>
        ${renderLanguageSwitch(currentPath, locale)}
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button>
          ${escapeHtml(labels.menu)}
        </button>
      </div>
    </header>

    <div class="mobile-menu" id="mobile-menu" data-mobile-menu>
      ${categoryLinks}
      <a href="${withLocale("/archive", locale)}">${escapeHtml(labels.archive)}</a>
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
  <div class="issue-strip" aria-label="Magazine keywords">
    ${keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
  </div>`;

const renderCategoryIndex = (categories: CategoryDefinition[], articles: Article[], locale: Locale): string => `
  <section class="departments section-pad" aria-labelledby="category-index-title">
    <div class="section-head" data-reveal>
      <p class="kicker">${escapeHtml(ui[locale].categoryIndex)}</p>
      <h2 id="category-index-title">${locale === "ko" ? "이슈를 읽는 네 개의 입구." : "Four entries into the issue."}</h2>
    </div>
    <div class="department-list">
      ${categories
        .map((category, index) => {
          const count = articles.filter((article) => article.category === category.key).length;
          return `
            <a class="department-card" href="${withLocale(`/archive?category=${category.key}`, locale)}" data-reveal>
              <span class="department-top">
                <span class="department-no">${String(index + 1).padStart(2, "0")}</span>
                <span class="department-meta">${count} ${locale === "ko" ? "편" : "articles"}</span>
              </span>
              <span class="department-name">${escapeHtml(text(category.label, locale))}</span>
              <span class="department-desc">${escapeHtml(text(category.description, locale))}</span>
              ${renderSubcategoryChips(category, locale)}
            </a>`;
        })
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
      >
        <span class="archive-date">${formatDate(article.date, locale)}</span>
        <span class="archive-title">${escapeHtml(text(article.title, locale))}</span>
        <span class="archive-category">${escapeHtml(label)}</span>
      </a>`;
  })
  .join("");

const renderArchiveBoard = (site: SiteContent, articleList: Article[], locale: Locale, includeFilters: boolean): string => {
  const firstArticle = articleList[0];
  const firstLabel = `${categoryLabel(site.categories, firstArticle.category, locale)} / ${text(firstArticle.subcategory, locale)}`;
  const filters = includeFilters
    ? `<div class="filter-shell" data-filter-shell>
      <div class="filter-row" aria-label="Archive category filter">
        <button type="button" class="filter-button is-active" data-filter="all" data-filter-label="${escapeHtml(ui[locale].all)}" aria-pressed="true">
          <span>${escapeHtml(ui[locale].all)}</span>
          <small>${articleList.length}</small>
        </button>
        ${site.categories
          .map((category) => {
            const count = articleList.filter((article) => article.category === category.key).length;
            const label = text(category.label, locale);
            return `<button type="button" class="filter-button" data-filter="${category.key}" data-filter-label="${escapeHtml(label)}" aria-pressed="false">
              <span>${escapeHtml(label)}</span>
              <small>${count}</small>
            </button>`;
          })
          .join("")}
      </div>
      <div class="filter-detail" aria-live="polite">
        <div class="filter-panel is-active" data-filter-panel="all">
          <strong>${escapeHtml(locale === "ko" ? "전체 디파트먼트" : "All Departments")}</strong>
          <p>${escapeHtml(locale === "ko" ? "네 개의 카테고리와 모든 글을 한 번에 봅니다." : "Scan every article across the four departments.")}</p>
        </div>
        ${site.categories
          .map(
            (category) => `
              <div class="filter-panel" data-filter-panel="${category.key}" hidden>
                <strong>${escapeHtml(text(category.label, locale))}</strong>
                <p>${escapeHtml(text(category.description, locale))}</p>
                ${renderSubcategoryChips(category, locale)}
              </div>`
          )
          .join("")}
      </div>
      <p class="filter-status" data-filter-status>${articleList.length} ${escapeHtml(locale === "ko" ? "개의 글 표시 중" : "articles showing")}</p>
    </div>`
    : "";

  return `
    ${filters}
    <div class="archive-board" data-archive-board data-reveal>
      <div class="archive-list" data-archive-list>
        ${renderArchiveRows(articleList, site, locale)}
      </div>

      <aside class="archive-preview" aria-label="Article preview">
        <span class="preview-kicker" data-preview-kicker>${escapeHtml(firstLabel)}</span>
        <span class="image-block ${firstArticle.heroClass}" data-preview-image></span>
        <h3 data-preview-title>${escapeHtml(text(firstArticle.title, locale))}</h3>
      </aside>
    </div>`;
};

export const renderHomePage = (site: SiteContent, articleList: Article[], locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const [featuredArticle, secondaryArticle] = articleList;
  const digestArticles = articleList.slice(1, 4);
  const riverArticles = articleList.slice(3, 8);

  const body = `
    <section class="cover section-pad" aria-labelledby="hero-title">
      <div class="cover-masthead" data-reveal>
        <span>${escapeHtml(text(site.title, locale))}</span>
        <span>${escapeHtml(site.issue)}</span>
        <span>${escapeHtml(text(site.month, locale))}</span>
      </div>

      <div class="cover-grid">
        <div class="cover-copy" data-reveal>
          <p class="kicker">${escapeHtml(text(site.heroKicker, locale))}</p>
          <h1 id="hero-title">${escapeHtml(text(site.heroTitle, locale))}</h1>
        </div>

        <a class="cover-art" href="${articleHref(featuredArticle, locale)}" aria-label="${escapeHtml(labels.readFeature)}" data-reveal data-tilt>
          <span class="image-block ${featuredArticle.heroClass}"></span>
          <span class="cover-caption">
            <small>${escapeHtml(categoryLabel(site.categories, featuredArticle.category, locale))} / ${escapeHtml(formatDate(featuredArticle.date, locale))}</small>
            <strong>${escapeHtml(text(featuredArticle.title, locale))}</strong>
          </span>
        </a>

        <aside class="cover-sidebar" data-reveal>
          <p>${escapeHtml(text(site.heroLead, locale))}</p>
          <div class="cover-links" aria-label="Issue opening articles">
            ${digestArticles
              .map(
                (article, index) => `
                  <a href="${articleHref(article, locale)}">
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

    <section class="issue-brief section-pad" aria-label="Editorial position">
      <div class="brief-copy" data-reveal>
        <p class="kicker">${escapeHtml(locale === "ko" ? "Editorial Position" : "Editorial Position")}</p>
        <h2>${escapeHtml(locale === "ko" ? "하나의 피드가 아니라, 한 권의 얇은 매거진처럼 읽히는 화면." : "Not a feed, but a thin issue you can read as a magazine.")}</h2>
      </div>
      <p class="brief-text" data-reveal>${escapeHtml(locale === "ko" ? "커버에서 시작해 디파트먼트로 내려가고, 목록은 빠르게 소비하는 대신 선택의 여지를 남깁니다. 색은 따뜻한 종이 톤에 머물고, 인터랙션은 시선을 방해하지 않는 작은 움직임만 남겼습니다." : "The page begins as a cover, descends into departments, and leaves room to choose rather than consume quickly. The palette stays close to warm paper, while motion remains quiet and functional.")}</p>
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

    ${renderCategoryIndex(site.categories, articleList, locale)}

    <section class="issue-river section-pad" id="features" aria-labelledby="features-title">
      <div class="section-head" data-reveal>
        <p class="kicker">${escapeHtml(labels.selectedStories)}</p>
        <h2 id="features-title">${locale === "ko" ? "서로 다른 분야가 한 호 안에서 만나는 방식." : "How different fields meet inside one issue."}</h2>
      </div>

      <div class="river-layout">
        <a class="river-lead" href="${articleHref(secondaryArticle, locale)}" data-reveal data-tilt>
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
                <a class="river-card" href="${articleHref(article, locale)}" data-reveal>
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

    <section class="visual-edit section-pad" aria-label="Visual edit">
      <div class="visual-edit-grid">
        ${articleList
          .slice(0, 6)
          .map(
            (article) => `
              <a href="${articleHref(article, locale)}" data-reveal>
                <span class="image-block ${article.heroClass}"></span>
                <small>${escapeHtml(categoryLabel(site.categories, article.category, locale))}</small>
                <strong>${escapeHtml(text(article.title, locale))}</strong>
              </a>`
          )
          .join("")}
      </div>
    </section>

    <section class="notes section-pad" id="notes" aria-labelledby="notes-title">
      <div class="notes-intro" data-reveal>
        <p class="kicker">${escapeHtml(labels.editorNotes)}</p>
        <h2 id="notes-title">${locale === "ko" ? "짧게 남긴 편집실의 메모." : "Short notes from the desk."}</h2>
      </div>

      <div class="note-list">
        ${renderNotes(site.notes, locale)}
      </div>
    </section>

    <section class="archive section-pad" id="archive" aria-labelledby="archive-title">
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">Reading Index</p>
          <h2 id="archive-title">${escapeHtml(labels.latest)}</h2>
        </div>
        <p>${escapeHtml(locale === "ko" ? "글 전체를 빠르게 훑는 마지막 색인입니다. 데스크톱에서는 항목을 올리면 오른쪽 이미지가 조용히 바뀝니다." : "A final index for scanning the full issue. On desktop, the image changes quietly as the reader moves through the list.")}</p>
      </div>

      ${renderArchiveBoard(site, articleList, locale, false)}
    </section>

    <section class="about section-pad" id="about" aria-labelledby="about-title">
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

      <div class="article-visual" data-reveal data-tilt>
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
              <a class="story-card" href="${articleHref(related, locale)}" data-reveal data-tilt>
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

export const renderArchivePage = (site: SiteContent, articleList: Article[], locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const body = `
    <section class="archive archive-page section-pad" aria-labelledby="archive-title">
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">Full Archive</p>
          <h1 id="archive-title">${escapeHtml(labels.fullArchive)}</h1>
        </div>
        <p>${escapeHtml(labels.archiveLead)}</p>
      </div>

      ${renderArchiveBoard(site, articleList, locale, true)}
    </section>`;

  return renderLayout({ title: `Archive | ${text(site.title, locale)}`, description: text(site.description, locale), body, locale, currentPath, site });
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
