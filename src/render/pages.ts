import { supabasePublicConfig } from "../config/supabase";
import type { Article, ArticleBlockImage, ArticleSection, ArticleSectionBlock, CategoryDefinition, IssueFeature, IssueProject, Locale, LocalizedText, Note, PrimaryCategory, SiteContent, SubcategoryKey } from "../types";

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
    issue: "이슈",
    features: "주요 글",
    notes: "Habitus",
    archive: "Archive",
    about: "About",
    menu: "메뉴",
    all: "전체",
    read: "읽기",
    readFeature: "대표 글 읽기",
    selectedStories: "SELECTED STORIES",
    categoryIndex: "카테고리 인덱스",
    latest: "최근 발행",
    editorNotes: "EDITOR'S NOTES",
    aboutTitle: "아비투스는 취향의 조건과 감각의 출처를 읽는 디지털 매거진입니다.",
    aboutBody:
      "예술의 이미지, 테크의 시스템, 디자인의 구조, 뷰티의 감각, 철학의 질문을 통해 취향이 어떻게 만들어지고 구별되는지 살핍니다.",
    subscribe: "새 글 알림 받기",
    subscribeSuccess: "구독 신청이 기록되었습니다.",
    fullArchive: "All Articles",
    archiveLead: "날짜, 제목, 분야만 먼저 남겨 읽는 순서를 만드는 목록입니다.",
    related: "이어 읽기",
    back: "아카이브로 돌아가기",
    notFound: "요청한 페이지를 찾을 수 없습니다.",
    notFoundBody: "주소가 바뀌었거나 아직 발행되지 않은 글입니다."
  },
  en: {
    issue: "Issue",
    features: "Features",
    notes: "Habitus",
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
    aboutTitle: "Habitus is a digital magazine about the conditions and origins of taste.",
    aboutBody:
      "It reads images from art, systems from technology, structures from design, senses from beauty, and questions from philosophy as ways taste is formed and distinguished.",
    subscribe: "Get New Notes",
    subscribeSuccess: "Subscription request noted.",
    fullArchive: "All Articles",
    archiveLead: "A compact index ordered by date, title, and department.",
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

const latestIssue = (site: SiteContent): IssueProject => site.issueProjects[0];
const pageSize = 5;

export const issueSlug = (issue: IssueProject): string => issue.number
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "") || "issue";

const issueHref = (issue: IssueProject, locale: Locale): string => withLocale(`/issues/${issueSlug(issue)}/`, locale);

const issueIndexHref = (locale: Locale, page = 1): string => withLocale(page <= 1 ? "/issues" : `/issues/page/${page}/`, locale);

const archiveHref = (locale: Locale, category?: PrimaryCategory, subcategory?: SubcategoryKey): string => {
  if (category && subcategory) {
    return withLocale(`/archive/${category}/${subcategory}/`, locale);
  }

  return withLocale(category ? `/archive/${category}/` : "/archive", locale);
};

const archivePageHref = (locale: Locale, page = 1, category?: PrimaryCategory, subcategory?: SubcategoryKey): string => {
  if (page <= 1) {
    return archiveHref(locale, category, subcategory);
  }

  if (category && subcategory) {
    return withLocale(`/archive/${category}/${subcategory}/page/${page}/`, locale);
  }

  return withLocale(category ? `/archive/${category}/page/${page}/` : `/archive/page/${page}/`, locale);
};

const pageCount = (itemCount: number): number => Math.max(1, Math.ceil(itemCount / pageSize));

const normalizedPage = (page: number | undefined, itemCount: number): number => {
  const pageNumber = Number.isFinite(page) ? Math.trunc(page ?? 1) : 1;
  return Math.min(Math.max(pageNumber, 1), pageCount(itemCount));
};

const renderPagination = (currentPage: number, totalPages: number, hrefForPage: (page: number) => string, locale: Locale): string => `<nav class="pagination" aria-label="${escapeHtml(locale === "ko" ? "페이지" : "Pagination")}">
        <span>${escapeHtml(locale === "ko" ? "페이지" : "Page")}</span>
        <div>
          ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return `<a class="${page === currentPage ? "is-active" : ""}" href="${hrefForPage(page)}"${page === currentPage ? " aria-current=\"page\"" : ""}>${page}</a>`;
          }).join("\n          ")}
        </div>
      </nav>`;

const categoryLabel = (categories: CategoryDefinition[], key: PrimaryCategory, locale: Locale): string =>
  text(categories.find((category) => category.key === key)?.label ?? { ko: key, en: key }, locale);

const renderImageBlock = (visualClass: string, imageUrl?: string, attributes = ""): string =>
  `<span class="image-block ${escapeHtml(visualClass)}${imageUrl ? " has-custom-image" : ""}"${attributes ? ` ${attributes}` : ""}>${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" loading="lazy" decoding="async" data-image-source />` : ""}</span>`;

const issueCoverVisual = (issue: IssueProject): string =>
  issue.features.find((feature) => feature.heroImage && feature.heroImage === issue.coverImage)?.heroClass
  ?? issue.features[0]?.heroClass
  ?? "image-material";

const issueCoverImage = (issue: IssueProject): string =>
  issue.coverImage || issue.features.find((feature) => feature.heroImage)?.heroImage || "";

const isPhotographicImage = (imageUrl = ""): boolean => imageUrl.length > 0 && !/\.svg(?:$|[?#])/.test(imageUrl);

const issueFeatureImage = (feature: IssueFeature): string => isPhotographicImage(feature.heroImage) ? feature.heroImage ?? "" : "";

const rotatedIssueFeatures = (features: IssueFeature[], startIndex: number, limit = 4): IssueFeature[] => {
  if (features.length === 0) {
    return [];
  }

  return Array.from({ length: Math.min(limit, features.length) }, (_, offset) => features[(startIndex + offset) % features.length]);
};

const spreadSlotDataAttributes = (features: IssueFeature[], startIndex: number): string => rotatedIssueFeatures(features, startIndex)
  .map((feature, index) => {
    const slotIndex = index + 1;
    const featureIndex = features.indexOf(feature);

    return [
      `data-spread-slot${slotIndex}-no="${String(featureIndex + 1).padStart(2, "0")}"`,
      `data-spread-slot${slotIndex}-visual="${escapeHtml(feature.heroClass)}"`,
      `data-spread-slot${slotIndex}-image="${escapeHtml(issueFeatureImage(feature))}"`
    ].join(" ");
  })
  .join(" ");

const renderIssuePrototype = (issue: IssueProject, locale: Locale, variant: "home" | "collection" | "detail" = "detail"): string => {
  const titleWords = text(issue.title, locale).split(/\s+/).filter(Boolean);
  const coverLines = issue.features.slice(0, 3)
    .map((feature, index) => `            <span>${String(index + 1).padStart(2, "0")} ${escapeHtml(text(feature.title, locale))}</span>`)
    .join("\n");
  const coverTitle = titleWords.length > 1
    ? titleWords.map((word) => `<strong>${escapeHtml(word)}</strong>`).join("\n                  ")
    : `<strong>${escapeHtml(text(issue.title, locale))}</strong>`;

  return `<figure class="magazine-prototype magazine-prototype-${variant}" aria-label="${escapeHtml(locale === "ko" ? `${issue.number} 잡지 프로토타입` : `${issue.number} magazine prototype`)}">
          <div class="magazine-prototype-stage">
            <div class="magazine-cover-stack">
              <div class="magazine-cover-sheet">
                ${renderImageBlock(issueCoverVisual(issue), issueCoverImage(issue))}
                <div class="magazine-cover-type">
                  <div class="magazine-cover-topline">
                    <span>Habitus</span>
                    <small>${escapeHtml(issue.number)}</small>
                  </div>
                  <div class="magazine-cover-title">
                  ${coverTitle}
                  </div>
                  <em>${escapeHtml(locale === "ko" ? "취향에 관하여" : "On Taste")}</em>
                </div>
                <div class="magazine-cover-lines" aria-hidden="true">
${coverLines}
                </div>
                <div class="magazine-cover-footer" aria-hidden="true">
                  <span>${escapeHtml(text(issue.date, locale))}</span>
                  <span>${escapeHtml(text(issue.format, locale))}</span>
                </div>
              </div>
            </div>
          </div>
        </figure>`;
};

const renderIssueSpread = (issue: IssueProject, locale: Locale): string => {
  const spreadCopy = [text(issue.deck, locale), text(issue.editorNote, locale)]
    .map((paragraph) => `                <p>${escapeHtml(paragraph)}</p>`)
    .join("\n");
  const coverFeature = issue.features.find((feature) => feature.heroImage && feature.heroImage === issue.coverImage);
  const photographicFeatures = issue.features.filter((feature) => isPhotographicImage(feature.heroImage));
  const spreadImages = [
    ...(coverFeature ? [coverFeature] : []),
    ...photographicFeatures.filter((feature) => feature !== coverFeature)
  ].slice(0, 4);
  const imageFeatures = spreadImages.length > 0 ? spreadImages : issue.features.slice(0, 4);
  const imageGrid = imageFeatures
    .map((feature, index) => `              <span class="magazine-spread-image-slot ${index === 0 ? "is-large is-current" : ""}" data-issue-spread-slot${index === 0 ? " data-issue-spread-main-slot" : ""}>
                 ${renderImageBlock(feature.heroClass, feature.heroImage, `${index === 0 ? "data-issue-spread-main-image " : ""}data-issue-spread-slot-image`)}
                 <small data-issue-spread-slot-no${index === 0 ? " data-issue-spread-main-no" : ""}>${String(issue.features.indexOf(feature) + 1).padStart(2, "0")}</small>
               </span>`)
    .join("\n");
  const contents = issue.features.slice(0, 4)
    .map((feature, index) => `            <span>
              <small>${String(index + 1).padStart(2, "0")}</small>
              <strong>${escapeHtml(text(feature.title, locale))}</strong>
            </span>`)
    .join("\n");

  return `<figure class="magazine-spread-mockup" data-issue-spread aria-label="${escapeHtml(locale === "ko" ? `${issue.number} 펼친 잡지 목업` : `${issue.number} open magazine mockup`)}">
          <div class="magazine-spread-boundary">
            <section class="magazine-spread-page is-text-page">
              <div class="magazine-spread-masthead">
                <span>Habitus</span>
                <small>${escapeHtml(`${issue.number} / ${text(issue.date, locale)}`)}</small>
              </div>
              <div class="magazine-spread-feature">
                <p data-issue-spread-role>${escapeHtml(locale === "ko" ? "Current Issue" : "Current Issue")}</p>
                <h2 data-issue-spread-title>${escapeHtml(text(issue.title, locale))}</h2>
                <em data-issue-spread-intro>${escapeHtml(text(issue.subtitle, locale))}</em>
              </div>
              <div class="magazine-spread-copy" data-issue-spread-copy>
${spreadCopy}
              </div>
              <div class="magazine-spread-contents">
${contents}
              </div>
            </section>
            <section class="magazine-spread-page is-image-page">
              <div class="magazine-spread-image-grid">
${imageGrid}
              </div>
              <p data-issue-spread-deck>${escapeHtml(text(issue.deck, locale))}</p>
            </section>
          </div>
        </figure>`;
};

const assetVersion = "20260504-supabase-content";

const contentVersionHash = (value: string): string => {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const renderLanguageSwitch = (currentPath: string, locale: Locale): string => `
  <div class="language-switch" aria-label="Language switcher">
    <a class="${locale === "ko" ? "is-active" : ""}" href="${withLocale(currentPath, "ko")}">KR</a>
    <a class="${locale === "en" ? "is-active" : ""}" href="${withLocale(currentPath, "en")}">EN</a>
  </div>`;

const renderLayout = ({ title, description, body, locale, currentPath, site }: LayoutOptions): string => {
  const labels = ui[locale];
  const currentIssue = latestIssue(site);
  const currentPathname = currentPath.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const supabaseAttributes = supabasePublicConfig.enabled
    ? ` data-supabase-url="${escapeHtml(supabasePublicConfig.url)}" data-supabase-anon-key="${escapeHtml(supabasePublicConfig.anonKey)}" data-supabase-functions-url="${escapeHtml(supabasePublicConfig.functionsUrl)}"`
    : "";
  const isIssueActive = currentPathname === "/issues" || currentPathname.startsWith("/issues/");
  const isLatestIssuePage = currentPathname === `/issues/${issueSlug(currentIssue)}`;
  const issueNavItem = `        <div class="nav-item issue-nav-item ${isIssueActive ? "is-active" : ""}">
          <a class="nav-link ${isIssueActive ? "is-active" : ""}" href="${issueHref(currentIssue, locale)}"${isLatestIssuePage ? " aria-current=\"page\"" : ""}>
            <span>${escapeHtml(labels.issue)}</span>
          </a>
          <div class="nav-submenu issue-submenu" aria-label="${escapeHtml(locale === "ko" ? "이슈 안내" : "Issue guide")}">
            <a class="${isLatestIssuePage ? "is-active" : ""}" href="${issueHref(currentIssue, locale)}"${isLatestIssuePage ? " aria-current=\"page\"" : ""}><span>${escapeHtml(`${currentIssue.number} · ${text(currentIssue.title, locale)}`)}</span></a>
          </div>
        </div>`;
  const categoryLinks = site.categories
    .map((category) => {
      const categoryPath = `/archive/${category.key}`;
      const isCategoryActive = currentPathname === categoryPath || currentPathname.startsWith(`${categoryPath}/`);
      const isCategoryExact = currentPathname === categoryPath;

      return `        <div class="nav-item ${isCategoryActive ? "is-active" : ""}">
          <a class="nav-link ${isCategoryActive ? "is-active" : ""}" href="${archiveHref(locale, category.key)}"${isCategoryExact ? " aria-current=\"page\"" : ""}>
            <span>${escapeHtml(text(category.label, locale))}</span>
          </a>
          <div class="nav-submenu" aria-label="${escapeHtml(`${text(category.label, locale)} ${locale === "ko" ? "하위 카테고리" : "subcategories"}`)}">
            ${category.subcategories
              .map((subcategory) => {
                const subcategoryPath = `/archive/${category.key}/${subcategory.key}`;
                const isSubcategoryActive = currentPathname === subcategoryPath;

                return `                  <a class="${isSubcategoryActive ? "is-active" : ""}" href="${archiveHref(locale, category.key, subcategory.key)}"${isSubcategoryActive ? " aria-current=\"page\"" : ""}>
                    <span>${escapeHtml(text(subcategory.label, locale))}</span>
                  </a>`;
              })
              .join("\n")}
          </div>
        </div>`;
    })
    .join("\n");

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
  <body${supabaseAttributes}>
    <div class="scroll-progress" data-scroll-progress aria-hidden="true"></div>

    <header class="site-header" data-header>
      <a class="brand" href="${withLocale("/", locale)}" aria-label="${escapeHtml(text(site.title, locale))} home">
        <span class="brand-text">${escapeHtml(text(site.title, locale))}</span>
      </a>

      <nav class="nav" aria-label="Primary navigation">
${issueNavItem}
${categoryLinks}
      </nav>

      <div class="header-tools">
        <a class="about-tool" href="${withLocale("/about", locale)}">${escapeHtml(labels.about)}</a>
        <a href="${archiveHref(locale)}">${escapeHtml(labels.archive)}</a>
        <a class="issue-index-tool" href="${issueIndexHref(locale)}">Issue Index</a>
        ${renderLanguageSwitch(currentPath, locale)}
        <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button>
          ${escapeHtml(labels.menu)}
        </button>
      </div>
    </header>

    <div class="mobile-menu" id="mobile-menu" data-mobile-menu>
${issueNavItem}
${categoryLinks}
      <a href="${withLocale("/about", locale)}">${escapeHtml(labels.about)}</a>
      <a href="${archiveHref(locale)}">${escapeHtml(labels.archive)}</a>
      <a href="${issueIndexHref(locale)}">Issue Index</a>
      <a href="${withLocale("/#notes", locale)}">${escapeHtml(labels.notes)}</a>
      ${renderLanguageSwitch(currentPath, locale)}
    </div>

    <main id="top">${body}</main>

    <footer class="site-footer">
      <p>${escapeHtml(text(site.title, locale))}</p>
      <p>${escapeHtml(locale === "ko" ? "취향에 관하여" : "On Taste")}</p>
    </footer>
  </body>
</html>`;
};

const renderNotes = (notes: Note[], locale: Locale): string => notes
  .map(
    (note, index) => `
      <article class="method-item" data-reveal data-scroll-motion>
        <span class="method-no">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3>${escapeHtml(text(note.title, locale))}</h3>
          <p>${escapeHtml(text(note.body, locale))}</p>
        </div>
      </article>`
  )
  .join("");

const renderHomeArchiveMap = (site: SiteContent, articleList: Article[], locale: Locale): string => site.categories
  .map((category, index) => {
    const categoryArticles = articleList.filter((article) => article.category === category.key);
    const latestArticle = categoryArticles[0];
    const latestLabel = latestArticle
      ? `${locale === "ko" ? "최근 글" : "Latest"} · ${text(latestArticle.title, locale)}`
      : locale === "ko"
        ? "아직 발행된 글이 없습니다"
        : "No entries yet";

    return `              <a class="archive-map-row" href="${archiveHref(locale, category.key)}" data-reveal data-action-card data-scroll-motion>
                <span class="archive-map-no">${String(index + 1).padStart(2, "0")}</span>
                <span class="archive-map-main">
                  <strong>${escapeHtml(text(category.label, locale))}</strong>
                  <em>${escapeHtml(text(category.description, locale))}</em>
                </span>
                <span class="archive-map-meta">
                  <small>${escapeHtml(locale === "ko" ? `${categoryArticles.length}개의 글` : `${categoryArticles.length} articles`)}</small>
                  <b>${escapeHtml(latestLabel)}</b>
                </span>
                <span class="archive-map-subjects">
                  ${category.subcategories.map((subcategory) => `<span>${escapeHtml(text(subcategory.label, locale))}</span>`).join("\n                  ")}
                </span>
              </a>`;
  })
  .join("\n");

const renderArchiveRows = (
  articleList: Article[],
  site: SiteContent,
  locale: Locale,
  selectedCategory?: PrimaryCategory,
  selectedSubcategory?: SubcategoryKey,
  rowOffset = 0
): string => articleList
  .map((article, index) => {
    const fullLabel = `${categoryLabel(site.categories, article.category, locale)} / ${text(article.subcategory, locale)}`;
    const rowLabel = selectedSubcategory
      ? categoryLabel(site.categories, article.category, locale)
      : selectedCategory
        ? text(article.subcategory, locale)
        : fullLabel;
    const rowNo = String(rowOffset + index + 1).padStart(2, "0");

    return `      <a
        href="${articleHref(article, locale)}"
        class="archive-row"
        data-preview-class="${article.heroClass}"
        data-preview-image="${escapeHtml(article.heroImage ?? "")}"
        data-preview-kicker="${escapeHtml(fullLabel)}"
        data-preview-title="${escapeHtml(text(article.title, locale))}"
        data-category="${article.category}"
        data-action-card
      >
        <span class="archive-date"><b>${rowNo}</b><small>${formatDate(article.date, locale)}</small></span>
        <span class="archive-title">${escapeHtml(text(article.title, locale))}</span>
        <span class="archive-category"><span>${escapeHtml(rowLabel)}</span><small>${escapeHtml(text(article.location, locale))}</small></span>
        <span class="archive-info">
          <span>${escapeHtml(text(article.readTime, locale))}</span>
        </span>
        <span class="archive-summary">${escapeHtml(text(article.excerpt, locale))}</span>
      </a>`;
  })
  .join("\n");

const articleHasSubcategory = (article: Article, subcategory: SubcategoryKey): boolean =>
  article.subcategoryKeys.includes(subcategory);

const countText = (count: number, locale: Locale): string => locale === "ko" ? `${count}개` : `${count} ${count === 1 ? "article" : "articles"}`;

const renderArchiveControl = (
  site: SiteContent,
  articleList: Article[],
  locale: Locale,
  selectedCategoryDefinition?: CategoryDefinition,
  selectedSubcategoryDefinition?: CategoryDefinition["subcategories"][number]
): string => {
  if (selectedCategoryDefinition) {
    const categoryCount = articleList.filter((article) => article.category === selectedCategoryDefinition.key).length;
    const categoryLabelText = text(selectedCategoryDefinition.label, locale);
    const currentCount = selectedSubcategoryDefinition
      ? articleList.filter((article) => article.category === selectedCategoryDefinition.key && articleHasSubcategory(article, selectedSubcategoryDefinition.key)).length
      : categoryCount;

    return `
          <div class="archive-control" data-archive-control>
            <label>
              <span>${escapeHtml(locale === "ko" ? "세부 분야" : "Subcategory")}</span>
              <select data-navigation-select aria-label="${escapeHtml(locale === "ko" ? `${categoryLabelText} 세부 분야 선택` : `Choose a ${categoryLabelText} subcategory`)}">
                <option value="${archiveHref(locale, selectedCategoryDefinition.key)}"${selectedSubcategoryDefinition ? "" : " selected"}>${escapeHtml(locale === "ko" ? `전체 ${categoryLabelText}` : `All ${categoryLabelText}`)} · ${countText(categoryCount, locale)}</option>
                ${selectedCategoryDefinition.subcategories
                  .map((subcategory) => {
                    const count = articleList.filter((article) => article.category === selectedCategoryDefinition.key && articleHasSubcategory(article, subcategory.key)).length;
                    const isSelected = selectedSubcategoryDefinition?.key === subcategory.key;
                    return `<option value="${archiveHref(locale, selectedCategoryDefinition.key, subcategory.key)}"${isSelected ? " selected" : ""}>${escapeHtml(text(subcategory.label, locale))} · ${countText(count, locale)}</option>`;
                  })
                  .join("")}
              </select>
            </label>
            <span>${escapeHtml(countText(currentCount, locale))}</span>
          </div>`;
  }

  return `
          <div class="archive-control" data-archive-control>
            <label>
              <span>${escapeHtml(locale === "ko" ? "분야" : "Department")}</span>
              <select data-navigation-select aria-label="${escapeHtml(locale === "ko" ? "아카이브 분야 선택" : "Choose an archive department")}">
                <option value="${archiveHref(locale)}" selected>${escapeHtml(ui[locale].fullArchive)} · ${countText(articleList.length, locale)}</option>
                ${site.categories
                  .map((category) => {
                    const count = articleList.filter((article) => article.category === category.key).length;
                    return `<option value="${archiveHref(locale, category.key)}">${escapeHtml(text(category.label, locale))} · ${countText(count, locale)}</option>`;
                  })
                  .join("")}
              </select>
            </label>
            <span>${escapeHtml(countText(articleList.length, locale))}</span>
          </div>`;
};

const renderArchiveBoard = (
  site: SiteContent,
  articleList: Article[],
  locale: Locale,
  includeFilters: boolean,
  selectedCategory?: PrimaryCategory,
  selectedSubcategory?: SubcategoryKey,
  page = 1,
  includePagination = includeFilters
): string => {
  const selectedCategoryDefinition = selectedCategory ? site.categories.find((category) => category.key === selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const visibleArticles = articleList.filter((article) => {
    if (selectedCategoryDefinition && article.category !== selectedCategoryDefinition.key) {
      return false;
    }

    return !selectedSubcategoryDefinition || articleHasSubcategory(article, selectedSubcategoryDefinition.key);
  });
  const totalPages = pageCount(visibleArticles.length);
  const currentPage = normalizedPage(page, visibleArticles.length);
  const pagedArticles = visibleArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filters = includeFilters
    ? selectedCategoryDefinition
      ? ""
      : `<div class="filter-shell" data-filter-shell>
          <div class="filter-row" aria-label="Archive category filter">
            ${site.categories
              .map((category) => {
                const count = articleList.filter((article) => article.category === category.key).length;
                const label = text(category.label, locale);
                return `<a class="filter-button" href="${archiveHref(locale, category.key)}">
                  <span class="filter-label">${escapeHtml(label)}</span>
                  <span class="filter-count">${count}</span>
                </a>`;
              })
              .join("")}
          </div>
        </div>`
    : "";

  return `
${filters ? `${filters}
` : ""}    <div class="archive-board ${visibleArticles.length === 0 ? "is-empty" : ""}" data-archive-board data-reveal>
      <div class="archive-list" data-archive-list>
        ${pagedArticles.length > 0
          ? renderArchiveRows(pagedArticles, site, locale, selectedCategory, selectedSubcategory, (currentPage - 1) * pageSize)
          : `<p class="archive-empty">${escapeHtml(locale === "ko" ? "아직 이 하위 카테고리로 묶인 글이 없습니다. 다른 하위 카테고리를 선택해 주세요." : "No articles are filed under this subcategory yet. Choose another subcategory to continue reading.")}</p>`}
      </div>
    </div>${includePagination ? renderPagination(currentPage, totalPages, (pageNumber) => archivePageHref(locale, pageNumber, selectedCategory, selectedSubcategory), locale) : ""}`;
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

export const renderWritePage = (site: SiteContent, articleList: Article[], locale: Locale, currentPath: string): string => {
  const initialCategory = site.categories[0];
  const initialSubcategory = initialCategory.subcategories[0];
  const currentIssue = latestIssue(site);
  const articleJson = JSON.stringify(articleList).replace(/</g, "\\u003c");
  const issueJson = JSON.stringify(site.issueProjects).replace(/</g, "\\u003c");
  const writeContentVersion = contentVersionHash(`${articleJson}|${issueJson}`);
  const issueField = (label: string, key: string, value: string, multiline = false, rows = multiline ? 3 : 1): string => `            <label>
              <span>${escapeHtml(label)}</span>
              ${multiline
                ? `<textarea data-write-issue-field="${escapeHtml(key)}" rows="${rows}">${escapeHtml(value)}</textarea>`
                : `<input type="text" value="${escapeHtml(value)}" data-write-issue-field="${escapeHtml(key)}" />`}
            </label>`;
  const categoryOptions = site.categories
    .map((category) => `<option value="${category.key}" data-label-ko="${escapeHtml(category.label.ko)}" data-label-en="${escapeHtml(category.label.en)}"${category.key === initialCategory.key ? " selected" : ""}>${escapeHtml(text(category.label, locale))}</option>`)
    .join("");
  const categoryFilters = [
    `<option value="all" selected>${escapeHtml(locale === "ko" ? "전체 기사" : "All Articles")} · ${articleList.length}</option>`,
    ...site.categories.map((category) => {
      const count = articleList.filter((article) => article.category === category.key).length;
      return `<option value="${category.key}">${escapeHtml(text(category.label, locale))} · ${count}</option>`;
    })
  ].join("");
  const subcategoryOptions = site.categories
    .flatMap((category) =>
      category.subcategories.map((subcategory) => {
        const selectedAttribute = category.key === initialCategory.key && subcategory.key === initialSubcategory.key ? " selected" : "";
        return `            <option value="${subcategory.key}" data-category="${category.key}" data-label-ko="${escapeHtml(subcategory.label.ko)}" data-label-en="${escapeHtml(subcategory.label.en)}"${selectedAttribute}>${escapeHtml(text(subcategory.label, locale))}</option>`;
      })
    )
    .join("\n");
  const heroOptions = [
    "image-atelier",
    "image-signal",
    "image-interface",
    "image-thought",
    "image-material",
    "image-system",
    "image-library",
    "image-field"
  ]
    .map((heroClass) => `<option value="${heroClass}"${heroClass === "image-material" ? " selected" : ""}>${heroClass}</option>`)
    .join("");
  const body = `
    <section class="admin-page section-pad" data-write-editor data-write-mode="article" data-write-storage-key="the-thing-admin-articles" data-write-content-version="${writeContentVersion}" data-admin-password="promise">
      <div class="admin-lock" data-admin-lock>
        <form class="admin-lock-card" data-admin-login>
          <p class="kicker">Admin</p>
          <h1>${escapeHtml(locale === "ko" ? "관리자 접근" : "Admin Access")}</h1>
          <p>${escapeHtml(locale === "ko" ? "비밀번호를 입력하면 기사 작성과 편집 화면이 열립니다." : "Enter the password to open the writing and editing desk.")}</p>
          <label>
            <span>Password</span>
            <input type="password" autocomplete="current-password" data-admin-password-input />
          </label>
          <button type="submit">${escapeHtml(locale === "ko" ? "들어가기" : "Enter")}</button>
          <small data-admin-login-error></small>
        </form>
      </div>

      <header class="admin-header">
        <div>
          <p class="kicker">Editorial Admin</p>
          <h1>${escapeHtml(locale === "ko" ? "기사 / 이슈 데스크" : "Article / Issue Desk")}</h1>
        </div>
        <div class="admin-header-copy">
          <p>${escapeHtml(locale === "ko" ? "기존 기사와 이슈를 실제 페이지 폭에 맞춰 편집합니다. Supabase가 연결된 Pages에서는 저장 버튼이 공개 콘텐츠 DB에 저장되고, 로컬 서버 fallback은 src/content/magazine.ts를 직접 수정합니다." : "Edit existing articles and issue pages at live page scale. When Supabase is connected on Pages, Save writes to the published content DB; the local server fallback still writes directly to src/content/magazine.ts.")}</p>
          <div class="admin-mode-tabs" aria-label="${escapeHtml(locale === "ko" ? "편집 종류" : "Editor type")}">
            <button type="button" class="is-active" data-write-mode-button="article" aria-pressed="true">${escapeHtml(locale === "ko" ? "기사" : "Article")}</button>
            <button type="button" data-write-mode-button="issue" aria-pressed="false">${escapeHtml(locale === "ko" ? "이슈" : "Issue")}</button>
          </div>
          <div class="admin-language-tabs" aria-label="${escapeHtml(locale === "ko" ? "입력 언어" : "Writing language")}">
            <button type="button" class="is-active" data-write-locale-button="ko" aria-pressed="true">KR</button>
            <button type="button" data-write-locale-button="en" aria-pressed="false">EN</button>
          </div>
        </div>
      </header>

      <div class="admin-shell">
        <aside class="admin-sidebar article-admin-sidebar" aria-label="Article manager" data-write-article-panel>
          <div class="admin-sidebar-head">
            <span>${escapeHtml(locale === "ko" ? "기사 목록" : "Articles")}</span>
            <strong data-admin-count>${articleList.length}</strong>
          </div>
          <label class="admin-select-control" data-admin-filters>
            <span>${escapeHtml(locale === "ko" ? "분야 필터" : "Category Filter")}</span>
            <select data-admin-filter-select>${categoryFilters}</select>
          </label>
          <label class="admin-search-control">
            <span>${escapeHtml(locale === "ko" ? "기사 검색" : "Search Articles")}</span>
            <input type="search" placeholder="${escapeHtml(locale === "ko" ? "제목, slug, 분야" : "Title, slug, category")}" autocomplete="off" data-admin-search-input />
          </label>
          <div class="admin-list" data-admin-list></div>
          <div class="admin-sidebar-actions">
            <button type="button" class="is-primary" data-admin-new>${escapeHtml(locale === "ko" ? "새 기사" : "New Article")}</button>
            <button type="button" data-admin-move-up aria-label="${escapeHtml(locale === "ko" ? "위로 이동" : "Move up")}">↑</button>
            <button type="button" data-admin-move-down aria-label="${escapeHtml(locale === "ko" ? "아래로 이동" : "Move down")}">↓</button>
            <button type="button" data-admin-delete>${escapeHtml(locale === "ko" ? "삭제" : "Delete")}</button>
          </div>
          <div class="admin-sidebar-actions is-export">
            <button type="button" class="is-primary" data-admin-save-file>${escapeHtml(locale === "ko" ? "저장" : "Save")}</button>
            <button type="button" data-admin-copy-all>${escapeHtml(locale === "ko" ? "복사" : "Copy")}</button>
            <button type="button" data-admin-download-all>${escapeHtml(locale === "ko" ? "다운로드" : "Download")}</button>
          </div>
        </aside>

        <section class="admin-editor article-admin-editor" aria-label="Article editor" data-write-article-panel>
          <div class="admin-editor-bar">
            <div>
              <span>${escapeHtml(locale === "ko" ? "편집 중" : "Editing")}</span>
              <strong data-admin-current-title></strong>
            </div>
            <p data-write-status>${escapeHtml(locale === "ko" ? "브라우저에 자동 저장됩니다." : "Autosaves in this browser.")}</p>
          </div>

          <div class="writer-toolbar" aria-label="${escapeHtml(locale === "ko" ? "글 설정" : "Writing settings")}">
            <label>
              <span>Slug</span>
              <input type="text" value="new-article" data-write-meta="slug" />
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "날짜" : "Date")}</span>
              <input type="date" value="${new Date().toISOString().slice(0, 10)}" data-write-meta="date" />
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "카테고리" : "Category")}</span>
              <select data-write-meta="category">${categoryOptions}</select>
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "세부 카테고리" : "Subcategory")}</span>
              <select data-write-meta="subcategory">
${subcategoryOptions}
              </select>
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "비주얼" : "Visual")}</span>
              <select data-write-meta="heroClass">${heroOptions}</select>
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "이미지 모드" : "Image Mode")}</span>
              <select data-write-meta="imageMode">
                <option value="visual">${escapeHtml(locale === "ko" ? "자동 비주얼" : "Generated Visual")}</option>
                <option value="custom">${escapeHtml(locale === "ko" ? "이미지 URL" : "Image URL")}</option>
                <option value="none">${escapeHtml(locale === "ko" ? "이미지 없음" : "No Image")}</option>
              </select>
            </label>
            <label class="writer-image-url-field">
              <span>${escapeHtml(locale === "ko" ? "이미지 URL" : "Image URL")}</span>
              <input type="url" placeholder="https://..." data-write-meta="heroImage" />
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "Rail" : "Rail")}</span>
              <select data-write-meta="railMode">
                <option value="default">${escapeHtml(locale === "ko" ? "기본" : "Default")}</option>
                <option value="image">${escapeHtml(locale === "ko" ? "이미지만" : "Image Only")}</option>
                <option value="text">${escapeHtml(locale === "ko" ? "텍스트만" : "Text Only")}</option>
              </select>
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "읽기 시간" : "Read Time")}</span>
              <input type="text" value="6분 읽기" data-write-meta="readTime" />
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "장소" : "Location")}</span>
              <input type="text" value="서울" data-write-meta="location" />
            </label>
            <label>
              <span>${escapeHtml(locale === "ko" ? "태그" : "Tags")}</span>
              <input type="text" value="제품, 비례, 그림자" data-write-meta="tags" />
            </label>
            <div class="writer-actions">
              <button type="button" data-write-copy>${escapeHtml(locale === "ko" ? "현재 기사 복사" : "Copy Article")}</button>
              <button type="button" data-write-download>${escapeHtml(locale === "ko" ? "현재 파일 내려받기" : "Download Article")}</button>
              <button type="button" data-write-reset>${escapeHtml(locale === "ko" ? "로컬 변경 초기화" : "Reset Local Edits")}</button>
            </div>
          </div>
          <p class="writer-shortcuts">${escapeHtml(locale === "ko" ? "Enter 새 문단 · 문단/인용문/갤러리는 선택한 위치 뒤에 삽입 · /quote 인용문 · /image 본문 갤러리 · ⌘/Ctrl+S 파일 저장" : "Enter new paragraph · Paragraph/quote/gallery insert after the selected block · /quote pull quote · /image body gallery · Cmd/Ctrl+S saves the file")}</p>

          <article class="article-detail writer-article">
            <header class="article-hero-grid">
              <div class="article-title-block">
                <p class="kicker" data-write-kicker>${escapeHtml(`${text(initialCategory.label, locale)} / ${text(initialSubcategory.label, locale)}`)}</p>
                <h1 contenteditable="true" spellcheck="true" data-write-text="title">${escapeHtml(locale === "ko" ? "실루엣의 무게" : "The Weight of a Silhouette")}</h1>
                <p contenteditable="true" spellcheck="true" data-write-text="deck">${escapeHtml(locale === "ko" ? "의자의 비례는 가까이서보다 한 발 물러섰을 때 더 분명해진다. 이 글은 형태가 공간 안에서 무게를 얻는 순간을 따라간다." : "A chair's proportion becomes clearer from one step away than up close. This draft follows the moment form gains weight inside a room.")}</p>
              </div>
              <div class="article-meta-card" aria-label="${escapeHtml(locale === "ko" ? "기사 정보" : "Article details")}">
                <span><small>${escapeHtml(locale === "ko" ? "발행" : "Published")}</small><strong data-write-preview="date"></strong></span>
                <span><small>${escapeHtml(locale === "ko" ? "장소" : "Location")}</small><strong data-write-preview="location"></strong></span>
                <span><small>${escapeHtml(locale === "ko" ? "읽기" : "Reading")}</small><strong data-write-preview="readTime"></strong></span>
                <span><small>${escapeHtml(locale === "ko" ? "태그" : "Tags")}</small><strong data-write-preview="tags"></strong></span>
              </div>
            </header>

            <div class="article-visual" data-write-hero-shell>
              <span class="image-block image-material" data-write-hero-preview></span>
              <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" data-write-hero-image-file hidden />
            </div>

            <div class="article-body-grid writer-body-grid">
              <div class="article-body" data-write-body>
                <blockquote contenteditable="true" spellcheck="true" data-write-text="quote">좋은 제품 디자인은 사용자의 몸을 생각하지만, 동시에 공간 안에서 어떤 그림자를 남길지도 생각한다.</blockquote>
                <section class="article-section writer-section" data-write-section>
                  <aside class="writer-section-rail-card" data-write-section-rail-card>
                    <span class="article-rail-no" data-write-section-rail-no>01</span>
                    <button type="button" class="writer-section-rail-image" data-write-section-rail-image-button aria-label="${escapeHtml(locale === "ko" ? "섹션 레일 이미지 수정" : "Edit section rail image")}">
                      <span class="image-block image-material" data-write-section-rail-preview></span>
                      <span>${escapeHtml(locale === "ko" ? "이미지 클릭" : "Click image")}</span>
                    </button>
                    <strong contenteditable="true" spellcheck="true" data-write-section-rail-title>좌측 레일 제목</strong>
                    <p contenteditable="true" spellcheck="true" data-write-section-rail-text>좌측 레일 설명을 이곳에서 직접 수정합니다.</p>
                    <div class="writer-section-rail-settings" contenteditable="false">
                      <label>
                        <span>${escapeHtml(locale === "ko" ? "자동 비주얼" : "Generated Visual")}</span>
                        <select data-write-section-rail-class>${heroOptions}</select>
                      </label>
                      <input type="url" value="" data-write-section-rail-image hidden />
                      <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" data-write-section-rail-image-file hidden />
                      <input type="hidden" value="false" data-write-section-rail-hidden />
                      <button type="button" data-write-section-rail-use-visual>${escapeHtml(locale === "ko" ? "자동 비주얼" : "Use Visual")}</button>
                      <button type="button" data-write-section-rail-hide>${escapeHtml(locale === "ko" ? "이미지 숨김" : "Hide Image")}</button>
                    </div>
                  </aside>
                  <h2 contenteditable="true" spellcheck="true" data-write-section-heading>실루엣의 무게</h2>
                  <figure class="writer-section-media is-section-image-disabled" data-write-section-media contenteditable="false">
                    <button type="button" class="writer-section-media-button" data-write-section-image-button aria-label="${escapeHtml(locale === "ko" ? "본문 이미지 수정" : "Edit inline image")}">
                      <span class="image-block image-material" data-write-section-image-preview></span>
                      <span data-write-section-image-label>${escapeHtml(locale === "ko" ? "본문 이미지 추가" : "Add Inline Image")}</span>
                    </button>
                    <figcaption contenteditable="true" spellcheck="true" data-write-section-image-caption>${escapeHtml(locale === "ko" ? "이미지 설명" : "Image caption")}</figcaption>
                    <div class="writer-section-media-tools" contenteditable="false">
                      <label>
                        <span>${escapeHtml(locale === "ko" ? "이미지 비주얼" : "Image Visual")}</span>
                        <select data-write-section-image-class>${heroOptions}</select>
                      </label>
                      <input type="url" value="" data-write-section-image hidden />
                      <input type="hidden" value="false" data-write-section-image-enabled />
                      <input type="file" accept="image/gif,image/jpeg,image/png,image/webp" data-write-section-image-file hidden />
                      <button type="button" data-write-section-image-url>${escapeHtml(locale === "ko" ? "URL" : "URL")}</button>
                      <button type="button" data-write-section-image-file-button>${escapeHtml(locale === "ko" ? "파일" : "File")}</button>
                      <button type="button" data-write-section-image-use-visual>${escapeHtml(locale === "ko" ? "자동 이미지" : "Use Visual")}</button>
                      <button type="button" data-write-section-image-hide>${escapeHtml(locale === "ko" ? "이미지 끄기" : "Remove Image")}</button>
                    </div>
                  </figure>
                  <p contenteditable="true" spellcheck="true" data-write-paragraph>의자의 비례는 가까이서보다 한 발 물러섰을 때 더 분명해진다. 등받이의 높이, 좌판의 깊이, 다리 사이의 간격이 하나의 실루엣으로 묶이기 때문이다.</p>
                  <p contenteditable="true" spellcheck="true" data-write-paragraph>잘 만든 의자는 장식을 앞세우지 않는다. 대신 방 안에서 어느 정도의 존재감을 가져야 하는지 정확히 알고 있는 물건처럼 보인다.</p>
                </section>
              </div>
            </div>
          </article>

          <details class="writer-output">
            <summary>${escapeHtml(locale === "ko" ? "생성된 코드 보기" : "View Generated Code")}</summary>
            <textarea readonly data-write-output aria-label="Generated Article code"></textarea>
          </details>
        </section>

        <aside class="admin-sidebar issue-admin-sidebar" aria-label="${escapeHtml(locale === "ko" ? "이슈 관리" : "Issue manager")}" data-write-issue-panel>
          <div class="admin-sidebar-head">
            <span>${escapeHtml(locale === "ko" ? "이슈 목록" : "Issues")}</span>
            <strong data-write-issue-count>${site.issueProjects.length}</strong>
          </div>
          <label class="issue-admin-picker">
            <span>${escapeHtml(locale === "ko" ? "이슈 선택" : "Select Issue")}</span>
            <select data-write-issue-list></select>
          </label>
          <div class="issue-sidebar-summary">
            <p class="kicker">Selected Issue</p>
            <strong data-write-issue-summary-title>${escapeHtml(text(currentIssue.title, locale))}</strong>
            <p data-write-issue-summary-subtitle>${escapeHtml(text(currentIssue.subtitle, locale))}</p>
            <small data-write-issue-summary-meta>${escapeHtml(locale === "ko" ? "장면" : "Scenes")} ${currentIssue.features.length} / ${escapeHtml(locale === "ko" ? "크레딧" : "Credits")} ${currentIssue.credits.length}</small>
          </div>
          <div class="admin-sidebar-actions issue-order-actions">
            <button type="button" class="is-primary" data-write-issue-new>${escapeHtml(locale === "ko" ? "새 이슈" : "New Issue")}</button>
            <button type="button" data-write-issue-duplicate>${escapeHtml(locale === "ko" ? "복제" : "Duplicate")}</button>
            <button type="button" data-write-issue-move-up aria-label="${escapeHtml(locale === "ko" ? "위로 이동" : "Move up")}">↑</button>
            <button type="button" data-write-issue-move-down aria-label="${escapeHtml(locale === "ko" ? "아래로 이동" : "Move down")}">↓</button>
            <button type="button" data-write-issue-delete>${escapeHtml(locale === "ko" ? "삭제" : "Delete")}</button>
          </div>
          <div class="admin-sidebar-actions is-export">
            <button type="button" class="is-primary" data-write-issue-save>${escapeHtml(locale === "ko" ? "저장" : "Save")}</button>
            <button type="button" data-write-issue-copy>${escapeHtml(locale === "ko" ? "복사" : "Copy")}</button>
            <button type="button" data-write-issue-download>${escapeHtml(locale === "ko" ? "다운로드" : "Download")}</button>
            <button type="button" data-write-issue-reset>${escapeHtml(locale === "ko" ? "초기화" : "Reset")}</button>
          </div>
          <p class="issue-sidebar-note">${escapeHtml(locale === "ko" ? "목록의 첫 번째 이슈가 공개 페이지와 상단 메뉴의 최신호가 됩니다. Supabase 연결 시 저장 버튼은 published snapshot을 갱신합니다." : "The first issue in this list becomes the public latest issue and top-menu issue. With Supabase connected, Save updates the published snapshot.")}</p>
        </aside>

        <section class="admin-editor issue-admin-editor" aria-label="${escapeHtml(locale === "ko" ? "이슈 편집" : "Issue editor")}" data-write-issue-panel data-write-issue-editor>
        <div class="admin-editor-bar">
          <div>
            <span>${escapeHtml(locale === "ko" ? "이슈 편집" : "Issue Editing")}</span>
            <strong data-write-issue-title>${escapeHtml(`${currentIssue.number} · ${text(currentIssue.title, locale)}`)}</strong>
          </div>
          <p data-write-issue-status>${escapeHtml(locale === "ko" ? "이슈도 브라우저에 자동 저장됩니다." : "Issue edits also autosave in this browser.")}</p>
        </div>

        <div class="issue-admin-grid issue-admin-language-grid issue-admin-single-language-grid">
          <div class="issue-admin-common">
${issueField(locale === "ko" ? "번호" : "Number", "number", currentIssue.number)}
          </div>
          <section class="issue-language-panel issue-single-language-panel" aria-label="${escapeHtml(locale === "ko" ? "현재 언어 이슈 정보" : "Current language issue fields")}">
            <header>
              <span data-write-active-locale>KR</span>
              <strong data-write-active-language>${escapeHtml(locale === "ko" ? "한국어" : "Korean")}</strong>
            </header>
${issueField(locale === "ko" ? "제목" : "Title", "title", text(currentIssue.title, locale))}
${issueField(locale === "ko" ? "부제" : "Subtitle", "subtitle", text(currentIssue.subtitle, locale), true, 2)}
${issueField(locale === "ko" ? "덱" : "Deck", "deck", text(currentIssue.deck, locale), true, 4)}
            <div class="issue-field-row">
${issueField(locale === "ko" ? "발행" : "Date", "date", text(currentIssue.date, locale))}
${issueField(locale === "ko" ? "형식" : "Format", "format", text(currentIssue.format, locale))}
${issueField(locale === "ko" ? "상태" : "Access", "availability", text(currentIssue.availability, locale))}
            </div>
${issueField(locale === "ko" ? "커버 크레딧" : "Cover Credit", "coverCredit", text(currentIssue.coverCredit, locale), true, 2)}
${issueField(locale === "ko" ? "에디터 노트" : "Editor Note", "editorNote", text(currentIssue.editorNote, locale), true, 4)}
          </section>
        </div>

        <div class="issue-admin-section-head">
          <div>
            <p class="kicker">Issue Scenes</p>
            <h2>${escapeHtml(locale === "ko" ? "이슈 장면" : "Issue Scenes")}</h2>
            <small>${escapeHtml(locale === "ko" ? "각 장면 안에서 바로 아래 장면을 추가하거나 삭제합니다." : "Add the next scene or delete inside each scene card.")}</small>
          </div>
        </div>
        <div class="issue-feature-editor-list" data-write-issue-features></div>

        <div class="issue-admin-section-head">
          <div>
            <p class="kicker">Credits</p>
            <h2>${escapeHtml(locale === "ko" ? "이슈 크레딧" : "Issue Credits")}</h2>
            <small>${escapeHtml(locale === "ko" ? "크레딧 카드 안에서 바로 다음 항목을 추가하거나 삭제합니다." : "Add the next credit or delete inside each credit row.")}</small>
          </div>
        </div>
        <div class="issue-credit-editor-list" data-write-issue-credits></div>

        <details class="writer-output">
          <summary>${escapeHtml(locale === "ko" ? "생성된 이슈 코드 보기" : "View Generated Issue Code")}</summary>
          <textarea readonly data-write-issue-output aria-label="Generated Issue code"></textarea>
        </details>
        </section>
      </div>

      <script type="application/json" data-write-articles>${articleJson}</script>
      <script type="application/json" data-write-issue>${issueJson}</script>
    </section>`;

  return renderLayout({ title: `Write | ${text(site.title, locale)}`, description: text(site.description, locale), body, locale, currentPath, site });
};

export const renderHomePage = (site: SiteContent, articleList: Article[], locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const currentIssue = latestIssue(site);
  const issueFeatures = currentIssue.features;
  const selectedArticles = articleList.slice(0, 5);
  const leadArticle = selectedArticles[0];
  const secondaryArticles = selectedArticles.slice(1, 5);
  const homeIndexRows = issueFeatures
    .map((feature, index) => {
      return `              <a class="home-index-row" href="${issueHref(currentIssue, locale)}#issue-${escapeHtml(feature.slug)}" data-scroll-motion>
                <span class="home-index-order">${String(index + 1).padStart(2, "0")}</span>
                <span class="home-index-copy">
                  <strong>${escapeHtml(text(feature.title, locale))}</strong>
                  <span class="home-index-meta">${escapeHtml(text(feature.role, locale))}</span>
                  <em>${escapeHtml(text(feature.intro, locale))}</em>
                </span>
              </a>`;
    })
    .join("\n");
  const homeRecentLead = leadArticle
    ? `          <a class="home-recent-lead" href="${articleHref(leadArticle, locale)}" data-reveal data-action-card>
            <span class="home-recent-visual" aria-hidden="true">
              ${renderImageBlock(leadArticle.heroClass, leadArticle.heroImage)}
            </span>
            <span class="home-recent-copy">
              <small>${escapeHtml(categoryLabel(site.categories, leadArticle.category, locale))} / ${escapeHtml(formatDate(leadArticle.date, locale))}</small>
              <strong>${escapeHtml(text(leadArticle.title, locale))}</strong>
              <em>${escapeHtml(text(leadArticle.excerpt, locale))}</em>
            </span>
          </a>`
    : "";
  const storyRows = secondaryArticles
    .map((article, index) => [
      `              <a class="home-story-line" href="${articleHref(article, locale)}" data-reveal data-action-card>`,
      `                <span>${String(index + 2).padStart(2, "0")}</span>`,
      `                <strong>${escapeHtml(text(article.title, locale))}</strong>`,
      `                <small>${escapeHtml(categoryLabel(site.categories, article.category, locale))} / ${escapeHtml(formatDate(article.date, locale))}</small>`,
      `                <em>${escapeHtml(text(article.excerpt, locale))}</em>`,
      "              </a>"
    ].filter(Boolean).join("\n"))
    .join("\n");
  const body = `
    <section class="cover section-pad" aria-labelledby="hero-title" data-scroll-section>
      <div class="cover-grid home-cover-grid">
        <div class="cover-copy" data-reveal>
          <div class="cover-edition" aria-label="Publication context">
            <span>${escapeHtml(`${currentIssue.number} · ${text(currentIssue.date, locale)}`)}</span>
          </div>
          <p class="kicker">Current Issue</p>
          <h1 id="hero-title">${escapeHtml(text(currentIssue.title, locale))}</h1>
          <p class="cover-deck">${escapeHtml(text(currentIssue.deck, locale))}</p>
          <a class="home-issue-link" href="${issueHref(currentIssue, locale)}">
            <span>${escapeHtml(locale === "ko" ? "최신 이슈 읽기" : "Read Latest Issue")}</span>
            <small>${escapeHtml(currentIssue.number)}</small>
          </a>
        </div>

        <section class="home-issue-index" aria-labelledby="home-issue-index-title" data-reveal data-scroll-motion>
          <header class="home-index-headline">
            <p class="kicker" id="home-issue-index-title">Issue Index</p>
          </header>
          <div class="home-index-list" aria-label="${escapeHtml(locale === "ko" ? "이슈 읽기 순서" : "Issue reading order")}">
${homeIndexRows}
          </div>
        </section>
      </div>
    </section>

    <section class="story-river home-stories section-pad" id="features" aria-labelledby="features-title" data-scroll-section>
      <div class="section-head" data-reveal>
        <p class="kicker">${escapeHtml(labels.selectedStories)}</p>
        <h2 id="features-title">${locale === "ko" ? "최근 글" : "Recent Stories"}</h2>
      </div>

      <div class="home-recent-spread">
${homeRecentLead}
        <div class="home-story-index-list">
${storyRows}
          <a class="home-story-more" href="${archiveHref(locale)}" data-reveal>
            <span>${escapeHtml(locale === "ko" ? "전체 보기" : "View all")}</span>
            <strong>${escapeHtml(labels.fullArchive)}</strong>
          </a>
        </div>
      </div>
    </section>

    <section class="home-habitus section-pad" id="notes" aria-labelledby="notes-title" data-scroll-section>
      <div class="habitus-copy" data-reveal>
        <h2 id="notes-title">${locale === "ko" ? "Habitus, 취향에 관하여." : "Habitus, on taste."}</h2>
        <p>${escapeHtml(locale === "ko" ? "취향은 결과가 아니라 거르는 방식입니다. 경험과 반복이 만든 기준을 알면 무엇을 고를지보다 왜 고르는지가 먼저 보입니다." : "Taste is not the result but the way things are filtered. When the criteria shaped by experience and repetition are visible, the reason behind a choice becomes clearer.")}</p>
      </div>

      <div class="habitus-board" data-reveal>
        <svg class="habitus-system" viewBox="0 0 960 430" role="img" aria-label="${escapeHtml(locale === "ko" ? "경험과 반복의 교집합에서 습관이 생기고 선택으로 이어지는 아비투스 도식" : "A habitus diagram where the overlap of experience and repetition forms habit and leads to choice")}">
          <defs>
            <clipPath id="habitus-venn-overlap">
              <circle cx="430" cy="150" r="126" />
            </clipPath>
          </defs>
          <g class="habitus-venn-flow">
            <circle class="habitus-venn-circle is-experience" cx="430" cy="150" r="126" />
            <circle class="habitus-venn-circle is-repeat" cx="530" cy="150" r="126" />
            <circle class="habitus-venn-lens" cx="530" cy="150" r="126" clip-path="url(#habitus-venn-overlap)" />
            <circle class="habitus-venn-ring is-experience" cx="430" cy="150" r="126" />
            <circle class="habitus-venn-ring is-repeat" cx="530" cy="150" r="126" />
            <path class="habitus-choice-arrow" d="M480 292 V338" />
            <path class="habitus-choice-head" d="M470 327 L480 339 L490 327" />
            <g class="habitus-strand-labels">
              <text x="${locale === "ko" ? 362 : 356}" y="150" class="is-experience-label">${escapeHtml(locale === "ko" ? "경험" : "experience")}</text>
              <text x="${locale === "ko" ? 598 : 604}" y="150" class="is-repeat-label">${escapeHtml(locale === "ko" ? "반복" : "repetition")}</text>
              <text x="480" y="150" class="is-habit">${escapeHtml(locale === "ko" ? "습관" : "habit")}</text>
              <text x="480" y="376" class="is-choice">${escapeHtml(locale === "ko" ? "선택" : "choice")}</text>
              <text x="480" y="410" class="habitus-choice-copy">${escapeHtml(locale === "ko" ? "좋은 취향은 좋은 선택으로 이어집니다." : "Good taste leads to better choices.")}</text>
            </g>
          </g>
        </svg>
      </div>
    </section>

    `;

  return renderLayout({ title: text(site.title, locale), description: text(site.description, locale), body, locale, currentPath, site });
};

export const renderAboutPage = (site: SiteContent, locale: Locale, currentPath: string): string => {
  const labels = ui[locale];
  const latest = latestIssue(site);
  const body = `
    <section class="about-page section-pad" aria-labelledby="about-page-title">
      <header class="about-page-hero" data-reveal>
        <p class="kicker">About ${escapeHtml(text(site.title, locale))}</p>
        <h1 id="about-page-title">${escapeHtml(locale === "ko" ? "취향은 선택이 아니라 몸에 밴 질서입니다." : "Taste is not only choice. It is an embodied order.")}</h1>
        <p>${escapeHtml(locale === "ko" ? "아비투스는 예술, 테크, 디자인, 뷰티, 철학을 통해 취향이 만들어지는 조건을 읽는 디지털 매거진입니다. 빠른 추천보다 오래 남는 감각의 출처, 좋아한다는 말 뒤의 사회적 배치, 반복되는 선택의 문장을 먼저 봅니다." : "Habitus is a digital magazine that reads the conditions that form taste through art, technology, design, beauty, and philosophy. It looks past quick recommendations toward the origins of lasting sense, the social arrangements behind liking, and the language of repeated choices.")}</p>
      </header>

      <div class="about-page-grid">
        <article data-reveal>
          <span>01</span>
          <h2>${escapeHtml(locale === "ko" ? "이슈는 취향의 장면입니다" : "Issues Are Scenes of Taste")}</h2>
          <p>${escapeHtml(locale === "ko" ? `최신호는 ${latest.number} · ${text(latest.title, locale)}입니다. 각 호는 분야 묶음이 아니라 취향을 만드는 하나의 조건을 따라가는 발행본입니다.` : `The latest edition is ${latest.number} · ${text(latest.title, locale)}. Each issue follows one condition that forms taste instead of simply grouping categories.`)}</p>
        </article>
        <article data-reveal>
          <span>02</span>
          <h2>${escapeHtml(locale === "ko" ? "목록은 구별의 방식입니다" : "Lists Are Ways of Distinction")}</h2>
          <p>${escapeHtml(locale === "ko" ? "날짜, 제목, 여백, 반복되는 선은 무엇을 가까이 두고 무엇을 멀리 둘지 정합니다. 아카이브는 취향의 질서를 드러내는 편집면입니다." : "Dates, titles, space, and repeated rules decide what stays close and what moves away. The archive is an edited surface where the order of taste appears.")}</p>
        </article>
        <article data-reveal>
          <span>03</span>
          <h2>${escapeHtml(locale === "ko" ? "움직임은 의미를 가져야 합니다" : "Motion Must Carry Meaning")}</h2>
          <p>${escapeHtml(locale === "ko" ? "기하학과 움직임은 장식이 아니라 감각이 조립되는 과정을 보여줄 때 사용합니다. 화면은 과시보다 정확한 간격으로 오래 남아야 합니다." : "Geometry and motion are used when they show how sense is assembled, not as decoration. A screen should last through precise intervals rather than performance.")}</p>
        </article>
      </div>
    </section>`;

  return renderLayout({ title: `${labels.about} | ${text(site.title, locale)}`, description: labels.aboutBody, body, locale, currentPath, site });
};

const renderIssueCollectionItems = (issues: IssueProject[], locale: Locale, offset = 0, selectedIssue?: IssueProject): string => issues
  .map((issue, index) => {
    const absoluteIndex = offset + index;
    const isCurrent = selectedIssue ? issueSlug(issue) === issueSlug(selectedIssue) : false;
    const scenes = issue.features.slice(0, 3)
      .map((feature, featureIndex) => `          <span>
            <small>${String(featureIndex + 1).padStart(2, "0")} / ${escapeHtml(text(feature.role, locale))}</small>
            <strong>${escapeHtml(text(feature.title, locale))}</strong>
          </span>`)
      .join("\n");

    return `        <a class="issue-collection-item ${absoluteIndex === 0 ? "is-latest" : ""} ${isCurrent ? "is-current" : ""}" href="${issueHref(issue, locale)}"${isCurrent ? " aria-current=\"page\"" : ""} data-reveal data-action-card>
          <div class="issue-collection-cover" aria-label="${escapeHtml(locale === "ko" ? "이슈 커버" : "Issue cover")}">
${renderIssuePrototype(issue, locale, "collection")}
          </div>
          <div class="issue-collection-copy">
            <p class="kicker">${escapeHtml(absoluteIndex === 0 ? (locale === "ko" ? "최신호" : "Latest issue") : (locale === "ko" ? "지난호" : "Past issue"))} / ${escapeHtml(text(issue.date, locale))}</p>
            <div class="issue-collection-title">
              <span>${escapeHtml(issue.number)}</span>
              <h2>${escapeHtml(text(issue.title, locale))}</h2>
            </div>
            <p>${escapeHtml(text(issue.deck, locale))}</p>
            <div class="issue-collection-meta">
              <span>${escapeHtml(text(issue.format, locale))}</span>
              <span>${escapeHtml(text(issue.availability, locale))}</span>
              <span>${issue.features.length} ${escapeHtml(locale === "ko" ? "장면" : "scenes")}</span>
            </div>
          </div>
          <div class="issue-collection-scenes" aria-label="${escapeHtml(locale === "ko" ? "이슈 장면 요약" : "Issue scene summary")}">
${scenes}
          </div>
        </a>`;
  })
  .join("\n");

export const renderIssueCollectionPage = (site: SiteContent, locale: Locale, currentPath: string, page = 1): string => {
  const latest = latestIssue(site);
  const totalPages = pageCount(site.issueProjects.length);
  const currentPage = normalizedPage(page, site.issueProjects.length);
  const issues = site.issueProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const body = `
    <section class="issue-index-page section-pad" aria-labelledby="issue-index-title">
      <header class="issue-index-hero" data-reveal>
        <p class="kicker">Issues</p>
        <h1 id="issue-index-title">Issue Index</h1>
        <p>${escapeHtml(locale === "ko" ? "발행된 이슈를 모았습니다. 최신호와 지난호를 한곳에서 봅니다." : "Latest and past issues in one place.")}</p>
        <a class="issue-index-latest" href="${issueHref(latest, locale)}">${escapeHtml(locale === "ko" ? "최신호 열기" : "Open latest issue")}</a>
      </header>

      <div class="issue-collection-list" aria-label="${escapeHtml(locale === "ko" ? "전체 이슈" : "All issues")}">
${renderIssueCollectionItems(issues, locale, (currentPage - 1) * pageSize)}
      </div>${renderPagination(currentPage, totalPages, (pageNumber) => issueIndexHref(locale, pageNumber), locale)}
    </section>`;

  return renderLayout({
    title: `Issue Index | ${text(site.title, locale)}`,
    description: locale === "ko" ? "아비투스의 모든 이슈를 모아둔 발행 인덱스입니다." : "An index of every edition published by Habitus.",
    body,
    locale,
    currentPath,
    site
  });
};

export const renderIssuePage = (site: SiteContent, _articleList: Article[], locale: Locale, currentPath: string, selectedIssue?: IssueProject): string => {
  const issue = selectedIssue ?? latestIssue(site);
  const issueIndex = site.issueProjects.findIndex((item) => issueSlug(item) === issueSlug(issue));
  const issueIsLatest = issueIndex <= 0;
  const issueRows = issue.features
    .map((feature, index) => `        <a class="issue-toc-row issue-feature-row" href="#issue-${escapeHtml(feature.slug)}" data-reveal>
          <span class="issue-toc-no">${String(index + 1).padStart(2, "0")}</span>
          <span class="issue-toc-meta">${escapeHtml(text(feature.role, locale))}</span>
          <strong>${escapeHtml(text(feature.title, locale))}</strong>
          <em>${escapeHtml(text(feature.excerpt, locale))}</em>
        </a>`)
    .join("\n");
  const issueChapters = issue.features
    .map((feature, index) => {
      const cycleAttributes = feature.heroImage ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${escapeHtml(locale === "ko" ? "이슈 장면 비주얼 바꾸기" : "Cycle issue scene visual")}"`;

      return `        <section class="issue-chapter" id="issue-${escapeHtml(feature.slug)}" aria-labelledby="issue-chapter-${escapeHtml(feature.slug)}" data-reveal>
          <div class="issue-chapter-media">
            ${renderImageBlock(feature.heroClass, feature.heroImage, cycleAttributes)}
            <p>${escapeHtml(text(feature.credit, locale))} / ${escapeHtml(text(feature.location, locale))}</p>
          </div>
          <div class="issue-chapter-copy">
            <p class="kicker">${escapeHtml(`${String(index + 1).padStart(2, "0")} / ${text(feature.role, locale)}`)}</p>
            <h2 id="issue-chapter-${escapeHtml(feature.slug)}">${escapeHtml(text(feature.title, locale))}</h2>
            <p class="issue-chapter-intro">${escapeHtml(text(feature.intro, locale))}</p>
            ${feature.body[locale].map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n            ")}
          </div>
        </section>`;
    })
    .join("\n");
  const credits = issue.credits
    .map((credit) => `        <span>
          <small>${escapeHtml(text(credit.label, locale))}</small>
          <strong>${escapeHtml(text(credit.value, locale))}</strong>
        </span>`)
    .join("\n");
  const body = `
    <section class="issue-page issue-project-page section-pad" aria-labelledby="issue-page-title">
      <header class="issue-project-hero" data-reveal>
        <div class="issue-project-title">
          <p class="kicker">${escapeHtml(issueIsLatest ? "Latest Magazine Issue" : "Magazine Issue")}</p>
          <span class="issue-project-no">${escapeHtml(issue.number)}</span>
          <h1 id="issue-page-title">${escapeHtml(text(issue.title, locale))}</h1>
          <p>${escapeHtml(text(issue.subtitle, locale))}</p>
        </div>

        <aside class="issue-cover-card" aria-label="${escapeHtml(locale === "ko" ? "이슈 커버" : "Issue cover")}">
${renderIssuePrototype(issue, locale, "detail")}
        </aside>
      </header>

      <div class="issue-project-ledger" data-reveal>
        <span><small>${escapeHtml(locale === "ko" ? "발행" : "Published")}</small><strong>${escapeHtml(text(issue.date, locale))}</strong></span>
        <span><small>${escapeHtml(locale === "ko" ? "형식" : "Format")}</small><strong>${escapeHtml(text(issue.format, locale))}</strong></span>
        <span><small>${escapeHtml(locale === "ko" ? "상태" : "Access")}</small><strong>${escapeHtml(text(issue.availability, locale))}</strong></span>
      </div>

      <section class="issue-editorial-note" aria-label="${escapeHtml(locale === "ko" ? "편집 노트" : "Editor's note")}" data-reveal>
        <div>
          <p class="kicker">Editor's Note</p>
          <h2>${escapeHtml(locale === "ko" ? "이 호를 여는 편집 노트" : "The editor's note for this edition")}</h2>
        </div>
        <div class="issue-editorial-copy">
          <p>${escapeHtml(text(issue.deck, locale))}</p>
          <p>${escapeHtml(text(issue.editorNote, locale))}</p>
        </div>
      </section>

      <section class="issue-contents" aria-labelledby="issue-contents-title">
        <div class="issue-section-heading" data-reveal>
          <p class="kicker">Contents</p>
          <h2 id="issue-contents-title">${escapeHtml(locale === "ko" ? "이 호의 장면" : "Scenes in this issue")}</h2>
        </div>
        <div class="issue-toc" aria-label="${escapeHtml(locale === "ko" ? "이슈 목차" : "Issue table of contents")}">
${issueRows}
        </div>
      </section>

      <div class="issue-chapters" aria-label="${escapeHtml(locale === "ko" ? "이슈 소개" : "Issue introductions")}">
${issueChapters}
      </div>

      <div class="issue-credit-grid" aria-label="${escapeHtml(locale === "ko" ? "이슈 크레딧" : "Issue credits")}" data-reveal>
${credits}
      </div>

      <nav class="issue-project-actions" aria-label="${escapeHtml(locale === "ko" ? "이슈 탐색" : "Issue navigation")}" data-reveal>
        <a href="${withLocale("/issues", locale)}">Issue Index</a>
      </nav>
    </section>`;

  return renderLayout({ title: `${issue.number} · ${text(issue.title, locale)} | ${text(site.title, locale)}`, description: text(issue.deck, locale), body, locale, currentPath, site });
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
  const firstSection = article.sections[0];
  const railVisuals = article.sections.map((section, index) => section.railClass ?? article.railClass ?? relatedArticles[index]?.heroClass ?? article.heroClass);
  const railImageHidden = article.sections.map((section) => Boolean(section.hideRailImage || article.hideRailImage));
  const railImages = article.sections.map((section, index) => {
    if (railImageHidden[index]) {
      return "";
    }

    if (section.railImage) {
      return section.railImage;
    }

    if (article.railImage) {
      return article.railImage;
    }

    return section.railClass || article.railClass ? "" : relatedArticles[index]?.heroImage ?? article.heroImage ?? "";
  });
  const railMode = article.railMode ?? "default";
  const railImageStateClass = railImageHidden[0] ? " is-rail-image-hidden" : "";
  const firstRailTitle = firstSection?.railTitle ? text(firstSection.railTitle, locale) : article.railTitle ? text(article.railTitle, locale) : firstSection ? text(firstSection.heading, locale) : text(article.subtitle, locale);
  const firstRailText = firstSection?.railText ? text(firstSection.railText, locale) : article.railText ? text(article.railText, locale) : firstSection?.paragraphs[locale][0] ?? text(article.subtitle, locale);
  const articleVisual = article.hideHeroImage
    ? ""
    : `      <div class="article-visual" data-reveal data-action-card data-scroll-motion>
        ${renderImageBlock(article.heroClass, article.heroImage, article.heroImage ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${escapeHtml(locale === "ko" ? "대표 비주얼 바꾸기" : "Cycle hero visual")}"`)}
      </div>

`;
  const metaLabels = locale === "ko"
    ? { date: "발행", location: "장소", readTime: "읽기", tags: "태그" }
    : { date: "Published", location: "Location", readTime: "Reading", tags: "Tags" };
  const renderGalleryFigure = (images: ArticleBlockImage[], caption?: LocalizedText): string => {
    const visibleImages = images.filter((image) => image.image || image.imageClass);

    if (visibleImages.length === 0) {
      return "";
    }

    const captionText = caption ? text(caption, locale) : "";
    const imageItems = visibleImages
      .map((image, index) => {
        const cycleAttributes = image.image ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${escapeHtml(locale === "ko" ? "본문 비주얼 바꾸기" : "Cycle inline visual")}"`;
        return `                      <span class="article-gallery-item${index === 0 ? " is-active" : ""}" data-gallery-item${index === 0 ? "" : " hidden"}>
                        ${renderImageBlock(image.imageClass || article.heroClass, image.image, cycleAttributes)}
                      </span>`;
      })
      .join("\n");
    const controlsMarkup = visibleImages.length > 1 ? `
                    <div class="article-gallery-controls" aria-label="${escapeHtml(locale === "ko" ? "본문 이미지 순환" : "Body image carousel")}">
                      <button type="button" data-gallery-prev>${escapeHtml(locale === "ko" ? "이전" : "Prev")}</button>
                      <span data-gallery-count>1/${visibleImages.length}</span>
                      <button type="button" data-gallery-next>${escapeHtml(locale === "ko" ? "다음" : "Next")}</button>
                    </div>` : "";
    const captionMarkup = captionText ? `
                    <figcaption>${escapeHtml(captionText)}</figcaption>` : "";

    return `
                  <figure class="article-section-figure article-section-gallery" data-gallery data-gallery-index="0">
                    <div class="article-gallery-frame"${visibleImages.length > 1 ? ` data-gallery-frame role="button" tabindex="0" aria-label="${escapeHtml(locale === "ko" ? "본문 이미지 다음으로 보기" : "Show next body image")}"` : ""}>
${imageItems}
                    </div>${controlsMarkup}${captionMarkup}
                  </figure>`;
  };

  const legacySectionGallery = (section: ArticleSection): string => {
    if (section.hideSectionImage || (!section.sectionImage && !section.sectionImageClass)) {
      return "";
    }

    return renderGalleryFigure(
      [{ imageClass: section.sectionImageClass || section.railClass || article.heroClass, image: section.sectionImage }],
      section.sectionImageCaption
    );
  };

  const fallbackSectionBlocks = (section: ArticleSection): ArticleSectionBlock[] => section.paragraphs[locale].map((paragraph) => ({
    type: "paragraph",
    text: { ko: paragraph, en: paragraph }
  }));

  const renderSectionBlock = (block: ArticleSectionBlock): string => {
    if (block.type === "quote") {
      const quoteText = text(block.text, locale).trim();
      return quoteText ? `<blockquote class="article-inline-quote" data-reveal>${escapeHtml(quoteText)}</blockquote>` : "";
    }

    if (block.type === "gallery") {
      return renderGalleryFigure(block.images, block.caption);
    }

    const paragraphText = text(block.text, locale).trim();
    return paragraphText ? `<p>${escapeHtml(paragraphText)}</p>` : "";
  };

  const renderSectionContent = (section: ArticleSection): string => {
    if (section.blocks && section.blocks.length > 0) {
      return section.blocks.map(renderSectionBlock).join("");
    }

    return `${legacySectionGallery(section)}
                  ${fallbackSectionBlocks(section).map(renderSectionBlock).join("")}`;
  };

  const body = `
    <article class="article-detail section-pad">
      <header class="article-hero-grid" data-reveal>
        <div class="article-title-block">
          <a class="back-link" href="${withLocale("/archive", locale)}">${escapeHtml(labels.back)}</a>
          <p class="kicker">${escapeHtml(category)} / ${escapeHtml(text(article.subcategory, locale))}</p>
          <h1>${escapeHtml(text(article.title, locale))}</h1>
          <p>${escapeHtml(text(article.deck, locale))}</p>
        </div>
        <div class="article-meta-card" aria-label="${escapeHtml(locale === "ko" ? "기사 정보" : "Article details")}">
          <span><small>${escapeHtml(metaLabels.date)}</small><strong>${formatDate(article.date, locale)}</strong></span>
          <span><small>${escapeHtml(metaLabels.location)}</small><strong>${escapeHtml(text(article.location, locale))}</strong></span>
          <span><small>${escapeHtml(metaLabels.readTime)}</small><strong>${escapeHtml(text(article.readTime, locale))}</strong></span>
          <span><small>${escapeHtml(metaLabels.tags)}</small><strong>${article.tags[locale].map(escapeHtml).join(" / ")}</strong></span>
        </div>
      </header>

${articleVisual}      <div class="article-body-grid">
        <aside class="article-side article-side-${railMode}${railImageStateClass}" data-reveal data-article-rail>
          <span class="article-rail-no" data-article-rail-no>01</span>
          ${renderImageBlock(railVisuals[0] ?? article.heroClass, railImages[0], `data-article-rail-visual data-visual-cycle role="button" tabindex="0" aria-label="${escapeHtml(locale === "ko" ? "레일 비주얼 바꾸기" : "Cycle rail visual")}"`)}
          <strong data-article-rail-title>${escapeHtml(firstRailTitle)}</strong>
          <p data-article-rail-text>${escapeHtml(firstRailText)}</p>
        </aside>

        <div class="article-body">
          <blockquote data-reveal>${escapeHtml(text(article.quote, locale))}</blockquote>
          ${article.sections
            .map(
              (section, index) => `
                <section class="article-section" data-reveal data-article-section data-rail-no="${String(index + 1).padStart(2, "0")}" data-rail-title="${escapeHtml(section.railTitle ? text(section.railTitle, locale) : text(section.heading, locale))}" data-rail-text="${escapeHtml(section.railText ? text(section.railText, locale) : section.paragraphs[locale][0] ?? "")}" data-rail-visual="${railVisuals[index] ?? article.heroClass}" data-rail-image="${escapeHtml(railImages[index] ?? "")}" data-rail-image-hidden="${railImageHidden[index] ? "true" : "false"}">
                  <h2>${escapeHtml(text(section.heading, locale))}</h2>${renderSectionContent(section)}
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
                ${renderImageBlock(related.heroClass, related.heroImage)}
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
  selectedSubcategory?: SubcategoryKey,
  page = 1
): string => {
  const labels = ui[locale];
  const selectedCategoryDefinition = selectedCategory ? site.categories.find((category) => category.key === selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const archiveTitle = selectedSubcategoryDefinition
    ? text(selectedSubcategoryDefinition.label, locale)
    : selectedCategoryDefinition
      ? text(selectedCategoryDefinition.label, locale)
      : labels.fullArchive;
  const archiveLead = selectedCategoryDefinition ? text(selectedCategoryDefinition.description, locale) : labels.archiveLead;
  const archiveKicker = "Archive";
  const archiveControl = renderArchiveControl(site, articleList, locale, selectedCategoryDefinition, selectedSubcategoryDefinition);
  const body = `
    <section class="archive archive-page section-pad" aria-labelledby="archive-title">
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">${escapeHtml(archiveKicker)}</p>
          <h1 id="archive-title">${escapeHtml(archiveTitle)}</h1>${archiveControl}
        </div>
        <p>${escapeHtml(archiveLead)}</p>
      </div>

      ${renderArchiveBoard(site, articleList, locale, false, selectedCategory, selectedSubcategory, page, true)}
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
