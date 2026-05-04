document.documentElement.classList.add("js");

const menuButton = document.querySelector<HTMLButtonElement>("[data-menu-button]");
const mobileMenu = document.querySelector<HTMLElement>("[data-mobile-menu]");
const progressBar = document.querySelector<HTMLElement>("[data-scroll-progress]");
const header = document.querySelector<HTMLElement>("[data-header]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
const galleryLayouts = ["standard", "wide", "portrait", "diptych", "strip"] as const;
type GalleryLayout = typeof galleryLayouts[number];
const defaultGalleryLayout = (imageCount: number): GalleryLayout => imageCount >= 3 ? "strip" : imageCount === 2 ? "diptych" : "standard";
const normalizeGalleryLayout = (value: string | undefined, imageCount = 1): GalleryLayout => galleryLayouts.includes(value as GalleryLayout) ? value as GalleryLayout : defaultGalleryLayout(imageCount);
const clientScriptSrc = document.querySelector<HTMLScriptElement>('script[src*="client.js"]')?.getAttribute("src") || "/client.js";
const clientBasePath = new URL(clientScriptSrc, window.location.href).pathname.replace(/\/client\.js$/, "");
const apiPath = (path: string): string => `${clientBasePath}${path}`;
const supabaseUrl = document.body.dataset.supabaseUrl || "";
const supabaseAnonKey = document.body.dataset.supabaseAnonKey || "";
const supabaseFunctionsUrl = document.body.dataset.supabaseFunctionsUrl || (supabaseUrl ? `${supabaseUrl}/functions/v1` : "");

interface RuntimeContentSnapshot {
  articles?: unknown;
  issueProjects?: unknown;
  updatedAt?: string;
}

type RuntimeLocale = "ko" | "en";
type RuntimeLocalizedText = Record<RuntimeLocale, string>;
type RuntimeLocalizedList = Record<RuntimeLocale, string[]>;

interface RuntimeCategoryDefinition {
  key: string;
  label: RuntimeLocalizedText;
  description: RuntimeLocalizedText;
  subcategories: { key: string; label: RuntimeLocalizedText }[];
}

interface RuntimeArticleBlockImage {
  imageClass?: string;
  image?: string;
}

type RuntimeArticleSectionBlock =
  | { type: "paragraph"; text: RuntimeLocalizedText }
  | { type: "quote"; text: RuntimeLocalizedText }
  | { type: "gallery"; images: RuntimeArticleBlockImage[]; layout?: GalleryLayout; caption?: RuntimeLocalizedText };

interface RuntimeArticleSection {
  heading: RuntimeLocalizedText;
  paragraphs: RuntimeLocalizedList;
  blocks?: RuntimeArticleSectionBlock[];
  railTitle?: RuntimeLocalizedText;
  railText?: RuntimeLocalizedText;
  railClass?: string;
  railImage?: string;
  hideRailImage?: boolean;
  sectionImageClass?: string;
  sectionImage?: string;
  sectionImageCaption?: RuntimeLocalizedText;
  hideSectionImage?: boolean;
}

interface RuntimeArticle {
  slug: string;
  title: RuntimeLocalizedText;
  subtitle: RuntimeLocalizedText;
  deck: RuntimeLocalizedText;
  category: string;
  subcategoryKey: string;
  subcategoryKeys: string[];
  subcategory: RuntimeLocalizedText;
  date: string;
  issue: string;
  readTime: RuntimeLocalizedText;
  location: RuntimeLocalizedText;
  heroClass: string;
  heroImage?: string;
  hideHeroImage?: boolean;
  tags: RuntimeLocalizedList;
  excerpt: RuntimeLocalizedText;
  quote: RuntimeLocalizedText;
  railMode?: "default" | "image" | "text";
  railClass?: string;
  railImage?: string;
  hideRailImage?: boolean;
  railTitle?: RuntimeLocalizedText;
  railText?: RuntimeLocalizedText;
  sections: RuntimeArticleSection[];
}

interface RuntimeIssueFeature {
  slug: string;
  role: RuntimeLocalizedText;
  title: RuntimeLocalizedText;
  intro: RuntimeLocalizedText;
  excerpt: RuntimeLocalizedText;
  body: RuntimeLocalizedList;
  credit: RuntimeLocalizedText;
  location: RuntimeLocalizedText;
  readTime: RuntimeLocalizedText;
  heroClass: string;
  heroImage?: string;
}

interface RuntimeIssueProject {
  number: string;
  title: RuntimeLocalizedText;
  subtitle: RuntimeLocalizedText;
  deck: RuntimeLocalizedText;
  date: RuntimeLocalizedText;
  format: RuntimeLocalizedText;
  availability: RuntimeLocalizedText;
  coverCredit: RuntimeLocalizedText;
  coverImage?: string;
  editorNote: RuntimeLocalizedText;
  credits: { label: RuntimeLocalizedText; value: RuntimeLocalizedText }[];
  features: RuntimeIssueFeature[];
}

interface RuntimeContentData {
  articles: RuntimeArticle[];
  issueProjects: RuntimeIssueProject[];
}

const contentHashClient = (value: string): string => {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
};

const runtimeContentVersion = (data: RuntimeContentData, path: string): string => {
  const normalizedPath = path.replace(/\/$/, "") || "/";
  const articleSensitive = normalizedPath === "/" || normalizedPath.startsWith("/archive") || normalizedPath.startsWith("/articles");

  return contentHashClient(`${articleSensitive ? JSON.stringify(data.articles) : ""}|${JSON.stringify(data.issueProjects)}`);
};

const fetchSupabaseSnapshot = async (): Promise<RuntimeContentSnapshot | null> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/content_snapshots?id=eq.published&select=data,updated_at&limit=1`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const rows = await response.json() as { data?: { articles?: unknown; issueProjects?: unknown }; updated_at?: string }[];
  const row = rows[0];

  if (!row?.data) {
    return null;
  }

  return {
    articles: row.data.articles,
    issueProjects: row.data.issueProjects,
    updatedAt: row.updated_at
  };
};

const runtimeCategories: RuntimeCategoryDefinition[] = [
  {
    key: "art",
    label: { ko: "예술", en: "Art" },
    description: { ko: "카메라, 이미지, 사운드처럼 감각을 만드는 도구와 장면을 읽습니다.", en: "Tools and scenes that make sense: cameras, images, and sound." },
    subcategories: [
      { key: "exhibitions", label: { ko: "전시", en: "Exhibitions" } },
      { key: "artists", label: { ko: "작가", en: "Artists" } },
      { key: "images", label: { ko: "이미지", en: "Images" } },
      { key: "sound", label: { ko: "사운드", en: "Sound" } }
    ]
  },
  {
    key: "tech",
    label: { ko: "테크", en: "Tech" },
    description: { ko: "공간 컴퓨팅, 작업 도구, 센서와 기본값이 생활의 리듬을 바꾸는 방식을 봅니다.", en: "Spatial computing, work tools, sensors, and defaults that change daily rhythm." },
    subcategories: [
      { key: "ai", label: { ko: "AI", en: "AI" } },
      { key: "interface", label: { ko: "인터페이스", en: "Interface" } },
      { key: "tools", label: { ko: "도구", en: "Tools" } },
      { key: "systems", label: { ko: "시스템", en: "Systems" } }
    ]
  },
  {
    key: "design",
    label: { ko: "디자인", en: "Design" },
    description: { ko: "제품의 형태, 브랜드의 표준, 손이 기억하는 조작을 따라갑니다.", en: "Product form, brand standards, and controls remembered by the hand." },
    subcategories: [
      { key: "graphic", label: { ko: "그래픽", en: "Graphic" } },
      { key: "product", label: { ko: "제품", en: "Product" } },
      { key: "brand", label: { ko: "브랜드", en: "Brand" } }
    ]
  },
  {
    key: "space",
    label: { ko: "공간", en: "Space" },
    description: { ko: "브랜드 공간, 매장 동선, 방 안에서 물건이 시간을 만드는 방식을 읽습니다.", en: "Brand spaces, store routes, and how objects make time in rooms." },
    subcategories: [
      { key: "interior", label: { ko: "인테리어", en: "Interior" } },
      { key: "architecture", label: { ko: "건축", en: "Architecture" } },
      { key: "urban", label: { ko: "도시", en: "Urban" } }
    ]
  },
  {
    key: "beauty",
    label: { ko: "뷰티", en: "Beauty" },
    description: { ko: "향, 헤어케어, 피부와 루틴이 몸의 시간을 조절하는 방식을 봅니다.", en: "Fragrance, haircare, skin, and routines that tune bodily time." },
    subcategories: [
      { key: "skincare", label: { ko: "스킨케어", en: "Skincare" } },
      { key: "makeup", label: { ko: "메이크업", en: "Makeup" } },
      { key: "fragrance", label: { ko: "향", en: "Fragrance" } },
      { key: "haircare", label: { ko: "헤어케어", en: "Haircare" } }
    ]
  },
  {
    key: "philosophy",
    label: { ko: "철학", en: "Philosophy" },
    description: { ko: "소유, 프라이버시, 수리 가능성처럼 취향 뒤의 판단 구조를 묻습니다.", en: "Ownership, privacy, repairability, and the structures of judgment behind taste." },
    subcategories: [
      { key: "thought", label: { ko: "사유", en: "Thought" } },
      { key: "ethics", label: { ko: "윤리", en: "Ethics" } },
      { key: "time", label: { ko: "시간", en: "Time" } },
      { key: "body", label: { ko: "몸", en: "Body" } }
    ]
  }
];

const runtimeLabels = {
  ko: {
    selectedStories: "SELECTED STORIES",
    fullArchive: "All Articles",
    archiveLead: "날짜, 제목, 분야만 먼저 남겨 읽는 순서를 만드는 목록입니다.",
    related: "이어 읽기",
    back: "아카이브로 돌아가기"
  },
  en: {
    selectedStories: "Selected Stories",
    fullArchive: "All Articles",
    archiveLead: "A compact index ordered by date, title, and department.",
    related: "Related Reading",
    back: "Back to Archive"
  }
} satisfies Record<RuntimeLocale, Record<string, string>>;

const runtimePageSize = 5;
let runtimeArticleRailCleanup: (() => void) | null = null;

const runtimeEscapeHtml = (value: string): string => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const runtimeText = (value: RuntimeLocalizedText | undefined, locale: RuntimeLocale): string => value?.[locale] || value?.ko || value?.en || "";
const runtimeList = (value: RuntimeLocalizedList | undefined, locale: RuntimeLocale): string[] => value?.[locale] || value?.ko || value?.en || [];
const runtimeLocale = (): RuntimeLocale => {
  let pathname = window.location.pathname;

  if (clientBasePath && pathname.startsWith(clientBasePath)) {
    pathname = pathname.slice(clientBasePath.length) || "/";
  }

  return pathname === "/en" || pathname.startsWith("/en/") || document.documentElement.lang === "en" ? "en" : "ko";
};

const runtimePath = (): string => {
  let pathname = window.location.pathname;

  if (clientBasePath && pathname === clientBasePath) {
    pathname = "/";
  } else if (clientBasePath && pathname.startsWith(`${clientBasePath}/`)) {
    pathname = pathname.slice(clientBasePath.length) || "/";
  }

  pathname = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  return pathname.replace(/\/$/, "") || "/";
};

const runtimeHref = (path: string, locale: RuntimeLocale): string => {
  const [pathAndQuery, hash] = path.split("#");
  const [pathname, query] = pathAndQuery.split("?");
  const localizedPath = locale === "en" ? (pathname === "/" ? "/en/" : `/en${pathname}`) : pathname;
  return `${clientBasePath}${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
};

const runtimeArticleHref = (article: RuntimeArticle, locale: RuntimeLocale): string => runtimeHref(`/articles/${article.slug}/`, locale);
const runtimeIssueSlug = (issue: RuntimeIssueProject): string => issue.number.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "issue";
const runtimeIssueHref = (issue: RuntimeIssueProject, locale: RuntimeLocale): string => runtimeHref(`/issues/${runtimeIssueSlug(issue)}/`, locale);
const runtimeArchiveHref = (locale: RuntimeLocale, category?: string, subcategory?: string): string => runtimeHref(category ? subcategory ? `/archive/${category}/${subcategory}/` : `/archive/${category}/` : "/archive/", locale);
const runtimeIssueIndexHref = (locale: RuntimeLocale, page = 1): string => runtimeHref(page <= 1 ? "/issues/" : `/issues/page/${page}/`, locale);
const runtimePageCount = (itemCount: number): number => Math.max(1, Math.ceil(itemCount / runtimePageSize));

const runtimeFormatDate = (date: string, locale: RuntimeLocale): string => new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
  year: "numeric",
  month: locale === "ko" ? "2-digit" : "short",
  day: "2-digit"
}).format(new Date(date)).replace(/\. /g, ".").replace(/\.$/, "");

const runtimeCategory = (key: string): RuntimeCategoryDefinition | undefined => runtimeCategories.find((category) => category.key === key);
const runtimeCategoryLabel = (key: string, locale: RuntimeLocale): string => runtimeText(runtimeCategory(key)?.label, locale) || key;
const runtimeSubcategoryLabel = (categoryKey: string, subcategoryKey: string, locale: RuntimeLocale): string =>
  runtimeText(runtimeCategory(categoryKey)?.subcategories.find((subcategory) => subcategory.key === subcategoryKey)?.label, locale) || subcategoryKey;

const runtimeImageBlock = (visualClass: string, imageUrl = "", attributes = ""): string =>
  `<span class="image-block ${runtimeEscapeHtml(visualClass || "image-material")}${imageUrl ? " has-custom-image" : ""}"${attributes ? ` ${attributes}` : ""}>${imageUrl ? `<img src="${runtimeEscapeHtml(imageUrl)}" alt="" loading="lazy" decoding="async" data-image-source />` : ""}</span>`;

const runtimeSnapshotData = (snapshot: RuntimeContentSnapshot | null): RuntimeContentData | null => {
  if (!snapshot || !Array.isArray(snapshot.articles) || !Array.isArray(snapshot.issueProjects)) {
    return null;
  }

  return {
    articles: snapshot.articles as RuntimeArticle[],
    issueProjects: snapshot.issueProjects as RuntimeIssueProject[]
  };
};

const runtimeSetDocumentMeta = (title: string, description: string): void => {
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
};

const runtimePagination = (currentPage: number, totalPages: number, hrefForPage: (page: number) => string, locale: RuntimeLocale): string => `<nav class="pagination" aria-label="${runtimeEscapeHtml(locale === "ko" ? "페이지" : "Pagination")}">
        <span>${runtimeEscapeHtml(locale === "ko" ? "페이지" : "Page")}</span>
        <div>
          ${Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;
            return `<a class="${page === currentPage ? "is-active" : ""}" href="${hrefForPage(page)}"${page === currentPage ? " aria-current=\"page\"" : ""}>${page}</a>`;
          }).join("\n          ")}
        </div>
      </nav>`;

const runtimeArchivePageHref = (locale: RuntimeLocale, page = 1, category?: string, subcategory?: string): string => {
  if (page <= 1) {
    return runtimeArchiveHref(locale, category, subcategory);
  }

  if (category && subcategory) {
    return runtimeHref(`/archive/${category}/${subcategory}/page/${page}/`, locale);
  }

  return runtimeHref(category ? `/archive/${category}/page/${page}/` : `/archive/page/${page}/`, locale);
};

const runtimeArticleHasSubcategory = (article: RuntimeArticle, subcategory: string): boolean => article.subcategoryKeys?.includes(subcategory) || article.subcategoryKey === subcategory;

const runtimeArchiveRows = (articles: RuntimeArticle[], locale: RuntimeLocale, selectedCategory?: string, selectedSubcategory?: string, rowOffset = 0): string => articles
  .map((article, index) => {
    const fullLabel = `${runtimeCategoryLabel(article.category, locale)} / ${runtimeText(article.subcategory, locale)}`;
    const rowLabel = selectedSubcategory
      ? runtimeCategoryLabel(article.category, locale)
      : selectedCategory
        ? runtimeText(article.subcategory, locale)
        : fullLabel;

    return `      <a href="${runtimeArticleHref(article, locale)}" class="archive-row" data-preview-class="${runtimeEscapeHtml(article.heroClass)}" data-preview-image="${runtimeEscapeHtml(article.heroImage || "")}" data-preview-kicker="${runtimeEscapeHtml(fullLabel)}" data-preview-title="${runtimeEscapeHtml(runtimeText(article.title, locale))}" data-category="${runtimeEscapeHtml(article.category)}" data-action-card>
        <span class="archive-date"><b>${String(rowOffset + index + 1).padStart(2, "0")}</b><small>${runtimeFormatDate(article.date, locale)}</small></span>
        <span class="archive-title">${runtimeEscapeHtml(runtimeText(article.title, locale))}</span>
        <span class="archive-category"><span>${runtimeEscapeHtml(rowLabel)}</span><small>${runtimeEscapeHtml(runtimeText(article.location, locale))}</small></span>
        <span class="archive-info"><span>${runtimeEscapeHtml(runtimeText(article.readTime, locale))}</span></span>
        <span class="archive-summary">${runtimeEscapeHtml(runtimeText(article.excerpt, locale))}</span>
      </a>`;
  })
  .join("\n");

const runtimeArchiveBoard = (articles: RuntimeArticle[], locale: RuntimeLocale, selectedCategory?: string, selectedSubcategory?: string, page = 1): string => {
  const visibleArticles = articles.filter((article) => {
    if (selectedCategory && article.category !== selectedCategory) {
      return false;
    }

    return !selectedSubcategory || runtimeArticleHasSubcategory(article, selectedSubcategory);
  });
  const totalPages = runtimePageCount(visibleArticles.length);
  const currentPage = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const pagedArticles = visibleArticles.slice((currentPage - 1) * runtimePageSize, currentPage * runtimePageSize);

  return `    <div class="archive-board ${visibleArticles.length === 0 ? "is-empty" : ""}" data-archive-board data-reveal>
      <div class="archive-list" data-archive-list>
        ${pagedArticles.length > 0
          ? runtimeArchiveRows(pagedArticles, locale, selectedCategory, selectedSubcategory, (currentPage - 1) * runtimePageSize)
          : `<p class="archive-empty">${runtimeEscapeHtml(locale === "ko" ? "아직 이 하위 카테고리로 묶인 글이 없습니다. 다른 하위 카테고리를 선택해 주세요." : "No articles are filed under this subcategory yet. Choose another subcategory to continue reading.")}</p>`}
      </div>
    </div>${runtimePagination(currentPage, totalPages, (pageNumber) => runtimeArchivePageHref(locale, pageNumber, selectedCategory, selectedSubcategory), locale)}`;
};

const runtimeArchiveControl = (articles: RuntimeArticle[], locale: RuntimeLocale, selectedCategory?: string, selectedSubcategory?: string): string => {
  const selectedCategoryDefinition = selectedCategory ? runtimeCategory(selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const countText = (count: number): string => locale === "ko" ? `${count}개` : `${count} ${count === 1 ? "article" : "articles"}`;

  if (!selectedCategoryDefinition) {
    return `
          <div class="archive-control" data-archive-control>
            <label>
              <span>${runtimeEscapeHtml(locale === "ko" ? "분야" : "Department")}</span>
              <select data-navigation-select aria-label="${runtimeEscapeHtml(locale === "ko" ? "아카이브 분야 선택" : "Choose an archive department")}">
                <option value="${runtimeArchiveHref(locale)}" selected>${runtimeEscapeHtml(runtimeLabels[locale].fullArchive)} · ${countText(articles.length)}</option>
                ${runtimeCategories.map((category) => `<option value="${runtimeArchiveHref(locale, category.key)}">${runtimeEscapeHtml(runtimeText(category.label, locale))} · ${countText(articles.filter((article) => article.category === category.key).length)}</option>`).join("")}
              </select>
            </label>
            <span>${runtimeEscapeHtml(countText(articles.length))}</span>
          </div>`;
  }

  const categoryCount = articles.filter((article) => article.category === selectedCategoryDefinition.key).length;
  const currentCount = selectedSubcategoryDefinition
    ? articles.filter((article) => article.category === selectedCategoryDefinition.key && runtimeArticleHasSubcategory(article, selectedSubcategoryDefinition.key)).length
    : categoryCount;
  const categoryLabel = runtimeText(selectedCategoryDefinition.label, locale);

  return `
          <div class="archive-control" data-archive-control>
            <label>
              <span>${runtimeEscapeHtml(locale === "ko" ? "세부 분야" : "Subcategory")}</span>
              <select data-navigation-select aria-label="${runtimeEscapeHtml(locale === "ko" ? `${categoryLabel} 세부 분야 선택` : `Choose a ${categoryLabel} subcategory`)}">
                <option value="${runtimeArchiveHref(locale, selectedCategoryDefinition.key)}"${selectedSubcategoryDefinition ? "" : " selected"}>${runtimeEscapeHtml(locale === "ko" ? `전체 ${categoryLabel}` : `All ${categoryLabel}`)} · ${countText(categoryCount)}</option>
                ${selectedCategoryDefinition.subcategories.map((subcategory) => {
                  const count = articles.filter((article) => article.category === selectedCategoryDefinition.key && runtimeArticleHasSubcategory(article, subcategory.key)).length;
                  return `<option value="${runtimeArchiveHref(locale, selectedCategoryDefinition.key, subcategory.key)}"${selectedSubcategoryDefinition?.key === subcategory.key ? " selected" : ""}>${runtimeEscapeHtml(runtimeText(subcategory.label, locale))} · ${countText(count)}</option>`;
                }).join("")}
              </select>
            </label>
            <span>${runtimeEscapeHtml(countText(currentCount))}</span>
          </div>`;
};

const renderRuntimeArchivePage = (articles: RuntimeArticle[], locale: RuntimeLocale, selectedCategory?: string, selectedSubcategory?: string, page = 1): string => {
  const selectedCategoryDefinition = selectedCategory ? runtimeCategory(selectedCategory) : undefined;
  const selectedSubcategoryDefinition = selectedCategoryDefinition?.subcategories.find((subcategory) => subcategory.key === selectedSubcategory);
  const archiveTitle = selectedSubcategoryDefinition
    ? runtimeText(selectedSubcategoryDefinition.label, locale)
    : selectedCategoryDefinition
      ? runtimeText(selectedCategoryDefinition.label, locale)
      : runtimeLabels[locale].fullArchive;
  const archiveLead = selectedCategoryDefinition ? runtimeText(selectedCategoryDefinition.description, locale) : runtimeLabels[locale].archiveLead;

  runtimeSetDocumentMeta(`${archiveTitle} | Habitus`, archiveLead);

  return `
    <section class="archive archive-page section-pad" aria-labelledby="archive-title">
      <div class="archive-heading" data-reveal>
        <div>
          <p class="kicker">Archive</p>
          <h1 id="archive-title">${runtimeEscapeHtml(archiveTitle)}</h1>${runtimeArchiveControl(articles, locale, selectedCategory, selectedSubcategory)}
        </div>
        <p>${runtimeEscapeHtml(archiveLead)}</p>
      </div>

      ${runtimeArchiveBoard(articles, locale, selectedCategory, selectedSubcategory, page)}
    </section>`;
};

const renderRuntimeGallery = (article: RuntimeArticle, images: RuntimeArticleBlockImage[], caption: RuntimeLocalizedText | undefined, locale: RuntimeLocale, layoutValue?: string): string => {
  const visibleImages = images.filter((image) => image.image || image.imageClass);

  if (visibleImages.length === 0) {
    return "";
  }

  const layout = normalizeGalleryLayout(layoutValue, visibleImages.length);
  const isStaticImageSet = layout === "diptych" || layout === "strip";
  const imageItems = visibleImages.map((image, index) => `                      <span class="article-gallery-item${!isStaticImageSet && index === 0 ? " is-active" : ""}"${!isStaticImageSet ? ` data-gallery-item${index === 0 ? "" : " hidden"}` : ""}>
                        ${runtimeImageBlock(image.imageClass || article.heroClass, image.image || "", image.image ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${runtimeEscapeHtml(locale === "ko" ? "본문 비주얼 바꾸기" : "Cycle inline visual")}"`)}
                      </span>`).join("\n");
  const controlsMarkup = !isStaticImageSet && visibleImages.length > 1 ? `
                    <div class="article-gallery-controls" aria-label="${runtimeEscapeHtml(locale === "ko" ? "본문 이미지 순환" : "Body image carousel")}">
                      <button type="button" data-gallery-prev>${runtimeEscapeHtml(locale === "ko" ? "이전" : "Prev")}</button>
                      <span data-gallery-count>1/${visibleImages.length}</span>
                      <button type="button" data-gallery-next>${runtimeEscapeHtml(locale === "ko" ? "다음" : "Next")}</button>
                    </div>` : "";
  const captionText = runtimeText(caption, locale);

  return `
                  <figure class="article-section-figure article-section-gallery article-gallery-${layout}" data-gallery-layout="${layout}"${!isStaticImageSet ? " data-gallery data-gallery-index=\"0\"" : ""}>
                    <div class="article-gallery-frame"${!isStaticImageSet && visibleImages.length > 1 ? ` data-gallery-frame role="button" tabindex="0" aria-label="${runtimeEscapeHtml(locale === "ko" ? "본문 이미지 다음으로 보기" : "Show next body image")}"` : ""}>
${imageItems}
                    </div>${controlsMarkup}${captionText ? `
                    <figcaption>${runtimeEscapeHtml(captionText)}</figcaption>` : ""}
                  </figure>`;
};

const renderRuntimeArticlePage = (article: RuntimeArticle, relatedArticles: RuntimeArticle[], locale: RuntimeLocale): string => {
  const firstSection = article.sections[0];
  const railVisuals = article.sections.map((section, index) => section.railClass || article.railClass || relatedArticles[index]?.heroClass || article.heroClass);
  const railImageHidden = article.sections.map((section) => Boolean(section.hideRailImage || article.hideRailImage));
  const railImages = article.sections.map((section, index) => {
    if (railImageHidden[index]) {
      return "";
    }

    return section.railImage || article.railImage || (section.railClass || article.railClass ? "" : relatedArticles[index]?.heroImage || article.heroImage || "");
  });
  const railMode = article.railMode || "default";
  const firstRailTitle = runtimeText(firstSection?.railTitle, locale) || runtimeText(article.railTitle, locale) || runtimeText(firstSection?.heading, locale) || runtimeText(article.subtitle, locale);
  const firstRailText = runtimeText(firstSection?.railText, locale) || runtimeText(article.railText, locale) || runtimeList(firstSection?.paragraphs, locale)[0] || runtimeText(article.subtitle, locale);
  const category = runtimeCategoryLabel(article.category, locale);
  const metaLabels = locale === "ko"
    ? { date: "발행", location: "장소", readTime: "읽기", tags: "태그" }
    : { date: "Published", location: "Location", readTime: "Reading", tags: "Tags" };
  const renderSectionBlock = (block: RuntimeArticleSectionBlock): string => {
    if (block.type === "quote") {
      const quoteText = runtimeText(block.text, locale).trim();
      return quoteText ? `<blockquote class="article-inline-quote" data-reveal>${runtimeEscapeHtml(quoteText)}</blockquote>` : "";
    }

    if (block.type === "gallery") {
      return renderRuntimeGallery(article, block.images || [], block.caption, locale, block.layout);
    }

    const paragraphText = runtimeText(block.text, locale).trim();
    return paragraphText ? `<p>${runtimeEscapeHtml(paragraphText)}</p>` : "";
  };
  const renderSectionContent = (section: RuntimeArticleSection): string => {
    if (section.blocks && section.blocks.length > 0) {
      return section.blocks.map(renderSectionBlock).join("");
    }

    const legacyGallery = section.hideSectionImage || (!section.sectionImage && !section.sectionImageClass)
      ? ""
      : renderRuntimeGallery(article, [{ imageClass: section.sectionImageClass || section.railClass || article.heroClass, image: section.sectionImage || "" }], section.sectionImageCaption, locale);

    return `${legacyGallery}${runtimeList(section.paragraphs, locale).map((paragraph) => `<p>${runtimeEscapeHtml(paragraph)}</p>`).join("")}`;
  };
  const articleVisual = article.hideHeroImage ? "" : `      <div class="article-visual" data-reveal data-action-card data-scroll-motion>
        ${runtimeImageBlock(article.heroClass, article.heroImage || "", article.heroImage ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${runtimeEscapeHtml(locale === "ko" ? "대표 비주얼 바꾸기" : "Cycle hero visual")}"`)}
      </div>

`;

  runtimeSetDocumentMeta(`${runtimeText(article.title, locale)} | Habitus`, runtimeText(article.deck, locale));

  return `
    <article class="article-detail section-pad">
      <header class="article-hero-grid" data-reveal>
        <div class="article-title-block">
          <a class="back-link" href="${runtimeHref("/archive/", locale)}">${runtimeEscapeHtml(runtimeLabels[locale].back)}</a>
          <p class="kicker">${runtimeEscapeHtml(category)} / ${runtimeEscapeHtml(runtimeText(article.subcategory, locale))}</p>
          <h1>${runtimeEscapeHtml(runtimeText(article.title, locale))}</h1>
          <p>${runtimeEscapeHtml(runtimeText(article.deck, locale))}</p>
        </div>
        <div class="article-meta-card" aria-label="${runtimeEscapeHtml(locale === "ko" ? "기사 정보" : "Article details")}">
          <span><small>${runtimeEscapeHtml(metaLabels.date)}</small><strong>${runtimeFormatDate(article.date, locale)}</strong></span>
          <span><small>${runtimeEscapeHtml(metaLabels.location)}</small><strong>${runtimeEscapeHtml(runtimeText(article.location, locale))}</strong></span>
          <span><small>${runtimeEscapeHtml(metaLabels.readTime)}</small><strong>${runtimeEscapeHtml(runtimeText(article.readTime, locale))}</strong></span>
          <span><small>${runtimeEscapeHtml(metaLabels.tags)}</small><strong>${runtimeList(article.tags, locale).map(runtimeEscapeHtml).join(" / ")}</strong></span>
        </div>
      </header>

${articleVisual}      <div class="article-body-grid">
        <aside class="article-side article-side-${runtimeEscapeHtml(railMode)}${railImageHidden[0] ? " is-rail-image-hidden" : ""}" data-reveal data-article-rail>
          <span class="article-rail-no" data-article-rail-no>01</span>
          ${runtimeImageBlock(railVisuals[0] || article.heroClass, railImages[0] || "", `data-article-rail-visual data-visual-cycle role="button" tabindex="0" aria-label="${runtimeEscapeHtml(locale === "ko" ? "레일 비주얼 바꾸기" : "Cycle rail visual")}"`)}
          <strong data-article-rail-title>${runtimeEscapeHtml(firstRailTitle)}</strong>
          <p data-article-rail-text>${runtimeEscapeHtml(firstRailText)}</p>
        </aside>

        <div class="article-body">
          <blockquote data-reveal>${runtimeEscapeHtml(runtimeText(article.quote, locale))}</blockquote>
          ${article.sections.map((section, index) => `
                <section class="article-section" data-reveal data-article-section data-rail-no="${String(index + 1).padStart(2, "0")}" data-rail-title="${runtimeEscapeHtml(runtimeText(section.railTitle, locale) || runtimeText(section.heading, locale))}" data-rail-text="${runtimeEscapeHtml(runtimeText(section.railText, locale) || runtimeList(section.paragraphs, locale)[0] || "")}" data-rail-visual="${runtimeEscapeHtml(railVisuals[index] || article.heroClass)}" data-rail-image="${runtimeEscapeHtml(railImages[index] || "")}" data-rail-image-hidden="${railImageHidden[index] ? "true" : "false"}">
                  <h2>${runtimeEscapeHtml(runtimeText(section.heading, locale))}</h2>${renderSectionContent(section)}
                </section>`).join("")}
        </div>
      </div>
    </article>

    <section class="related section-pad" aria-labelledby="related-title">
      <div class="section-heading" data-reveal>
        <p class="kicker">Related</p>
        <h2 id="related-title">${runtimeEscapeHtml(runtimeLabels[locale].related)}</h2>
      </div>
      <div class="related-grid">
        ${relatedArticles.map((related) => `
              <a class="story-card" href="${runtimeArticleHref(related, locale)}" data-reveal data-action-card>
                ${runtimeImageBlock(related.heroClass, related.heroImage || "")}
                <div>
                  <p class="kicker">${runtimeEscapeHtml(runtimeCategoryLabel(related.category, locale))} / ${runtimeEscapeHtml(runtimeText(related.subcategory, locale))}</p>
                  <h3>${runtimeEscapeHtml(runtimeText(related.title, locale))}</h3>
                  <p>${runtimeEscapeHtml(runtimeText(related.excerpt, locale))}</p>
                </div>
              </a>`).join("")}
      </div>
    </section>`;
};

const renderRuntimeIssuePrototype = (issue: RuntimeIssueProject, locale: RuntimeLocale, variant: "home" | "collection" | "detail" = "detail"): string => {
  const coverImage = issue.coverImage || issue.features.find((feature) => feature.heroImage)?.heroImage || "";
  const coverVisual = issue.features.find((feature) => feature.heroImage === coverImage)?.heroClass || issue.features[0]?.heroClass || "image-material";

  return `<figure class="magazine-prototype magazine-prototype-${variant}" aria-label="${runtimeEscapeHtml(locale === "ko" ? `${issue.number} 잡지 프로토타입` : `${issue.number} magazine prototype`)}">
          <div class="magazine-prototype-stage">
            <div class="magazine-cover-stack">
              <div class="magazine-cover-sheet">
                ${runtimeImageBlock(coverVisual, coverImage)}
                <div class="magazine-cover-type">
                  <div class="magazine-cover-topline"><span>Habitus</span><small>${runtimeEscapeHtml(issue.number)}</small></div>
                  <div class="magazine-cover-title"><strong>${runtimeEscapeHtml(runtimeText(issue.title, locale))}</strong></div>
                  <em>${runtimeEscapeHtml(locale === "ko" ? "취향에 관하여" : "On Taste")}</em>
                </div>
              </div>
            </div>
          </div>
        </figure>`;
};

const renderRuntimeHabitusBoard = (locale: RuntimeLocale): string => `      <div class="habitus-board" data-reveal data-habitus-board tabindex="0" role="img" aria-label="${runtimeEscapeHtml(locale === "ko" ? "경험과 반복의 교집합에서 습관이 생기고 선택으로 이어지는 아비투스 도식" : "A habitus diagram where the overlap of experience and repetition forms habit and leads to choice")}">
        <svg class="habitus-system" viewBox="0 0 960 430" aria-hidden="true" focusable="false">
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
              <text x="${locale === "ko" ? 362 : 356}" y="150" class="is-experience-label">${runtimeEscapeHtml(locale === "ko" ? "경험" : "experience")}</text>
              <text x="${locale === "ko" ? 598 : 604}" y="150" class="is-repeat-label">${runtimeEscapeHtml(locale === "ko" ? "반복" : "repetition")}</text>
              <text x="480" y="150" class="is-habit">${runtimeEscapeHtml(locale === "ko" ? "습관" : "habit")}</text>
              <text x="480" y="376" class="is-choice">${runtimeEscapeHtml(locale === "ko" ? "선택" : "choice")}</text>
              <text x="480" y="410" class="habitus-choice-copy">${runtimeEscapeHtml(locale === "ko" ? "좋은 취향은 좋은 선택으로 이어집니다." : "Good taste leads to better choices.")}</text>
            </g>
          </g>
        </svg>
      </div>`;

const renderRuntimeHomePage = (data: RuntimeContentData, locale: RuntimeLocale): string => {
  const currentIssue = data.issueProjects[0];
  const selectedArticles = data.articles.slice(0, 5);
  const leadArticle = selectedArticles[0];
  const secondaryArticles = selectedArticles.slice(1, 5);
  const issueRows = (currentIssue?.features || []).map((feature, index) => `              <a class="home-index-row" href="${runtimeIssueHref(currentIssue, locale)}#issue-${runtimeEscapeHtml(feature.slug)}" data-scroll-motion>
                <span class="home-index-order">${String(index + 1).padStart(2, "0")}</span>
                <span class="home-index-copy">
                  <strong>${runtimeEscapeHtml(runtimeText(feature.title, locale))}</strong>
                  <span class="home-index-meta">${runtimeEscapeHtml(runtimeText(feature.role, locale))}</span>
                  <em>${runtimeEscapeHtml(runtimeText(feature.intro, locale))}</em>
                </span>
              </a>`).join("\n");
  const homeRecentLead = leadArticle ? `          <a class="home-recent-lead" href="${runtimeArticleHref(leadArticle, locale)}" data-reveal data-action-card>
            <span class="home-recent-visual" aria-hidden="true">${runtimeImageBlock(leadArticle.heroClass, leadArticle.heroImage || "")}</span>
            <span class="home-recent-copy">
              <small>${runtimeEscapeHtml(runtimeCategoryLabel(leadArticle.category, locale))} / ${runtimeEscapeHtml(runtimeFormatDate(leadArticle.date, locale))}</small>
              <strong>${runtimeEscapeHtml(runtimeText(leadArticle.title, locale))}</strong>
              <em>${runtimeEscapeHtml(runtimeText(leadArticle.excerpt, locale))}</em>
            </span>
          </a>` : "";
  const storyRows = secondaryArticles.map((article, index) => `              <a class="home-story-line" href="${runtimeArticleHref(article, locale)}" data-reveal data-action-card>
                <span>${String(index + 2).padStart(2, "0")}</span>
                <strong>${runtimeEscapeHtml(runtimeText(article.title, locale))}</strong>
                <small>${runtimeEscapeHtml(runtimeCategoryLabel(article.category, locale))} / ${runtimeEscapeHtml(runtimeFormatDate(article.date, locale))}</small>
                <em>${runtimeEscapeHtml(runtimeText(article.excerpt, locale))}</em>
              </a>`).join("\n");

  if (!currentIssue) {
    return "";
  }

  runtimeSetDocumentMeta("Habitus", locale === "ko" ? "취향에 관하여" : "On Taste");

  return `
    <section class="cover section-pad" aria-labelledby="hero-title" data-scroll-section>
      <div class="cover-grid home-cover-grid">
        <div class="cover-copy" data-reveal>
          <div class="cover-edition" aria-label="Publication context"><span>${runtimeEscapeHtml(`${currentIssue.number} · ${runtimeText(currentIssue.date, locale)}`)}</span></div>
          <p class="kicker">Current Issue</p>
          <h1 id="hero-title">${runtimeEscapeHtml(runtimeText(currentIssue.title, locale))}</h1>
          <p class="cover-deck">${runtimeEscapeHtml(runtimeText(currentIssue.deck, locale))}</p>
          <a class="home-issue-link" href="${runtimeIssueHref(currentIssue, locale)}"><span>${runtimeEscapeHtml(locale === "ko" ? "최신 이슈 읽기" : "Read Latest Issue")}</span><small>${runtimeEscapeHtml(currentIssue.number)}</small></a>
        </div>

        <section class="home-issue-index" aria-labelledby="home-issue-index-title" data-reveal data-scroll-motion>
          <header class="home-index-headline"><p class="kicker" id="home-issue-index-title">Issue Index</p></header>
          <div class="home-index-list" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 읽기 순서" : "Issue reading order")}">
${issueRows}
          </div>
        </section>
      </div>
    </section>

    <section class="story-river home-stories section-pad" id="features" aria-labelledby="features-title" data-scroll-section>
      <div class="section-head" data-reveal>
        <p class="kicker">${runtimeEscapeHtml(runtimeLabels[locale].selectedStories)}</p>
        <h2 id="features-title">${runtimeEscapeHtml(locale === "ko" ? "최근 글" : "Recent Stories")}</h2>
      </div>
      <div class="home-recent-spread">
${homeRecentLead}
        <div class="home-story-index-list">
${storyRows}
          <a class="home-story-more" href="${runtimeArchiveHref(locale)}" data-reveal><span>${runtimeEscapeHtml(locale === "ko" ? "전체 보기" : "View all")}</span><strong>${runtimeEscapeHtml(runtimeLabels[locale].fullArchive)}</strong></a>
        </div>
      </div>
    </section>

    <section class="home-habitus section-pad" id="notes" aria-labelledby="notes-title" data-scroll-section>
      <div class="habitus-copy" data-reveal>
        <h2 id="notes-title">${runtimeEscapeHtml(locale === "ko" ? "Habitus, 취향에 관하여." : "Habitus, on taste.")}</h2>
        <p>${runtimeEscapeHtml(locale === "ko" ? "취향은 결과가 아니라 거르는 방식입니다. 경험과 반복이 만든 기준을 알면 무엇을 고를지보다 왜 고르는지가 먼저 보입니다." : "Taste is not the result but the way things are filtered. When the criteria shaped by experience and repetition are visible, the reason behind a choice becomes clearer.")}</p>
      </div>
${renderRuntimeHabitusBoard(locale)}
    </section>`;
};

const renderRuntimeIssueCollectionItems = (issues: RuntimeIssueProject[], locale: RuntimeLocale, offset = 0, selectedIssue?: RuntimeIssueProject): string => issues
  .map((issue, index) => {
    const absoluteIndex = offset + index;
    const isCurrent = selectedIssue ? runtimeIssueSlug(issue) === runtimeIssueSlug(selectedIssue) : false;
    const scenes = issue.features.slice(0, 3).map((feature, featureIndex) => `          <span>
            <small>${String(featureIndex + 1).padStart(2, "0")} / ${runtimeEscapeHtml(runtimeText(feature.role, locale))}</small>
            <strong>${runtimeEscapeHtml(runtimeText(feature.title, locale))}</strong>
          </span>`).join("\n");

    return `        <a class="issue-collection-item ${absoluteIndex === 0 ? "is-latest" : ""} ${isCurrent ? "is-current" : ""}" href="${runtimeIssueHref(issue, locale)}"${isCurrent ? " aria-current=\"page\"" : ""} data-reveal data-action-card>
          <div class="issue-collection-cover" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 커버" : "Issue cover")}">${renderRuntimeIssuePrototype(issue, locale, "collection")}</div>
          <div class="issue-collection-copy">
            <p class="kicker">${runtimeEscapeHtml(absoluteIndex === 0 ? (locale === "ko" ? "최신호" : "Latest issue") : (locale === "ko" ? "지난호" : "Past issue"))} / ${runtimeEscapeHtml(runtimeText(issue.date, locale))}</p>
            <div class="issue-collection-title"><span>${runtimeEscapeHtml(issue.number)}</span><h2>${runtimeEscapeHtml(runtimeText(issue.title, locale))}</h2></div>
            <p>${runtimeEscapeHtml(runtimeText(issue.deck, locale))}</p>
            <div class="issue-collection-meta"><span>${runtimeEscapeHtml(runtimeText(issue.format, locale))}</span><span>${runtimeEscapeHtml(runtimeText(issue.availability, locale))}</span><span>${issue.features.length} ${runtimeEscapeHtml(locale === "ko" ? "장면" : "scenes")}</span></div>
          </div>
          <div class="issue-collection-scenes" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 장면 요약" : "Issue scene summary")}">
${scenes}
          </div>
        </a>`;
  })
  .join("\n");

const renderRuntimeIssueCollectionPage = (issues: RuntimeIssueProject[], locale: RuntimeLocale, page = 1): string => {
  const latest = issues[0];
  const totalPages = runtimePageCount(issues.length);
  const currentPage = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages);
  const pagedIssues = issues.slice((currentPage - 1) * runtimePageSize, currentPage * runtimePageSize);

  if (!latest) {
    return "";
  }

  runtimeSetDocumentMeta("Issue Index | Habitus", locale === "ko" ? "아비투스의 모든 이슈를 모아둔 발행 인덱스입니다." : "An index of every edition published by Habitus.");

  return `
    <section class="issue-index-page section-pad" aria-labelledby="issue-index-title">
      <header class="issue-index-hero" data-reveal>
        <p class="kicker">Issues</p>
        <h1 id="issue-index-title">Issue Index</h1>
        <p>${runtimeEscapeHtml(locale === "ko" ? "발행된 이슈를 모았습니다. 최신호와 지난호를 한곳에서 봅니다." : "Latest and past issues in one place.")}</p>
        <a class="issue-index-latest" href="${runtimeIssueHref(latest, locale)}">${runtimeEscapeHtml(locale === "ko" ? "최신호 열기" : "Open latest issue")}</a>
      </header>
      <div class="issue-collection-list" aria-label="${runtimeEscapeHtml(locale === "ko" ? "전체 이슈" : "All issues")}">
${renderRuntimeIssueCollectionItems(pagedIssues, locale, (currentPage - 1) * runtimePageSize)}
      </div>${runtimePagination(currentPage, totalPages, (pageNumber) => runtimeIssueIndexHref(locale, pageNumber), locale)}
    </section>`;
};

const renderRuntimeIssuePage = (issues: RuntimeIssueProject[], issue: RuntimeIssueProject, locale: RuntimeLocale): string => {
  const issueIndex = issues.findIndex((item) => runtimeIssueSlug(item) === runtimeIssueSlug(issue));
  const issueRows = issue.features.map((feature, index) => `        <a class="issue-toc-row issue-feature-row" href="#issue-${runtimeEscapeHtml(feature.slug)}" data-reveal>
          <span class="issue-toc-no">${String(index + 1).padStart(2, "0")}</span>
          <span class="issue-toc-meta">${runtimeEscapeHtml(runtimeText(feature.role, locale))}</span>
          <strong>${runtimeEscapeHtml(runtimeText(feature.title, locale))}</strong>
          <em>${runtimeEscapeHtml(runtimeText(feature.excerpt, locale))}</em>
        </a>`).join("\n");
  const issueChapters = issue.features.map((feature, index) => `        <section class="issue-chapter" id="issue-${runtimeEscapeHtml(feature.slug)}" aria-labelledby="issue-chapter-${runtimeEscapeHtml(feature.slug)}" data-reveal>
          <div class="issue-chapter-media">
            ${runtimeImageBlock(feature.heroClass, feature.heroImage || "", feature.heroImage ? "" : `data-visual-cycle role="button" tabindex="0" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 장면 비주얼 바꾸기" : "Cycle issue scene visual")}"`)}
            <p>${runtimeEscapeHtml(runtimeText(feature.credit, locale))} / ${runtimeEscapeHtml(runtimeText(feature.location, locale))}</p>
          </div>
          <div class="issue-chapter-copy">
            <p class="kicker">${runtimeEscapeHtml(`${String(index + 1).padStart(2, "0")} / ${runtimeText(feature.role, locale)}`)}</p>
            <h2 id="issue-chapter-${runtimeEscapeHtml(feature.slug)}">${runtimeEscapeHtml(runtimeText(feature.title, locale))}</h2>
            <p class="issue-chapter-intro">${runtimeEscapeHtml(runtimeText(feature.intro, locale))}</p>
            ${runtimeList(feature.body, locale).map((paragraph) => `<p>${runtimeEscapeHtml(paragraph)}</p>`).join("\n            ")}
          </div>
        </section>`).join("\n");
  const credits = issue.credits.map((credit) => `        <span><small>${runtimeEscapeHtml(runtimeText(credit.label, locale))}</small><strong>${runtimeEscapeHtml(runtimeText(credit.value, locale))}</strong></span>`).join("\n");

  runtimeSetDocumentMeta(`${issue.number} · ${runtimeText(issue.title, locale)} | Habitus`, runtimeText(issue.deck, locale));

  return `
    <section class="issue-page issue-project-page section-pad" aria-labelledby="issue-page-title">
      <header class="issue-project-hero" data-reveal>
        <div class="issue-project-title">
          <p class="kicker">${runtimeEscapeHtml(issueIndex <= 0 ? "Latest Magazine Issue" : "Magazine Issue")}</p>
          <span class="issue-project-no">${runtimeEscapeHtml(issue.number)}</span>
          <h1 id="issue-page-title">${runtimeEscapeHtml(runtimeText(issue.title, locale))}</h1>
          <p>${runtimeEscapeHtml(runtimeText(issue.subtitle, locale))}</p>
        </div>
        <aside class="issue-cover-card" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 커버" : "Issue cover")}">${renderRuntimeIssuePrototype(issue, locale, "detail")}</aside>
      </header>
      <div class="issue-project-ledger" data-reveal>
        <span><small>${runtimeEscapeHtml(locale === "ko" ? "발행" : "Published")}</small><strong>${runtimeEscapeHtml(runtimeText(issue.date, locale))}</strong></span>
        <span><small>${runtimeEscapeHtml(locale === "ko" ? "형식" : "Format")}</small><strong>${runtimeEscapeHtml(runtimeText(issue.format, locale))}</strong></span>
        <span><small>${runtimeEscapeHtml(locale === "ko" ? "상태" : "Access")}</small><strong>${runtimeEscapeHtml(runtimeText(issue.availability, locale))}</strong></span>
      </div>
      <section class="issue-editorial-note" aria-label="${runtimeEscapeHtml(locale === "ko" ? "편집 노트" : "Editor's note")}" data-reveal>
        <div><p class="kicker">Editor's Note</p><h2>${runtimeEscapeHtml(locale === "ko" ? "이 호를 여는 편집 노트" : "The editor's note for this edition")}</h2></div>
        <div class="issue-editorial-copy"><p>${runtimeEscapeHtml(runtimeText(issue.deck, locale))}</p><p>${runtimeEscapeHtml(runtimeText(issue.editorNote, locale))}</p></div>
      </section>
      <section class="issue-contents" aria-labelledby="issue-contents-title">
        <div class="issue-section-heading" data-reveal><p class="kicker">Contents</p><h2 id="issue-contents-title">${runtimeEscapeHtml(locale === "ko" ? "이 호의 장면" : "Scenes in this issue")}</h2></div>
        <div class="issue-toc" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 목차" : "Issue table of contents")}">
${issueRows}
        </div>
      </section>
      <div class="issue-chapters" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 소개" : "Issue introductions")}">
${issueChapters}
      </div>
      <div class="issue-credit-grid" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 크레딧" : "Issue credits")}" data-reveal>
${credits}
      </div>
      <nav class="issue-project-actions" aria-label="${runtimeEscapeHtml(locale === "ko" ? "이슈 탐색" : "Issue navigation")}" data-reveal><a href="${runtimeHref("/issues/", locale)}">Issue Index</a></nav>
    </section>`;
};

const runtimeArchiveRoute = (path: string): { selectedCategory?: string; selectedSubcategory?: string; page: number } | null => {
  const parts = path.split("/").filter(Boolean);

  if (parts[0] !== "archive") {
    return null;
  }

  if (parts.length === 1) {
    return { page: 1 };
  }

  if (parts[1] === "page") {
    return { page: Number(parts[2]) || 1 };
  }

  if (parts[2] === "page") {
    return { selectedCategory: parts[1], page: Number(parts[3]) || 1 };
  }

  if (parts[3] === "page") {
    return { selectedCategory: parts[1], selectedSubcategory: parts[2], page: Number(parts[4]) || 1 };
  }

  return { selectedCategory: parts[1], selectedSubcategory: parts[2], page: 1 };
};

const runtimeIssuesRoutePage = (path: string): number | null => {
  const match = /^\/issues(?:\/page\/(\d+))?$/.exec(path);
  return match ? Number(match[1]) || 1 : null;
};

const runtimeRenderForPath = (data: RuntimeContentData, path: string, locale: RuntimeLocale): string | null => {
  if (path === "/") {
    return renderRuntimeHomePage(data, locale);
  }

  const archiveRoute = runtimeArchiveRoute(path);
  if (archiveRoute) {
    if (archiveRoute.selectedCategory && !runtimeCategory(archiveRoute.selectedCategory)) {
      return null;
    }

    if (archiveRoute.selectedCategory && archiveRoute.selectedSubcategory) {
      const category = runtimeCategory(archiveRoute.selectedCategory);
      if (!category?.subcategories.some((subcategory) => subcategory.key === archiveRoute.selectedSubcategory)) {
        return null;
      }
    }

    return renderRuntimeArchivePage(data.articles, locale, archiveRoute.selectedCategory, archiveRoute.selectedSubcategory, archiveRoute.page);
  }

  const issuePage = runtimeIssuesRoutePage(path);
  if (issuePage !== null) {
    return renderRuntimeIssueCollectionPage(data.issueProjects, locale, issuePage);
  }

  const issueSlugMatch = /^\/issues\/([^/]+)$/.exec(path);
  if (issueSlugMatch) {
    const issue = data.issueProjects.find((item) => runtimeIssueSlug(item) === issueSlugMatch[1]);
    return issue ? renderRuntimeIssuePage(data.issueProjects, issue, locale) : null;
  }

  const articleSlugMatch = /^\/articles\/([^/]+)$/.exec(path);
  if (articleSlugMatch) {
    const article = data.articles.find((item) => item.slug === articleSlugMatch[1]);
    return article ? renderRuntimeArticlePage(article, data.articles.filter((item) => item.slug !== article.slug).slice(0, 3), locale) : null;
  }

  return null;
};

const runtimeInitGalleries = (root: ParentNode): void => {
  root.querySelectorAll<HTMLElement>("[data-gallery]").forEach((gallery) => {
    if (gallery.dataset.runtimeGalleryReady === "true") {
      return;
    }

    gallery.dataset.runtimeGalleryReady = "true";
    const items = Array.from(gallery.querySelectorAll<HTMLElement>("[data-gallery-item]"));
    const count = gallery.querySelector<HTMLElement>("[data-gallery-count]");
    const frame = gallery.querySelector<HTMLElement>(".article-gallery-frame");

    if (items.length <= 1) {
      return;
    }

    const setGalleryIndex = (index: number): void => {
      const nextIndex = (index + items.length) % items.length;
      gallery.dataset.galleryIndex = String(nextIndex);
      items.forEach((item, itemIndex) => {
        const isActive = itemIndex === nextIndex;
        item.classList.toggle("is-active", isActive);
        item.toggleAttribute("hidden", !isActive);
      });

      if (count) {
        count.textContent = `${nextIndex + 1}/${items.length}`;
      }
    };

    gallery.querySelector<HTMLButtonElement>("[data-gallery-prev]")?.addEventListener("click", () => setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) - 1));
    gallery.querySelector<HTMLButtonElement>("[data-gallery-next]")?.addEventListener("click", () => setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1));
    frame?.addEventListener("click", (event) => {
      if (!(event.target instanceof HTMLElement) || event.target.closest("[data-gallery-prev], [data-gallery-next]")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1);
    });
    frame?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1);
    });
    setGalleryIndex(0);
  });
};

const runtimeInitArticleRail = (root: ParentNode): void => {
  runtimeArticleRailCleanup?.();
  runtimeArticleRailCleanup = null;

  const articleRail = root.querySelector<HTMLElement>("[data-article-rail]");
  const articleRailNo = root.querySelector<HTMLElement>("[data-article-rail-no]");
  const articleRailTitle = root.querySelector<HTMLElement>("[data-article-rail-title]");
  const articleRailText = root.querySelector<HTMLElement>("[data-article-rail-text]");
  const articleRailVisual = root.querySelector<HTMLElement>("[data-article-rail-visual]");
  const articleSections = root.querySelectorAll<HTMLElement>("[data-article-section]");

  if (!articleRail || !articleRailNo || !articleRailTitle || !articleRailText || articleSections.length === 0) {
    return;
  }

  let activeSection: HTMLElement | null = null;
  let frame = 0;
  const setRail = (section: HTMLElement): void => {
    if (activeSection === section) {
      return;
    }

    activeSection = section;
    articleRailNo.textContent = section.dataset.railNo || "";
    articleRailTitle.textContent = section.dataset.railTitle || "";
    articleRailText.textContent = section.dataset.railText || "";
    articleRail.classList.toggle("is-rail-image-hidden", section.dataset.railImageHidden === "true");

    if (articleRailVisual && section.dataset.railVisual) {
      setImageBlockVisual(articleRailVisual, section.dataset.railVisual, section.dataset.railImage || "");
    }

    articleSections.forEach((articleSection) => articleSection.classList.toggle("is-active-section", articleSection === section));
  };
  const updateRail = (): void => {
    frame = 0;
    const activationPoint = Math.max(170, window.innerHeight * (window.innerWidth <= 960 ? 0.52 : 0.38));
    let nextSection = articleSections[0];

    articleSections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationPoint) {
        nextSection = section;
      }
    });

    setRail(nextSection);
  };
  const requestUpdate = (): void => {
    if (frame === 0) {
      frame = window.requestAnimationFrame(updateRail);
    }
  };

  updateRail();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  runtimeArticleRailCleanup = () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    if (frame !== 0) {
      window.cancelAnimationFrame(frame);
    }
  };
};

const runtimeAfterRender = (data: RuntimeContentData, root: HTMLElement, locale: RuntimeLocale): void => {
  initRevealItems(root, true);
  runtimeInitGalleries(root);
  runtimeInitArticleRail(root);
  initActionSurfaces(root);
  initHabitusBoards(root);
  runtimeInitArchiveInteractions(root, locale);
  runtimeInitScrollSections(root);
  updateScrollState();

  const latestIssue = data.issueProjects[0];
  if (latestIssue) {
    document.querySelectorAll<HTMLAnchorElement>(".issue-submenu a").forEach((link) => {
      link.href = runtimeIssueHref(latestIssue, locale);
      const label = link.querySelector("span");
      if (label) {
        label.textContent = `${latestIssue.number} · ${runtimeText(latestIssue.title, locale)}`;
      }
    });
  }

  document.querySelectorAll<HTMLSelectElement>("[data-navigation-select]").forEach((select) => {
    if (select.dataset.runtimeNavigationReady === "true") {
      return;
    }

    select.dataset.runtimeNavigationReady = "true";
    select.addEventListener("change", () => {
      if (select.value && select.value !== window.location.pathname) {
        window.location.href = select.value;
      }
    });
  });
};

const hydrateRuntimeContent = async (): Promise<void> => {
  if (document.querySelector("[data-write-editor]") || !document.querySelector("main")) {
    return;
  }

  const snapshot = await fetchSupabaseSnapshot().catch(() => null);
  const data = runtimeSnapshotData(snapshot);

  if (!data) {
    return;
  }

  const locale = runtimeLocale();
  const path = runtimePath();
  const renderedBody = runtimeRenderForPath(data, path, locale);
  const main = document.querySelector<HTMLElement>("main");

  if (!renderedBody || !main) {
    return;
  }

  const nextContentVersion = runtimeContentVersion(data, path);
  const nextBodyVersion = contentHashClient(renderedBody);

  if (main.dataset.runtimeContentVersion === nextContentVersion || main.dataset.runtimeBodyVersion === nextBodyVersion) {
    document.documentElement.dataset.runtimeContent = "supabase";
    main.dataset.runtimeContentVersion = nextContentVersion;
    main.dataset.runtimeBodyVersion = nextBodyVersion;
    return;
  }

  main.innerHTML = renderedBody;
  main.dataset.runtimeContentVersion = nextContentVersion;
  main.dataset.runtimeBodyVersion = nextBodyVersion;
  document.documentElement.dataset.runtimeContent = "supabase";
  runtimeAfterRender(data, main, locale);
};

const setImageBlockVisual = (element: HTMLElement, visualClass: string, imageUrl = ""): void => {
  const existingImage = element.querySelector<HTMLImageElement>("[data-image-source]");
  element.classList.remove(...imageClasses);
  element.classList.toggle("has-custom-image", imageUrl.length > 0);

  if (imageUrl.length > 0) {
    element.style.backgroundImage = "";
    const image = existingImage || document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    image.dataset.imageSource = "";

    if (!existingImage) {
      element.append(image);
    }

    return;
  }

  element.style.backgroundImage = "";
  existingImage?.remove();
  element.classList.add(visualClass || "image-material");
};

const currentImageClass = (element: HTMLElement): string =>
  imageClasses.find((imageClass) => element.classList.contains(imageClass)) || imageClasses[0];

const nextImageClass = (currentClass: string, direction: number): string => {
  const currentIndex = imageClasses.indexOf(currentClass);
  const nextIndex = (currentIndex + direction + imageClasses.length) % imageClasses.length;

  return imageClasses[nextIndex] || imageClasses[0];
};

const clickDirection = (event: MouseEvent, element: HTMLElement): number => {
  const rect = element.getBoundingClientRect();

  return event.clientX < rect.left + rect.width / 2 ? -1 : 1;
};

const cycleGeneratedVisual = (element: HTMLElement, direction: number): string => {
  const nextClass = nextImageClass(currentImageClass(element), direction);
  setImageBlockVisual(element, nextClass);

  return nextClass;
};

document.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement) || target.closest("[data-write-editor]")) {
    return;
  }

  const visual = target.closest<HTMLElement>("[data-visual-cycle]");

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

document.querySelectorAll<HTMLElement>("[data-gallery]").forEach((gallery) => {
  const items = Array.from(gallery.querySelectorAll<HTMLElement>("[data-gallery-item]"));
  const count = gallery.querySelector<HTMLElement>("[data-gallery-count]");
  const frame = gallery.querySelector<HTMLElement>(".article-gallery-frame");

  if (items.length <= 1) {
    return;
  }

  const setGalleryIndex = (index: number): void => {
    const nextIndex = (index + items.length) % items.length;
    gallery.dataset.galleryIndex = String(nextIndex);
    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === nextIndex;
      item.classList.toggle("is-active", isActive);
      item.toggleAttribute("hidden", !isActive);
    });

    if (count) {
      count.textContent = `${nextIndex + 1}/${items.length}`;
    }
  };

  gallery.querySelector<HTMLButtonElement>("[data-gallery-prev]")?.addEventListener("click", () => {
    setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) - 1);
  });

  gallery.querySelector<HTMLButtonElement>("[data-gallery-next]")?.addEventListener("click", () => {
    setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1);
  });

  gallery.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement) || target.closest("[data-gallery-prev], [data-gallery-next]") || !target.closest(".article-gallery-frame")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1);
  });

  frame?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setGalleryIndex(Number(gallery.dataset.galleryIndex || 0) + 1);
  });
});

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

document.querySelectorAll<HTMLElement>("[data-issue-spread]").forEach((spread) => {
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-issue-spread-row]"));
  const role = spread.querySelector<HTMLElement>("[data-issue-spread-role]");
  const title = spread.querySelector<HTMLElement>("[data-issue-spread-title]");
  const intro = spread.querySelector<HTMLElement>("[data-issue-spread-intro]");
  const copy = spread.querySelector<HTMLElement>("[data-issue-spread-copy]");
  const deck = spread.querySelector<HTMLElement>("[data-issue-spread-deck]");
  const mainImage = spread.querySelector<HTMLElement>("[data-issue-spread-main-image]");
  const mainNo = spread.querySelector<HTMLElement>("[data-issue-spread-main-no]");
  const imageSlots = Array.from(spread.querySelectorAll<HTMLElement>("[data-issue-spread-slot]"));

  if (rows.length === 0 || !role || !title || !intro || !copy || !deck || !mainImage || !mainNo) {
    return;
  }

  const copyParagraphs = Array.from(copy.querySelectorAll<HTMLParagraphElement>("p"));
  const setSpreadFromRow = (row: HTMLElement): void => {
    rows.forEach((item) => item.classList.toggle("is-active", item === row));
    role.textContent = row.dataset.spreadRole || role.textContent;
    title.textContent = row.dataset.spreadTitle || title.textContent;
    intro.textContent = row.dataset.spreadIntro || intro.textContent;
    deck.textContent = row.dataset.spreadDeck || deck.textContent;
    mainNo.textContent = row.dataset.spreadNo || mainNo.textContent;
    setImageBlockVisual(mainImage, row.dataset.spreadVisual || "image-material", row.dataset.spreadImage || "");

    imageSlots.forEach((slot, index) => {
      const slotKey = `spreadSlot${index + 1}`;
      const slotImage = slot.querySelector<HTMLElement>("[data-issue-spread-slot-image]");
      const slotNo = slot.querySelector<HTMLElement>("[data-issue-spread-slot-no]");
      const slotVisual = row.dataset[`${slotKey}Visual`];

      if (slotImage && slotVisual) {
        setImageBlockVisual(slotImage, slotVisual, row.dataset[`${slotKey}Image`] || "");
      }

      if (slotNo && row.dataset[`${slotKey}No`]) {
        slotNo.textContent = row.dataset[`${slotKey}No`] || slotNo.textContent;
      }

      slot.classList.toggle("is-current", index === 0);
    });

    copyParagraphs.forEach((paragraph, index) => {
      const nextText = index === 0 ? row.dataset.spreadCopyA : row.dataset.spreadCopyB;
      paragraph.textContent = nextText || "";
    });

    spread.classList.add("is-paging");
    animateTextSwap([role, title, intro, deck, ...copyParagraphs, ...imageSlots]);
  };

  rows.forEach((row) => {
    row.addEventListener("pointerenter", () => setSpreadFromRow(row));
    row.addEventListener("focus", () => setSpreadFromRow(row));
  });
});

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
  let activeSubnavItem: HTMLElement | null = null;

  const clearNavCloseTimer = (): void => {
    if (navCloseTimer !== 0) {
      window.clearTimeout(navCloseTimer);
      navCloseTimer = 0;
    }
  };

  const closeSubnav = (): void => {
    clearNavCloseTimer();
    activeSubnavItem = null;
    document.documentElement.style.setProperty("--active-nav-height", "0px");
    header?.classList.remove("is-nav-expanded");
    desktopNav.classList.remove("is-submenu-active");
    desktopNavItems.forEach((item) => item.classList.remove("is-submenu-open"));
  };

  const openSubnav = (item: HTMLElement): void => {
    const submenu = item.querySelector<HTMLElement>(".nav-submenu");
    const submenuHeight = submenu ? Math.ceil(submenu.getBoundingClientRect().height) : 0;

    clearNavCloseTimer();
    activeSubnavItem = item;
    document.documentElement.style.setProperty("--active-nav-height", `${submenuHeight}px`);
    header?.classList.add("is-nav-expanded");
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

const writer = document.querySelector<HTMLElement>("[data-write-editor]");

if (writer) {
  type RailMode = "default" | "image" | "text";
  type WriteLocale = "ko" | "en";
  type AdminLocalizedText = { ko: string; en: string };
  type AdminLocalizedList = { ko: string[]; en: string[] };
  type AdminBlockImage = {
    imageClass?: string;
    image?: string;
  };
  type AdminSectionBlock =
    | {
      type: "paragraph";
      text: AdminLocalizedText;
    }
    | {
      type: "quote";
      text: AdminLocalizedText;
    }
    | {
      type: "gallery";
      images: AdminBlockImage[];
      layout?: GalleryLayout;
      caption?: AdminLocalizedText;
    };
  type AdminSection = {
    heading: AdminLocalizedText;
    paragraphs: AdminLocalizedList;
    blocks?: AdminSectionBlock[];
    railTitle?: AdminLocalizedText;
    railText?: AdminLocalizedText;
    railClass?: string;
    railImage?: string;
    hideRailImage?: boolean;
    sectionImageClass?: string;
    sectionImage?: string;
    sectionImageCaption?: AdminLocalizedText;
    hideSectionImage?: boolean;
  };
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
    railClass?: string;
    railImage?: string;
    hideRailImage?: boolean;
    railTitle?: AdminLocalizedText;
    railText?: AdminLocalizedText;
    sections: AdminSection[];
  };

  type AdminIssueCredit = {
    label: AdminLocalizedText;
    value: AdminLocalizedText;
  };

  type AdminIssueFeature = {
    slug: string;
    role: AdminLocalizedText;
    title: AdminLocalizedText;
    intro: AdminLocalizedText;
    excerpt: AdminLocalizedText;
    body: AdminLocalizedList;
    credit: AdminLocalizedText;
    location: AdminLocalizedText;
    readTime: AdminLocalizedText;
    heroClass: string;
    heroImage?: string;
  };

  type AdminIssueProject = {
    number: string;
    title: AdminLocalizedText;
    subtitle: AdminLocalizedText;
    deck: AdminLocalizedText;
    date: AdminLocalizedText;
    format: AdminLocalizedText;
    availability: AdminLocalizedText;
    coverCredit: AdminLocalizedText;
    coverImage?: string;
    editorNote: AdminLocalizedText;
    credits: AdminIssueCredit[];
    features: AdminIssueFeature[];
  };

  const storageKey = writer.dataset.writeStorageKey || "the-thing-admin-articles";
  const issueStorageKey = `${storageKey}-issue`;
  let sourceVersion = writer.dataset.writeContentVersion || "";
  const articleSourceVersionKey = `${storageKey}-source-version`;
  const issueSourceVersionKey = `${issueStorageKey}-source-version`;
  const modeStorageKey = `${storageKey}-mode`;
  const localeStorageKey = `${storageKey}-locale`;
  const authKey = `${storageKey}-auth`;
  const authPasswordKey = `${storageKey}-auth-password`;
  const adminPassword = writer.dataset.adminPassword || "promise";
  const lock = writer.querySelector<HTMLElement>("[data-admin-lock]");
  const loginForm = writer.querySelector<HTMLFormElement>("[data-admin-login]");
  const loginInput = writer.querySelector<HTMLInputElement>("[data-admin-password-input]");
  const loginError = writer.querySelector<HTMLElement>("[data-admin-login-error]");
  const articleData = writer.querySelector<HTMLScriptElement>("[data-write-articles]");
  const issueData = writer.querySelector<HTMLScriptElement>("[data-write-issue]");
  const issueList = writer.querySelector<HTMLElement>("[data-write-issue-list]");
  const issueCount = writer.querySelector<HTMLElement>("[data-write-issue-count]");
  const issueSummaryTitle = writer.querySelector<HTMLElement>("[data-write-issue-summary-title]");
  const issueSummarySubtitle = writer.querySelector<HTMLElement>("[data-write-issue-summary-subtitle]");
  const issueSummaryMeta = writer.querySelector<HTMLElement>("[data-write-issue-summary-meta]");
  const adminList = writer.querySelector<HTMLElement>("[data-admin-list]");
  const adminFilters = writer.querySelector<HTMLElement>("[data-admin-filters]");
  const adminFilterSelect = writer.querySelector<HTMLSelectElement>("[data-admin-filter-select]");
  const adminSearchInput = writer.querySelector<HTMLInputElement>("[data-admin-search-input]");
  const adminCount = writer.querySelector<HTMLElement>("[data-admin-count]");
  const currentTitle = writer.querySelector<HTMLElement>("[data-admin-current-title]");
  const articleSaveButton = writer.querySelector<HTMLButtonElement>("[data-admin-save-file]");
  const issueSaveButton = writer.querySelector<HTMLButtonElement>("[data-write-issue-save]");
  const outputArea = writer.querySelector<HTMLTextAreaElement>("[data-write-output]");
  const status = writer.querySelector<HTMLElement>("[data-write-status]");
  const modeButtons = writer.querySelectorAll<HTMLButtonElement>("[data-write-mode-button]");
  const localeButtons = writer.querySelectorAll<HTMLButtonElement>("[data-write-locale-button]");
  const activeLocaleLabels = writer.querySelectorAll<HTMLElement>("[data-write-active-locale]");
  const activeLanguageLabels = writer.querySelectorAll<HTMLElement>("[data-write-active-language]");
  const categorySelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="category"]');
  const subcategorySelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="subcategory"]');
  const railModeSelect = writer.querySelector<HTMLSelectElement>('[data-write-meta="railMode"]');
  const imageUrlField = writer.querySelector<HTMLElement>(".writer-image-url-field");
  const heroShell = writer.querySelector<HTMLElement>("[data-write-hero-shell]");
  const heroPreview = writer.querySelector<HTMLElement>("[data-write-hero-preview]");
  const rail = writer.querySelector<HTMLElement>("[data-write-rail]");
  const kicker = writer.querySelector<HTMLElement>("[data-write-kicker]");
  const issueEditor = writer.querySelector<HTMLElement>("[data-write-issue-editor]");
  const issueStatus = writer.querySelector<HTMLElement>("[data-write-issue-status]");
  const issueTitle = writer.querySelector<HTMLElement>("[data-write-issue-title]");
  const issueFeatures = writer.querySelector<HTMLElement>("[data-write-issue-features]");
  const issueCredits = writer.querySelector<HTMLElement>("[data-write-issue-credits]");
  const issueOutput = writer.querySelector<HTMLTextAreaElement>("[data-write-issue-output]");
  let saveTimer = 0;
  let issueSaveTimer = 0;
  let currentIndex = 0;
  let currentIssueIndex = 0;
  let activeCategoryFilter = "all";
  let activeArticleSearch = "";
  let activeWriteBlock: HTMLElement | null = null;
  const storedWriteLocale = window.localStorage.getItem(localeStorageKey);
  let activeWriteLocale: WriteLocale = storedWriteLocale === "ko" || storedWriteLocale === "en"
    ? storedWriteLocale
    : document.documentElement.lang === "en" ? "en" : "ko";
  const activeBlockTools = document.createElement("div");

  activeBlockTools.className = "writer-block-tools";
  activeBlockTools.contentEditable = "false";
  [
    ["문단", "writeAddParagraph"],
    ["인용문", "writeAddQuote"],
    ["갤러리", "writeAddGallery"],
    ["다음 섹션", "writeAddSectionAfter"],
    ["섹션 삭제", "writeRemoveSection"]
  ].forEach(([label, key]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset[key] = "";
    button.textContent = label;
    activeBlockTools.append(button);
  });

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

  const setIssueStatus = (message: string): void => {
    if (issueStatus) {
      issueStatus.textContent = message;
    }
  };

  const setSaveButtonState = (button: HTMLButtonElement | null, state: "idle" | "saving" | "done" | "error"): void => {
    if (!button) {
      return;
    }

    button.dataset.idleText ||= button.textContent?.trim() || "저장";
    button.classList.remove("is-saving", "is-save-done", "is-save-error", "is-pressed");

    if (state === "idle") {
      button.disabled = false;
      button.textContent = button.dataset.idleText || "저장";
      return;
    }

    button.disabled = state === "saving";
    button.classList.add(state === "saving" ? "is-saving" : state === "done" ? "is-save-done" : "is-save-error", "is-pressed");
    button.textContent = state === "saving"
      ? activeWriteLocale === "ko" ? "저장 중" : "Saving"
      : state === "done"
        ? activeWriteLocale === "ko" ? "저장됨" : "Saved"
        : activeWriteLocale === "ko" ? "실패" : "Failed";

    if (state !== "saving") {
      window.setTimeout(() => setSaveButtonState(button, "idle"), 1100);
    }
  };

  const setWriteMode = (mode: "article" | "issue"): void => {
    writer.dataset.writeMode = mode;
    window.localStorage.setItem(modeStorageKey, mode);
    modeButtons.forEach((button) => {
      const isActive = button.dataset.writeModeButton === mode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const localeLabel = (locale: WriteLocale): string => locale === "ko" ? "KR" : "EN";
  const languageName = (locale: WriteLocale): string => locale === "ko" ? "한국어" : "English";

  const updateLocaleControls = (): void => {
    writer.dataset.writeLocale = activeWriteLocale;
    window.localStorage.setItem(localeStorageKey, activeWriteLocale);

    localeButtons.forEach((button) => {
      const isActive = button.dataset.writeLocaleButton === activeWriteLocale;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    activeLocaleLabels.forEach((label) => {
      label.textContent = localeLabel(activeWriteLocale);
    });

    activeLanguageLabels.forEach((label) => {
      label.textContent = languageName(activeWriteLocale);
    });
  };

  const localizedText = (base: AdminLocalizedText, value: string): AdminLocalizedText => ({
    ...base,
    [activeWriteLocale]: value || base[activeWriteLocale] || ""
  });

  const localizedList = (base: AdminLocalizedList, value: string[]): AdminLocalizedList => ({
    ...base,
    [activeWriteLocale]: value.length > 0 ? value : base[activeWriteLocale] || []
  });

  const activeText = (value: AdminLocalizedText | undefined): string => value?.[activeWriteLocale] || "";
  const activeList = (value: AdminLocalizedList | undefined): string[] => value?.[activeWriteLocale] || [];

  const escapeHtmlClient = (value: string): string => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const linesFromTextarea = (value: string): string[] =>
    value.split(/\n+/).map((line) => line.trim()).filter(Boolean);

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

  const fallbackIssueFeature = (): AdminIssueFeature => ({
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

  const fallbackIssue = (): AdminIssueProject => ({
    number: "No. 01",
    title: { ko: "Screen of Things", en: "Screen of Things" },
    subtitle: { ko: "이슈 부제를 작성합니다.", en: "Write the issue subtitle." },
    deck: { ko: "이슈 덱을 작성합니다.", en: "Write the issue deck." },
    date: { ko: "2026년 5월", en: "May 2026" },
    format: { ko: "온라인 에디션", en: "Online edition" },
    availability: { ko: "오픈 액세스", en: "Open access" },
    coverCredit: { ko: "커버 크레딧", en: "Cover credit" },
    editorNote: { ko: "에디터 노트를 작성합니다.", en: "Write the editor's note." },
    credits: [{ label: { ko: "편집", en: "Editor" }, value: { ko: "아비투스 편집부", en: "Habitus Editorial Desk" } }],
    features: [fallbackIssueFeature()]
  });

  const normalizeIssueFeature = (feature: Partial<AdminIssueFeature>): AdminIssueFeature => {
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
      heroClass: feature.heroClass || fallback.heroClass,
      heroImage: feature.heroImage || fallback.heroImage
    };
  };

  const normalizeIssue = (issue: Partial<AdminIssueProject>): AdminIssueProject => {
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
      coverImage: issue.coverImage || fallback.coverImage,
      editorNote: { ...fallback.editorNote, ...issue.editorNote },
      credits: (issue.credits && issue.credits.length > 0 ? issue.credits : fallback.credits).map((credit) => ({
        label: { ko: credit.label?.ko || "", en: credit.label?.en || "" },
        value: { ko: credit.value?.ko || "", en: credit.value?.en || "" }
      })),
      features: (issue.features && issue.features.length > 0 ? issue.features : fallback.features).map(normalizeIssueFeature)
    };
  };

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

  const blankLocalizedText = (): AdminLocalizedText => ({ ko: "", en: "" });

  const normalizeBlockText = (value: Partial<AdminLocalizedText> | undefined): AdminLocalizedText => ({
    ko: value?.ko || "",
    en: value?.en || ""
  });

  const normalizeSectionBlock = (block: AdminSectionBlock): AdminSectionBlock | null => {
    if (block.type === "gallery") {
      const images = (block.images || [])
        .map((image) => ({
          imageClass: image.imageClass || "image-material",
          image: image.image || ""
        }))
        .filter((image) => image.imageClass || image.image);

      return images.length > 0
        ? { type: "gallery", images, layout: normalizeGalleryLayout(block.layout, images.length), caption: normalizeBlockText(block.caption) }
        : null;
    }

    if (block.type === "quote") {
      return { type: "quote", text: normalizeBlockText(block.text) };
    }

    return { type: "paragraph", text: normalizeBlockText(block.text) };
  };

  const articleMatchesFilter = (article: AdminArticle): boolean =>
    activeCategoryFilter === "all" || article.category === activeCategoryFilter;

  const searchableArticleText = (article: AdminArticle): string => [
    article.slug,
    article.title.ko,
    article.title.en,
    article.deck.ko,
    article.deck.en,
    article.category,
    article.subcategoryKey,
    article.subcategory.ko,
    article.subcategory.en,
    ...(article.tags.ko || []),
    ...(article.tags.en || [])
  ].join(" ").toLowerCase();

  const articleMatchesAdminControls = (article: AdminArticle): boolean => {
    if (!articleMatchesFilter(article)) {
      return false;
    }

    const query = activeArticleSearch.trim().toLowerCase();
    return query === "" || searchableArticleText(article).includes(query);
  };

  const normalizeArticle = (article: Partial<AdminArticle>): AdminArticle => {
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
        const sectionBlocks = section.blocks
          ?.map(normalizeSectionBlock)
          .filter((block): block is AdminSectionBlock => Boolean(block));

        return {
          ...fallbackSection,
          ...section,
          heading,
          paragraphs,
          blocks: sectionBlocks && sectionBlocks.length > 0 ? sectionBlocks : undefined,
          railTitle: sectionRailTitle,
          railText: sectionRailText,
          railClass: section.railClass || article.railClass || article.heroClass || fallback.railClass,
          railImage: section.railImage || "",
          hideRailImage: Boolean(section.hideRailImage),
          sectionImageClass: section.sectionImageClass || undefined,
          sectionImage: section.sectionImage || "",
          sectionImageCaption,
          hideSectionImage: section.hideSectionImage === true || (!section.sectionImage && !section.sectionImageClass)
        };
      })
    };
  };

  const initialArticles = (): AdminArticle[] => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      if (sourceVersion && window.localStorage.getItem(articleSourceVersionKey) !== sourceVersion) {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(articleSourceVersionKey);
      } else {
        try {
          return (JSON.parse(stored) as AdminArticle[]).map(normalizeArticle);
        } catch {
          window.localStorage.removeItem(storageKey);
          window.localStorage.removeItem(articleSourceVersionKey);
        }
      }
    }

    try {
      return (JSON.parse(articleData?.textContent || "[]") as AdminArticle[]).map(normalizeArticle);
    } catch {
      return [fallbackArticle()];
    }
  };

  const normalizeIssueCollection = (value: unknown): AdminIssueProject[] => {
    const issues = Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? [value]
        : [];
    const normalizedIssues = issues.map((issue) => normalizeIssue(issue as Partial<AdminIssueProject>));

    return normalizedIssues.length > 0 ? normalizedIssues : [fallbackIssue()];
  };

  const initialIssues = (): AdminIssueProject[] => {
    const stored = window.localStorage.getItem(issueStorageKey);

    if (stored) {
      if (sourceVersion && window.localStorage.getItem(issueSourceVersionKey) !== sourceVersion) {
        window.localStorage.removeItem(issueStorageKey);
        window.localStorage.removeItem(issueSourceVersionKey);
      } else {
        try {
          return normalizeIssueCollection(JSON.parse(stored));
        } catch {
          window.localStorage.removeItem(issueStorageKey);
          window.localStorage.removeItem(issueSourceVersionKey);
        }
      }
    }

    try {
      return normalizeIssueCollection(JSON.parse(issueData?.textContent || "[]"));
    } catch {
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

  const unlockAdmin = (password?: string): void => {
    writer.classList.add("is-admin-unlocked");
    lock?.setAttribute("hidden", "true");
    window.sessionStorage.setItem(authKey, "true");

    if (password) {
      window.sessionStorage.setItem(authPasswordKey, password);
    }
  };

  if (window.sessionStorage.getItem(authKey) === "true") {
    unlockAdmin();
  } else {
    loginInput?.focus();
  }

  setWriteMode(window.localStorage.getItem(modeStorageKey) === "issue" ? "issue" : "article");

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (loginInput?.value === adminPassword) {
      unlockAdmin(loginInput.value);
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

  const issueField = (key: string): HTMLInputElement | HTMLTextAreaElement | null =>
    issueEditor?.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[data-write-issue-field="${key}"]`) || null;

  const issueFieldValue = (key: string): string => issueField(key)?.value.trim() || "";

  const writeIssueField = (key: string, value: string): void => {
    const field = issueField(key);

    if (field) {
      field.value = value;
    }
  };

  const writeText = (key: string, value: string): void => {
    const field = textField(key);

    if (field) {
      field.innerText = value;
    }
  };

  const createSelect = (options: Array<{ value: string; label: string }>, value: string): HTMLSelectElement => {
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
  const galleryLayoutOptions = [
    { value: "standard", label: "기본" },
    { value: "wide", label: "와이드" },
    { value: "portrait", label: "포트레이트" },
    { value: "diptych", label: "2열" },
    { value: "strip", label: "필름스트립" }
  ];

  const cycleSelectVisual = (select: HTMLSelectElement | null, direction: number): string => {
    if (!select) {
      return "image-material";
    }

    select.value = nextImageClass(select.value || "image-material", direction);
    return select.value;
  };

  const imageClassOptionsHtml = (selectedClass: string): string => imageClasses
    .map((imageClass) => `<option value="${imageClass}"${imageClass === selectedClass ? " selected" : ""}>${imageClass}</option>`)
    .join("");

  const issueFeatureField = (feature: AdminIssueFeature, group: keyof AdminIssueFeature): string => {
    const value = feature[group] as AdminLocalizedText | AdminLocalizedList | undefined;

    if (Array.isArray((value as AdminLocalizedList | undefined)?.[activeWriteLocale])) {
      return escapeHtmlClient(((value as AdminLocalizedList)[activeWriteLocale] || []).join("\n"));
    }

    return escapeHtmlClient((value as AdminLocalizedText | undefined)?.[activeWriteLocale] || "");
  };

  const issueCreditField = (credit: AdminIssueCredit, group: keyof AdminIssueCredit): string => {
    const value = credit[group] as AdminLocalizedText | undefined;

    return escapeHtmlClient(value?.[activeWriteLocale] || "");
  };

  const renderIssueFeatures = (): void => {
    if (!issueFeatures) {
      return;
    }

    issueFeatures.innerHTML = adminIssue.features.map((feature, index) => `
      <article class="issue-feature-editor" data-write-issue-feature>
        <div class="issue-feature-editor-head">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${escapeHtmlClient(feature.title[activeWriteLocale] || feature.title.ko || feature.title.en || feature.slug)}</strong>
        </div>
        <div class="issue-feature-editor-grid">
          <div class="issue-feature-common">
            <button type="button" class="issue-feature-visual-button" data-write-issue-feature-preview aria-label="이슈 장면 비주얼 좌우 클릭으로 변경">
              <span class="image-block ${escapeHtmlClient(feature.heroClass)}"></span>
              <small>Left / Right visual</small>
            </button>
            <label><span>Slug</span><input type="text" value="${escapeHtmlClient(feature.slug)}" data-write-issue-feature-field="slug" /></label>
            <label><span>Visual</span><select data-write-issue-feature-field="heroClass">${imageClassOptionsHtml(feature.heroClass)}</select></label>
          </div>
          <section class="issue-feature-writing-panel" aria-label="${languageName(activeWriteLocale)} scene fields">
            <header>
              <span>${localeLabel(activeWriteLocale)}</span>
              <strong>${languageName(activeWriteLocale)}</strong>
            </header>
            <div class="issue-field-row">
              <label><span>Role</span><input type="text" value="${issueFeatureField(feature, "role")}" data-write-issue-feature-field="role" /></label>
              <label><span>Title</span><input type="text" value="${issueFeatureField(feature, "title")}" data-write-issue-feature-field="title" /></label>
            </div>
            <label><span>Intro</span><textarea rows="2" data-write-issue-feature-field="intro">${issueFeatureField(feature, "intro")}</textarea></label>
            <label><span>Excerpt</span><textarea rows="2" data-write-issue-feature-field="excerpt">${issueFeatureField(feature, "excerpt")}</textarea></label>
            <label><span>Body</span><textarea rows="5" data-write-issue-feature-field="body">${issueFeatureField(feature, "body")}</textarea></label>
            <div class="issue-field-row">
              <label><span>Credit</span><input type="text" value="${issueFeatureField(feature, "credit")}" data-write-issue-feature-field="credit" /></label>
              <label><span>Location</span><input type="text" value="${issueFeatureField(feature, "location")}" data-write-issue-feature-field="location" /></label>
              <label><span>Read</span><input type="text" value="${issueFeatureField(feature, "readTime")}" data-write-issue-feature-field="readTime" /></label>
            </div>
            <div class="issue-feature-actions">
              <button type="button" data-write-issue-feature-add-after>아래 장면 추가</button>
              <button type="button" data-write-issue-feature-remove${adminIssue.features.length <= 1 ? " disabled" : ""}>삭제</button>
            </div>
          </section>
        </div>
      </article>`).join("");
  };

  const renderIssueCredits = (): void => {
    if (!issueCredits) {
      return;
    }

    issueCredits.innerHTML = adminIssue.credits.map((credit, index) => `
      <div class="issue-credit-editor" data-write-issue-credit>
        <span>${String(index + 1).padStart(2, "0")}</span>
        <label><small>${localeLabel(activeWriteLocale)} Label</small><input type="text" value="${issueCreditField(credit, "label")}" data-write-issue-credit-field="label" /></label>
        <label><small>${localeLabel(activeWriteLocale)} Value</small><input type="text" value="${issueCreditField(credit, "value")}" data-write-issue-credit-field="value" /></label>
        <button type="button" data-write-issue-credit-add-after>아래 크레딧 추가</button>
        <button type="button" data-write-issue-credit-remove${adminIssue.credits.length <= 1 ? " disabled" : ""}>삭제</button>
      </div>`).join("");
  };

  const renderIssueList = (): void => {
    if (!issueList) {
      return;
    }

    if (issueList instanceof HTMLSelectElement) {
      issueList.innerHTML = adminIssues.map((issue, index) => `
        <option value="${index}"${index === currentIssueIndex ? " selected" : ""}>${escapeHtmlClient(issue.number)} · ${escapeHtmlClient(issue.title[activeWriteLocale] || issue.title.ko || issue.title.en || issue.number)}</option>`).join("");
    } else {
      issueList.innerHTML = adminIssues.map((issue, index) => `
        <button type="button" class="issue-admin-list-item ${index === currentIssueIndex ? "is-active" : ""}" data-write-issue-index="${index}" aria-pressed="${index === currentIssueIndex ? "true" : "false"}">
          <span><strong>${escapeHtmlClient(issue.number)}</strong><small>${index === 0 ? "Latest" : `Stack ${String(index + 1).padStart(2, "0")}`}</small></span>
          <strong>${escapeHtmlClient(issue.title[activeWriteLocale] || issue.title.ko || issue.title.en || issue.number)}</strong>
          <small>${escapeHtmlClient(issue.date[activeWriteLocale] || issue.date.ko || issue.date.en)} / ${issue.features.length} scenes</small>
        </button>`).join("");
    }

    if (issueCount) {
      issueCount.textContent = String(adminIssues.length);
    }
  };

  const updateIssueSummary = (): void => {
    if (issueSummaryTitle) {
      issueSummaryTitle.textContent = adminIssue.title[activeWriteLocale] || adminIssue.title.ko || adminIssue.title.en || adminIssue.number;
    }

    if (issueSummarySubtitle) {
      issueSummarySubtitle.textContent = adminIssue.subtitle[activeWriteLocale] || adminIssue.subtitle.ko || adminIssue.subtitle.en;
    }

    if (issueSummaryMeta) {
      issueSummaryMeta.textContent = `장면 ${adminIssue.features.length} / 크레딧 ${adminIssue.credits.length}`;
    }
  };

  const collectIssueFeature = (feature: HTMLElement, index: number): AdminIssueFeature => {
    const base = adminIssue.features[index] || fallbackIssueFeature();
    const field = (key: string): string =>
      feature.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-write-issue-feature-field="${key}"]`)?.value.trim() || "";

    return normalizeIssueFeature({
      ...base,
      slug: toSlug(field("slug") || field("title") || base.slug || "new-scene"),
      role: localizedText(base.role, field("role")),
      title: localizedText(base.title, field("title")),
      intro: localizedText(base.intro, field("intro")),
      excerpt: localizedText(base.excerpt, field("excerpt")),
      body: localizedList(base.body, linesFromTextarea(field("body"))),
      credit: localizedText(base.credit, field("credit")),
      location: localizedText(base.location, field("location")),
      readTime: localizedText(base.readTime, field("readTime")),
      heroClass: field("heroClass") || "image-material"
    });
  };

  const collectIssueCredit = (credit: HTMLElement, index: number): AdminIssueCredit => {
    const base = adminIssue.credits[index] || { label: { ko: "", en: "" }, value: { ko: "", en: "" } };
    const field = (key: string): string =>
      credit.querySelector<HTMLInputElement>(`[data-write-issue-credit-field="${key}"]`)?.value.trim() || "";

    return {
      label: localizedText(base.label, field("label")),
      value: localizedText(base.value, field("value"))
    };
  };

  const formIssue = (): AdminIssueProject => normalizeIssue({
    ...adminIssue,
    number: issueFieldValue("number") || adminIssue.number,
    title: localizedText(adminIssue.title, issueFieldValue("title")),
    subtitle: localizedText(adminIssue.subtitle, issueFieldValue("subtitle")),
    deck: localizedText(adminIssue.deck, issueFieldValue("deck")),
    date: localizedText(adminIssue.date, issueFieldValue("date")),
    format: localizedText(adminIssue.format, issueFieldValue("format")),
    availability: localizedText(adminIssue.availability, issueFieldValue("availability")),
    coverCredit: localizedText(adminIssue.coverCredit, issueFieldValue("coverCredit")),
    editorNote: localizedText(adminIssue.editorNote, issueFieldValue("editorNote")),
    credits: Array.from(issueCredits?.querySelectorAll<HTMLElement>("[data-write-issue-credit]") || []).map(collectIssueCredit),
    features: Array.from(issueFeatures?.querySelectorAll<HTMLElement>("[data-write-issue-feature]") || []).map(collectIssueFeature)
  });

  const createParagraph = (text: string): HTMLParagraphElement => {
    const paragraph = document.createElement("p");
    paragraph.contentEditable = "true";
    paragraph.spellcheck = true;
    paragraph.dataset.writeBlock = "paragraph";
    paragraph.dataset.writeParagraph = "";
    paragraph.innerText = text;
    return paragraph;
  };

  const createSectionQuote = (text: string): HTMLQuoteElement => {
    const quote = document.createElement("blockquote");
    quote.className = "article-inline-quote writer-section-quote";
    quote.contentEditable = "true";
    quote.spellcheck = true;
    quote.dataset.writeBlock = "quote";
    quote.dataset.writeSectionQuote = "";
    quote.innerText = text;
    return quote;
  };

  const createGalleryItem = (imageClass = "image-material", image = ""): HTMLElement => {
    const item = document.createElement("div");
    item.className = "writer-gallery-item";
    item.dataset.writeGalleryItem = "";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "writer-section-media-button";
    button.dataset.writeGalleryImageButton = "";
    button.setAttribute("aria-label", "본문 갤러리 이미지 수정");

    const preview = document.createElement("span");
    preview.className = `image-block ${imageClass || "image-material"}`;
    preview.dataset.writeGalleryImagePreview = "";

    const label = document.createElement("span");
    label.dataset.writeGalleryImageLabel = "";
    label.textContent = "본문 이미지 추가";
    button.append(preview, label);

    const tools = document.createElement("div");
    tools.className = "writer-gallery-item-tools";
    tools.contentEditable = "false";

    const imageClassLabel = document.createElement("label");
    const imageClassText = document.createElement("span");
    imageClassText.textContent = "이미지 비주얼";
    const imageClassSelect = createSelect(imageClassOptions, imageClass || "image-material");
    imageClassSelect.dataset.writeGalleryImageClass = "";
    imageClassLabel.append(imageClassText, imageClassSelect);

    const imageInput = document.createElement("input");
    imageInput.type = "url";
    imageInput.hidden = true;
    imageInput.value = image;
    imageInput.dataset.writeGalleryImage = "";

    const imageFile = document.createElement("input");
    imageFile.type = "file";
    imageFile.accept = "image/gif,image/jpeg,image/png,image/webp";
    imageFile.hidden = true;
    imageFile.dataset.writeGalleryImageFile = "";

    const useUrl = document.createElement("button");
    useUrl.type = "button";
    useUrl.dataset.writeGalleryImageUrl = "";
    useUrl.textContent = "URL";

    const useFile = document.createElement("button");
    useFile.type = "button";
    useFile.dataset.writeGalleryImageFileButton = "";
    useFile.textContent = "파일";

    const useVisual = document.createElement("button");
    useVisual.type = "button";
    useVisual.dataset.writeGalleryImageUseVisual = "";
    useVisual.textContent = "자동 이미지";

    const removeImage = document.createElement("button");
    removeImage.type = "button";
    removeImage.dataset.writeGalleryImageRemove = "";
    removeImage.textContent = "이미지 삭제";

    tools.append(imageClassLabel, imageInput, imageFile, useUrl, useFile, useVisual, removeImage);
    item.append(button, tools);
    return item;
  };

  const updateGalleryLayout = (gallery: HTMLElement, value?: string, imageCount = 1): void => {
    const layout = normalizeGalleryLayout(value, imageCount);
    gallery.dataset.writeGalleryLayout = layout;
    galleryLayouts.forEach((galleryLayout) => gallery.classList.remove(`writer-gallery-${galleryLayout}`));
    gallery.classList.add(`writer-gallery-${layout}`);
    const select = gallery.querySelector<HTMLSelectElement>("[data-write-gallery-layout]");

    if (select && select.value !== layout) {
      select.value = layout;
    }
  };

  const createGalleryBlock = (images: AdminBlockImage[] = [{ imageClass: "image-material", image: "" }], caption = "", layoutValue?: string): HTMLElement => {
    const gallery = document.createElement("figure");
    gallery.className = "writer-section-media writer-section-gallery";
    gallery.dataset.writeBlock = "gallery";
    gallery.dataset.writeSectionMedia = "";
    gallery.dataset.writeSectionGallery = "";
    gallery.contentEditable = "false";
    updateGalleryLayout(gallery, layoutValue, images.length);

    const items = document.createElement("div");
    items.className = "writer-gallery-items";
    items.dataset.writeGalleryItems = "";
    const visibleImages = images.length > 0 ? images : [{ imageClass: "image-material", image: "" }];
    visibleImages.forEach((image) => items.append(createGalleryItem(image.imageClass || "image-material", image.image || "")));

    const figcaption = document.createElement("figcaption");
    figcaption.contentEditable = "true";
    figcaption.spellcheck = true;
    figcaption.dataset.writeGalleryCaption = "";
    figcaption.innerText = caption;

    const tools = document.createElement("div");
    tools.className = "writer-gallery-tools";
    tools.contentEditable = "false";

    const layoutLabel = document.createElement("label");
    const layoutText = document.createElement("span");
    layoutText.textContent = "레이아웃";
    const layoutSelect = createSelect(galleryLayoutOptions, gallery.dataset.writeGalleryLayout || "standard");
    layoutSelect.dataset.writeGalleryLayout = "";
    layoutLabel.append(layoutText, layoutSelect);

    const addImage = document.createElement("button");
    addImage.type = "button";
    addImage.dataset.writeGalleryAddImage = "";
    addImage.textContent = "이미지 추가";

    const removeGallery = document.createElement("button");
    removeGallery.type = "button";
    removeGallery.dataset.writeGalleryRemove = "";
    removeGallery.textContent = "갤러리 삭제";

    tools.append(layoutLabel, addImage, removeGallery);
    gallery.append(items, figcaption, tools);
    return gallery;
  };

  const blockElementsForSection = (
    paragraphs: string[],
    railClass: string,
    sectionImageClass: string,
    sectionImage: string,
    hideSectionImage: boolean,
    sectionImageCaption: string,
    blocks?: AdminSectionBlock[]
  ): HTMLElement[] => {
    if (blocks && blocks.length > 0) {
      return blocks.map((block) => {
        if (block.type === "quote") {
          return createSectionQuote(activeText(block.text));
        }

        if (block.type === "gallery") {
          return createGalleryBlock(block.images, activeText(block.caption), block.layout);
        }

        return createParagraph(activeText(block.text));
      });
    }

    const elements: HTMLElement[] = [];

    if (!hideSectionImage && (sectionImage || sectionImageClass)) {
      elements.push(createGalleryBlock([{ imageClass: sectionImageClass || railClass || "image-material", image: sectionImage }], sectionImageCaption));
    }

    paragraphs.forEach((paragraph) => elements.push(createParagraph(paragraph)));
    return elements;
  };

  const createSection = (
    heading = activeWriteLocale === "ko" ? "새 섹션 제목" : "New Section",
    paragraphs = [activeWriteLocale === "ko" ? "새 문단을 입력하세요." : "Write a new paragraph."],
    railClass = "image-material",
    railImage = "",
    hideRailImage = false,
    railTitle = activeWriteLocale === "ko" ? "좌측 레일 제목" : "Rail title",
    railText = activeWriteLocale === "ko" ? "좌측 레일 설명을 이곳에서 직접 수정합니다." : "Edit the rail text here.",
    sectionImageClass = "",
    sectionImage = "",
    hideSectionImage = true,
    sectionImageCaption = "",
    blocks?: AdminSectionBlock[]
  ): HTMLElement => {
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

    const railImageFile = document.createElement("input");
    railImageFile.type = "file";
    railImageFile.accept = "image/gif,image/jpeg,image/png,image/webp";
    railImageFile.hidden = true;
    railImageFile.dataset.writeSectionRailImageFile = "";

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

    railSettings.append(railClassLabel, railImageInput, railImageFile, railHiddenInput, useVisual, hideImage);
    railCard.append(railNo, railImageButton, railCardTitle, railCardText, railSettings);
    section.append(railCard);

    const title = document.createElement("h2");
    title.contentEditable = "true";
    title.spellcheck = true;
    title.dataset.writeSectionHeading = "";
    title.innerText = heading;
    section.append(title);

    blockElementsForSection(paragraphs, railClass, sectionImageClass, sectionImage, hideSectionImage, sectionImageCaption, blocks)
      .forEach((block) => section.append(block));

    return section;
  };

  const focusEditableEnd = (element: HTMLElement | null): void => {
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

  const focusFirstParagraph = (section: HTMLElement): void => {
    let paragraph = section.querySelector<HTMLElement>("[data-write-paragraph]");

    if (!paragraph) {
      paragraph = createParagraph("");
      section.append(paragraph);
    }

    focusEditableEnd(paragraph);
  };

  const setActiveWriteBlock = (block: HTMLElement | null): void => {
    activeWriteBlock?.classList.remove("is-write-insertion-target");
    activeBlockTools.remove();
    activeWriteBlock = block && writer.contains(block) ? block : null;

    if (!activeWriteBlock) {
      return;
    }

    activeWriteBlock.classList.add("is-write-insertion-target");
    activeWriteBlock.after(activeBlockTools);
  };

  const rememberWriteBlock = (target: EventTarget | null): void => {
    const block = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-write-block]") : null;

    if (block && !block.closest("[data-write-issue-editor]")) {
      setActiveWriteBlock(block);
    }
  };

  const insertionBlockForSection = (section: HTMLElement): HTMLElement | null =>
    activeWriteBlock && document.contains(activeWriteBlock) && section.contains(activeWriteBlock) ? activeWriteBlock : null;

  const insertBlockAtSelection = (section: HTMLElement, block: HTMLElement): void => {
    const insertionBlock = insertionBlockForSection(section);

    if (insertionBlock) {
      insertionBlock.after(block);
    } else {
      section.append(block);
    }

    setActiveWriteBlock(block);
  };

  const addSectionAfter = (section?: HTMLElement | null): HTMLElement => {
    const nextSection = createSection();

    if (section) {
      section.after(nextSection);
    } else {
      sectionsContainer()?.append(nextSection);
    }

    focusEditableEnd(nextSection.querySelector<HTMLElement>("[data-write-section-heading]"));
    return nextSection;
  };

  const promptSectionImage = (section: HTMLElement): boolean => {
    const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-image]");
    const enabledInput = section.querySelector<HTMLInputElement>("[data-write-section-image-enabled]");
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

  const promptGalleryImage = (item: HTMLElement): boolean => {
    const imageInput = item.querySelector<HTMLInputElement>("[data-write-gallery-image]");
    const nextImage = window.prompt("본문 이미지 URL을 입력하세요. 비우면 자동 이미지로 사용됩니다.", imageInput?.value || "");

    if (nextImage === null) {
      return false;
    }

    if (imageInput) {
      imageInput.value = nextImage.trim();
    }

    return true;
  };

  const insertQuoteAfter = (target: HTMLElement, text = ""): HTMLElement => {
    const quote = createSectionQuote(text || (activeWriteLocale === "ko" ? "인용문을 입력하세요." : "Write the pull quote."));
    target.after(quote);
    target.remove();
    setActiveWriteBlock(quote);
    focusEditableEnd(quote);
    return quote;
  };

  const insertGalleryAfter = (target: HTMLElement, image = ""): HTMLElement => {
    const section = target.closest<HTMLElement>("[data-write-section]");
    const visualClass = section?.querySelector<HTMLSelectElement>("[data-write-section-rail-class]")?.value || metaValue("heroClass") || "image-material";
    const gallery = createGalleryBlock([{ imageClass: visualClass, image }], "");
    target.after(gallery);
    target.remove();
    setActiveWriteBlock(gallery);
    return gallery;
  };

  const sectionsContainer = (): HTMLElement | null => writer.querySelector<HTMLElement>("[data-write-body]");
  const sections = (): HTMLElement[] => Array.from(writer.querySelectorAll<HTMLElement>("[data-write-section]"));

  const updateSectionRailCards = (): void => {
    const currentSections = sections();
    currentSections.forEach((section, index) => {
      const railClass = section.querySelector<HTMLSelectElement>("[data-write-section-rail-class]")?.value || metaValue("heroClass") || "image-material";
      const railImage = section.querySelector<HTMLInputElement>("[data-write-section-rail-image]")?.value.trim() || "";
      const isHidden = section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]")?.value === "true";
      const preview = section.querySelector<HTMLElement>("[data-write-section-rail-preview]");
      const card = section.querySelector<HTMLElement>("[data-write-section-rail-card]");
      const railNo = section.querySelector<HTMLElement>("[data-write-section-rail-no]");
      const hideButton = section.querySelector<HTMLButtonElement>("[data-write-section-rail-hide]");

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

      section.querySelectorAll<HTMLElement>("[data-write-gallery-item]").forEach((item) => {
        const imageClass = item.querySelector<HTMLSelectElement>("[data-write-gallery-image-class]")?.value || railClass;
        const image = item.querySelector<HTMLInputElement>("[data-write-gallery-image]")?.value.trim() || "";
        const imagePreview = item.querySelector<HTMLElement>("[data-write-gallery-image-preview]");
        const imageLabel = item.querySelector<HTMLElement>("[data-write-gallery-image-label]");

        if (imagePreview) {
          setImageBlockVisual(imagePreview, imageClass, image);
        }

        if (imageLabel) {
          imageLabel.textContent = image ? "본문 이미지 수정" : "자동 본문 이미지";
        }
      });
    });
  };

  type SectionDraftBlock =
    | { type: "paragraph"; text: string }
    | { type: "quote"; text: string }
    | { type: "gallery"; images: AdminBlockImage[]; layout: GalleryLayout; caption: string };

  type SectionDraft = {
    heading: string;
    paragraphs: string[];
    blocks: SectionDraftBlock[];
    railTitle: string;
    railText: string;
    railClass: string;
    railImage: string;
    hideRailImage: boolean;
  };

  const blockData = (block: HTMLElement): SectionDraftBlock | null => {
    if (block.dataset.writeBlock === "quote") {
      const quote = block.innerText.trim();
      return { type: "quote", text: quote };
    }

    if (block.dataset.writeBlock === "gallery") {
      const images = Array.from(block.querySelectorAll<HTMLElement>("[data-write-gallery-item]"))
        .map((item) => ({
          imageClass: item.querySelector<HTMLSelectElement>("[data-write-gallery-image-class]")?.value || "image-material",
          image: item.querySelector<HTMLInputElement>("[data-write-gallery-image]")?.value.trim() || ""
        }))
        .filter((image) => image.imageClass || image.image);

      return images.length > 0
        ? { type: "gallery", images, layout: normalizeGalleryLayout(block.querySelector<HTMLSelectElement>("[data-write-gallery-layout]")?.value || block.dataset.writeGalleryLayout), caption: block.querySelector<HTMLElement>("[data-write-gallery-caption]")?.innerText.trim() || "" }
        : null;
    }

    const paragraph = block.innerText.trim();
    return { type: "paragraph", text: paragraph };
  };

  const sectionData = (): SectionDraft[] => sections().map((section) => {
    const blocks = Array.from(section.querySelectorAll<HTMLElement>("[data-write-block]"))
      .map(blockData)
      .filter((block): block is SectionDraftBlock => Boolean(block));

    return {
      heading: section.querySelector<HTMLElement>("[data-write-section-heading]")?.innerText.trim() || "",
      paragraphs: blocks.filter((block): block is { type: "paragraph"; text: string } => block.type === "paragraph").map((block) => block.text).filter(Boolean),
      blocks,
      railTitle: section.querySelector<HTMLElement>("[data-write-section-rail-title]")?.innerText.trim() || "",
      railText: section.querySelector<HTMLElement>("[data-write-section-rail-text]")?.innerText.trim() || "",
      railClass: section.querySelector<HTMLSelectElement>("[data-write-section-rail-class]")?.value || "",
      railImage: section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]")?.value === "true"
        ? ""
        : section.querySelector<HTMLInputElement>("[data-write-section-rail-image]")?.value.trim() || "",
      hideRailImage: section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]")?.value === "true"
    };
  });

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

  const categoryLabel = (): string => {
    const option = categorySelect?.selectedOptions.item(0);
    return (activeWriteLocale === "ko" ? option?.dataset.labelKo : option?.dataset.labelEn) || option?.textContent?.trim() || "";
  };
  const subcategoryLabel = (): string => {
    const option = selectedSubcategory();
    return (activeWriteLocale === "ko" ? option?.dataset.labelKo : option?.dataset.labelEn) || option?.textContent?.trim() || "";
  };

  const updateVisualClass = (): void => {
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

  const updateRailMode = (): void => {
    const mode = (railModeSelect?.value || "default") as RailMode;
    rail?.classList.remove("article-side-default", "article-side-image", "article-side-text");
    rail?.classList.add(`article-side-${mode}`);
  };

  const formatDateForPreview = (value: string): string => value.replace(/-/g, ".");

  const currentBase = (): AdminArticle => adminArticles[currentIndex] || fallbackArticle();

  const legacyBlocksForSection = (section: AdminSection | undefined): AdminSectionBlock[] => {
    if (!section) {
      return [];
    }

    const blocks: AdminSectionBlock[] = [];

    if (!section.hideSectionImage && (section.sectionImage || section.sectionImageClass)) {
      blocks.push({
        type: "gallery",
        images: [{ imageClass: section.sectionImageClass || section.railClass || "image-material", image: section.sectionImage || "" }],
        layout: "standard",
        caption: section.sectionImageCaption || blankLocalizedText()
      });
    }

    const paragraphCount = Math.max(section.paragraphs.ko.length, section.paragraphs.en.length);
    for (let index = 0; index < paragraphCount; index += 1) {
      blocks.push({
        type: "paragraph",
        text: {
          ko: section.paragraphs.ko[index] || "",
          en: section.paragraphs.en[index] || ""
        }
      });
    }

    return blocks;
  };

  const localizedDraftBlock = (block: SectionDraftBlock, previousBlock: AdminSectionBlock | undefined): AdminSectionBlock => {
    if (block.type === "gallery") {
      const previousGallery = previousBlock?.type === "gallery" ? previousBlock : undefined;
      return {
        type: "gallery",
        images: block.images,
        layout: block.layout,
        caption: localizedText(previousGallery?.caption || blankLocalizedText(), block.caption)
      };
    }

    if (block.type === "quote") {
      const previousQuote = previousBlock?.type === "quote" ? previousBlock : undefined;
      return { type: "quote", text: localizedText(previousQuote?.text || blankLocalizedText(), block.text) };
    }

    const previousParagraph = previousBlock?.type === "paragraph" ? previousBlock : undefined;
    return { type: "paragraph", text: localizedText(previousParagraph?.text || blankLocalizedText(), block.text) };
  };

  const firstGalleryBlock = (blocks: AdminSectionBlock[]): Extract<AdminSectionBlock, { type: "gallery" }> | undefined =>
    blocks.find((block): block is Extract<AdminSectionBlock, { type: "gallery" }> => block.type === "gallery");

  const formArticle = (): AdminArticle => {
    const base = currentBase();
    const subcategory = selectedSubcategory();
    const subcategoryKey = metaValue("subcategory") || base.subcategoryKey;
    const tags = splitTags(metaValue("tags"));
    const sectionValues = sectionData();
    const nextSections = sectionValues.map((section, index): AdminSection => {
      const previous = base.sections[index];
      const previousHeading = previous?.heading || { ko: "", en: "" };
      const previousParagraphs = previous?.paragraphs || { ko: [], en: [] };
      const previousRailTitle = previous?.railTitle || previousHeading;
      const previousRailText = previous?.railText || { ko: previousParagraphs.ko[0] || "", en: previousParagraphs.en[0] || "" };
      const previousCaption = previous?.sectionImageCaption || { ko: "", en: "" };
      const heading = localizedText(previousHeading, section.heading);
      const paragraphs = localizedList(previousParagraphs, section.paragraphs);
      const previousBlocks = previous?.blocks && previous.blocks.length > 0 ? previous.blocks : legacyBlocksForSection(previous);
      const blocks = section.blocks.map((block, blockIndex) => localizedDraftBlock(block, previousBlocks[blockIndex]));
      const gallery = firstGalleryBlock(blocks);
      const firstGalleryImage = gallery?.images[0];

      return {
        heading,
        paragraphs,
        blocks,
        railTitle: localizedText(previousRailTitle, section.railTitle || heading[activeWriteLocale]),
        railText: localizedText(previousRailText, section.railText || paragraphs[activeWriteLocale]?.[0] || ""),
        railClass: section.railClass || previous?.railClass || metaValue("railClass") || base.railClass || base.heroClass,
        railImage: section.railImage,
        hideRailImage: section.hideRailImage,
        sectionImageClass: firstGalleryImage?.imageClass || "",
        sectionImage: firstGalleryImage?.image || "",
        sectionImageCaption: gallery?.caption || localizedText(previousCaption, ""),
        hideSectionImage: !gallery
      };
    });
    const firstNextSection = nextSections[0];

    return normalizeArticle({
      ...base,
      slug: toSlug(metaValue("slug") || textValue("title") || base.slug),
      title: localizedText(base.title, textValue("title")),
      subtitle: localizedText(base.subtitle, textValue("deck")),
      deck: localizedText(base.deck, textValue("deck")),
      category: metaValue("category") || base.category,
      subcategoryKey,
      subcategoryKeys: [subcategoryKey],
      subcategory: {
        ko: subcategory?.dataset.labelKo || base.subcategory.ko,
        en: subcategory?.dataset.labelEn || base.subcategory.en
      },
      date: metaValue("date") || base.date,
      readTime: localizedText(base.readTime, metaValue("readTime")),
      location: localizedText(base.location, metaValue("location")),
      heroClass: metaValue("heroClass") || base.heroClass,
      heroImage: metaValue("imageMode") === "custom" ? metaValue("heroImage") : "",
      hideHeroImage: metaValue("imageMode") === "none",
      tags: localizedList(base.tags, tags),
      excerpt: localizedText(base.excerpt, textValue("deck")),
      quote: localizedText(base.quote, textValue("quote")),
      railMode: (metaValue("railMode") || "default") as RailMode,
      railClass: metaValue("railClass") || base.railClass || base.heroClass,
      railImage: metaValue("railImageMode") === "custom" ? metaValue("railImage") : "",
      hideRailImage: metaValue("railImageMode") === "none",
      railTitle: firstNextSection?.railTitle || base.railTitle,
      railText: firstNextSection?.railText || base.railText,
      sections: nextSections.length > 0 ? nextSections : base.sections
    });
  };

  const articleCode = (article: AdminArticle): string => `import type { Article } from "../../types";\n\nexport const article = ${JSON.stringify(article, null, 2)} satisfies Article;\n`;

  const articlesArrayCode = (): string => `import type { Article } from "../types";\n\nexport const articles = ${JSON.stringify(adminArticles, null, 2)} satisfies Article[];\n`;

  const issueProjectsCode = (): string => `import type { IssueProject } from "../types";\n\nexport const issueProjects = ${JSON.stringify(adminIssues, null, 2)} satisfies IssueProject[];\n`;

  const generateArticleObject = (): string => {
    return articleCode(formArticle());
  };

  const updateIssueOutput = (): void => {
    adminIssue = formIssue();
    adminIssues[currentIssueIndex] = adminIssue;

    if (issueTitle) {
      issueTitle.textContent = `${adminIssue.number} · ${adminIssue.title[activeWriteLocale] || adminIssue.title.ko || adminIssue.title.en}`;
    }

    updateIssueSummary();
    renderIssueList();

    if (issueOutput) {
      issueOutput.value = issueProjectsCode();
    }
  };

  const downloadArticlesFile = (): void => {
    const blob = new Blob([articlesArrayCode()], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "articles.ts";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadIssueFile = (): void => {
    const blob = new Blob([issueProjectsCode()], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "issue-projects.ts";
    link.click();
    URL.revokeObjectURL(url);
  };

  const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("File read failed")));
    reader.readAsDataURL(file);
  });

  const uploadImageFile = async (file: File): Promise<string> => {
    if (!/^image\/(gif|jpe?g|png|webp)$/.test(file.type)) {
      throw new Error("GIF, JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("이미지는 8MB 이하로 올려주세요.");
    }

    const dataUrl = await readFileAsDataUrl(file);

    try {
      const response = await fetch(apiPath("/api/admin/uploads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, dataUrl })
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json() as { url?: string };

      if (!result.url) {
        throw new Error("Upload URL missing");
      }

      return result.url;
    } catch {
      setStatus("정적 페이지에서는 파일 업로드 서버가 없어 data URL로 임시 반영했습니다. 로컬 서버에서 파일 저장하면 public/uploads에 저장됩니다.");
      return dataUrl;
    }
  };

  const applyImageFileToSection = async (section: HTMLElement, file: File): Promise<void> => {
    const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-image]");
    const enabledInput = section.querySelector<HTMLInputElement>("[data-write-section-image-enabled]");
    const caption = section.querySelector<HTMLElement>("[data-write-section-image-caption]");
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

  const applyImageFileToHero = async (file: File): Promise<void> => {
    const imageMode = metaField("imageMode");
    const heroImage = metaField("heroImage");
    const imageUrl = await uploadImageFile(file);

    if (imageMode) {
      imageMode.value = "custom";
    }

    if (heroImage) {
      heroImage.value = imageUrl;
    }
  };

  const applyImageFileToSectionRail = async (section: HTMLElement, file: File): Promise<void> => {
    const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-image]");
    const hiddenInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]");
    const imageUrl = await uploadImageFile(file);

    if (imageInput) {
      imageInput.value = imageUrl;
    }

    if (hiddenInput) {
      hiddenInput.value = "false";
    }
  };

  const applyImageFileToGalleryItem = async (item: HTMLElement, file: File): Promise<void> => {
    const imageInput = item.querySelector<HTMLInputElement>("[data-write-gallery-image]");
    const imageUrl = await uploadImageFile(file);

    if (imageInput) {
      imageInput.value = imageUrl;
    }
  };

  const adminPasswordForRequest = (): string => {
    const storedPassword = window.sessionStorage.getItem(authPasswordKey);

    if (storedPassword) {
      return storedPassword;
    }

    const password = loginInput?.value || window.prompt("Supabase 저장 비밀번호를 입력하세요.", "") || "";

    if (password) {
      window.sessionStorage.setItem(authPasswordKey, password);
    }

    return password;
  };

  const saveContentToSupabase = async (payload: { articles?: AdminArticle[]; issueProjects?: AdminIssueProject[] }): Promise<{ articleCount?: number; issueCount?: number }> => {
    if (!supabaseFunctionsUrl) {
      throw new Error("Supabase function URL missing");
    }

    const password = adminPasswordForRequest();

    if (!password) {
      throw new Error("Supabase password missing");
    }

    const response = await fetch(`${supabaseFunctionsUrl}/admin-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(supabaseAnonKey
          ? {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`
          }
          : {})
      },
      body: JSON.stringify({ password, ...payload })
    });

    const result = await response.json().catch(() => null) as { articleCount?: number; issueCount?: number; message?: string } | null;

    if (!response.ok) {
      throw new Error(result?.message || `Supabase save failed: ${response.status}`);
    }

    return result || {};
  };

  const saveArticlesToProject = async (): Promise<void> => {
    setSaveButtonState(articleSaveButton, "saving");
    adminArticles[currentIndex] = formArticle();
    saveCollection("저장 중...");

    if (supabaseFunctionsUrl) {
      try {
        const result = await saveContentToSupabase({ articles: adminArticles, issueProjects: adminIssues });
        setStatus(`Supabase published snapshot에 저장했습니다.${result.articleCount ? ` (${result.articleCount}개)` : ""}`);
        setSaveButtonState(articleSaveButton, "done");
        return;
      } catch (error) {
        setStatus(error instanceof Error ? `Supabase 저장 실패: ${error.message}` : "Supabase 저장에 실패했습니다.");
      }
    }

    try {
      const response = await fetch(apiPath("/api/admin/articles"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: adminArticles })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      const result = await response.json().catch(() => null) as { count?: number; path?: string } | null;
      setStatus(`src/content/magazine.ts에 저장했고 로컬 서버에 바로 반영했습니다.${result?.count ? ` (${result.count}개)` : ""}`);
      setSaveButtonState(articleSaveButton, "done");
    } catch {
      downloadArticlesFile();
      setStatus("정적 페이지에서는 폴더 저장이 불가해 articles.ts를 내려받았습니다. 로컬 서버에서 열면 폴더에 저장됩니다.");
      setSaveButtonState(articleSaveButton, "error");
    }
  };

  const saveIssueCollection = (message = "이슈 자동 저장됨"): void => {
    updateIssueOutput();
    window.localStorage.setItem(issueStorageKey, JSON.stringify(adminIssues));
    if (sourceVersion) {
      window.localStorage.setItem(issueSourceVersionKey, sourceVersion);
    }
    setIssueStatus(message);
  };

  const saveIssueToProject = async (): Promise<void> => {
    setSaveButtonState(issueSaveButton, "saving");
    saveIssueCollection("이슈 저장 중...");

    if (supabaseFunctionsUrl) {
      try {
        const result = await saveContentToSupabase({ articles: adminArticles, issueProjects: adminIssues });
        setIssueStatus(`Supabase published snapshot에 저장했습니다.${result.issueCount ? ` (${result.issueCount}개 이슈)` : ""}`);
        setSaveButtonState(issueSaveButton, "done");
        return;
      } catch (error) {
        setIssueStatus(error instanceof Error ? `Supabase 저장 실패: ${error.message}` : "Supabase 저장에 실패했습니다.");
      }
    }

    try {
      const response = await fetch(apiPath("/api/admin/issue"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueProjects: adminIssues })
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      setIssueStatus("src/content/magazine.ts의 issueProjects에 저장했고 로컬 서버에 바로 반영했습니다.");
      setSaveButtonState(issueSaveButton, "done");
    } catch {
      downloadIssueFile();
      setIssueStatus("정적 페이지에서는 이슈 저장이 불가해 issue-projects.ts를 내려받았습니다. 로컬 서버에서 열면 폴더에 저장됩니다.");
      setSaveButtonState(issueSaveButton, "error");
    }
  };

  const scheduleIssueSave = (): void => {
    updateIssueOutput();
    window.clearTimeout(issueSaveTimer);
    issueSaveTimer = window.setTimeout(() => saveIssueCollection(), 250);
  };

  const saveCollection = (message = "자동 저장됨"): void => {
    window.localStorage.setItem(storageKey, JSON.stringify(adminArticles));
    if (sourceVersion) {
      window.localStorage.setItem(articleSourceVersionKey, sourceVersion);
    }
    setStatus(message);
  };

  if (adminList) {
    let listDragPointerId: number | null = null;
    let listDragStartY = 0;
    let listDragStartScroll = 0;
    let listDragMoved = false;
    let listDragEndedAt = 0;

    const stopListDrag = (): void => {
      listDragPointerId = null;
      adminList.classList.remove("is-dragging");

      if (listDragMoved) {
        listDragEndedAt = Date.now();
      }
    };

    adminList.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      listDragPointerId = event.pointerId;
      listDragStartY = event.clientY;
      listDragStartScroll = adminList.scrollTop;
      listDragMoved = false;
    });

    adminList.addEventListener("pointermove", (event) => {
      if (listDragPointerId !== event.pointerId) {
        return;
      }

      const deltaY = event.clientY - listDragStartY;

      if (Math.abs(deltaY) > 8) {
        listDragMoved = true;
        adminList.classList.add("is-dragging");
        adminList.scrollTop = listDragStartScroll - deltaY;
        event.preventDefault();
      }
    });

    adminList.addEventListener("pointerup", stopListDrag);
    adminList.addEventListener("pointercancel", stopListDrag);
    adminList.addEventListener("click", (event) => {
      if (Date.now() - listDragEndedAt < 180) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  const renderAdminList = (): void => {
    if (!adminList) {
      return;
    }

    const categoryRank = (globalIndex: number): number => {
      const article = adminArticles[globalIndex];

      if (!article) {
        return 0;
      }

      return adminArticles.slice(0, globalIndex + 1).filter((item) => item.category === article.category).length;
    };

    const visibleArticles = adminArticles
      .map((article, index) => ({ article, index }))
      .filter(({ article }) => articleMatchesAdminControls(article));

    adminList.innerHTML = visibleArticles.length > 0 ? visibleArticles.map(({ article, index }, rank) => {
      const globalNo = String(index + 1).padStart(2, "0");
      const filteredNo = String(rank + 1).padStart(2, "0");
      const categoryNo = String(categoryRank(index)).padStart(2, "0");
      const isFiltered = activeCategoryFilter !== "all";
      return `
      <button type="button" class="admin-list-item ${index === currentIndex ? "is-active" : ""}" data-admin-index="${index}">
        <span class="admin-list-no"><strong>${isFiltered ? filteredNo : globalNo}</strong><small>${isFiltered ? `전체 ${globalNo}` : `${article.category} ${categoryNo}`}</small></span>
        <strong>${escapeHtmlClient(article.title[activeWriteLocale] || article.title.ko || article.title.en)}</strong>
        <small>${article.category} / ${article.subcategoryKey}</small>
      </button>`;
    }).join("") : `<p class="admin-empty">검색 조건에 맞는 기사가 없습니다. 필터나 검색어를 줄여보세요.</p>`;

    if (adminCount) {
      adminCount.textContent = activeCategoryFilter === "all" && activeArticleSearch.trim() === ""
        ? String(adminArticles.length)
        : `${visibleArticles.length}/${adminArticles.length}`;
    }

    adminFilters?.querySelectorAll<HTMLElement>("[data-admin-filter]").forEach((button) => {
      const filter = button.dataset.adminFilter || "all";
      const isActive = filter === activeCategoryFilter;
      const count = filter === "all" ? adminArticles.length : adminArticles.filter((article) => article.category === filter).length;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      const countElement = button.querySelector(".filter-count, small");
      if (countElement) {
        countElement.textContent = String(count);
      }
    });

    if (adminFilterSelect) {
      adminFilterSelect.value = activeCategoryFilter;
      Array.from(adminFilterSelect.options).forEach((option) => {
        const filter = option.value || "all";
        const count = filter === "all" ? adminArticles.length : adminArticles.filter((article) => article.category === filter).length;
        const label = option.textContent?.split(" · ")[0] || filter;
        option.textContent = `${label} · ${count}`;
      });
    }

    if (adminSearchInput && adminSearchInput.value !== activeArticleSearch) {
      adminSearchInput.value = activeArticleSearch;
    }
  };

  const moveCurrentArticle = (direction: -1 | 1): boolean => {
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

  const moveCurrentIssue = (direction: -1 | 1): boolean => {
    adminIssues[currentIssueIndex] = formIssue();
    const targetIndex = currentIssueIndex + direction;

    if (targetIndex < 0 || targetIndex >= adminIssues.length) {
      return false;
    }

    [adminIssues[currentIssueIndex], adminIssues[targetIndex]] = [adminIssues[targetIndex], adminIssues[currentIssueIndex]];
    applyIssue(targetIndex);
    return true;
  };

  const writeMeta = (key: string, value: string): void => {
    const field = metaField(key);

    if (field) {
      field.value = value;
    }
  };

  const applyIssue = (index: number): void => {
    currentIssueIndex = Math.max(0, Math.min(index, adminIssues.length - 1));
    adminIssue = normalizeIssue(adminIssues[currentIssueIndex] || fallbackIssue());
    adminIssues[currentIssueIndex] = adminIssue;
    writeIssueField("number", adminIssue.number);
    writeIssueField("title", activeText(adminIssue.title));
    writeIssueField("subtitle", activeText(adminIssue.subtitle));
    writeIssueField("deck", activeText(adminIssue.deck));
    writeIssueField("date", activeText(adminIssue.date));
    writeIssueField("format", activeText(adminIssue.format));
    writeIssueField("availability", activeText(adminIssue.availability));
    writeIssueField("coverCredit", activeText(adminIssue.coverCredit));
    writeIssueField("editorNote", activeText(adminIssue.editorNote));
    renderIssueFeatures();
    renderIssueCredits();
    renderIssueList();
    updateIssueSummary();
    updateIssueOutput();
  };

  const applyArticle = (index: number): void => {
    currentIndex = Math.max(0, Math.min(index, adminArticles.length - 1));
    setActiveWriteBlock(null);
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
    writeMeta("readTime", activeText(article.readTime));
    writeMeta("location", activeText(article.location));
    writeMeta("tags", activeList(article.tags).join(", "));

    writeText("title", activeText(article.title));
    writeText("deck", activeText(article.deck));
    writeText("quote", activeText(article.quote));
    const container = sectionsContainer();

    if (container) {
      container.querySelectorAll("[data-write-section]").forEach((section) => section.remove());
      article.sections.forEach((section) => {
        const sectionParagraphs = activeList(section.paragraphs);
        container.append(createSection(
          activeText(section.heading),
          sectionParagraphs.length > 0 ? sectionParagraphs : [""],
          section.railClass || article.railClass || article.heroClass,
          section.railImage || "",
          Boolean(section.hideRailImage),
          activeText(section.railTitle) || activeText(section.heading),
          activeText(section.railText) || sectionParagraphs[0] || "",
          section.sectionImageClass || "",
          section.sectionImage || "",
          Boolean(section.hideSectionImage),
          activeText(section.sectionImageCaption),
          section.blocks
        ));
      });
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

  const handleEditorKeydown = async (event: KeyboardEvent): Promise<void> => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (writer.dataset.writeMode === "issue") {
        await saveIssueToProject();
      } else {
        await saveArticlesToProject();
      }
      return;
    }

    const section = target.closest<HTMLElement>("[data-write-section]");

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      addSectionAfter(section);
      scheduleSave();
      return;
    }

    if (event.key === "Backspace" && target.matches("[data-write-paragraph]") && target.innerText.trim() === "" && section) {
      const sectionParagraphs = Array.from(section.querySelectorAll<HTMLElement>("[data-write-paragraph]"));

      if (sectionParagraphs.length > 1) {
        event.preventDefault();
        const index = sectionParagraphs.indexOf(target);
        const nextFocus = sectionParagraphs[index - 1] || section.querySelector<HTMLElement>("[data-write-section-heading]");
        target.remove();
        focusEditableEnd(nextFocus);
        scheduleSave();
      }

      return;
    }

    if (event.key === "Backspace" && target.matches("[data-write-section-quote]") && target.innerText.trim() === "" && section) {
      event.preventDefault();
      const nextFocus = section.querySelector<HTMLElement>("[data-write-section-heading]");
      target.remove();
      focusEditableEnd(nextFocus);
      scheduleSave();
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
      if (target.matches("[data-write-section-quote]") && section) {
        event.preventDefault();
        const paragraph = createParagraph("");
        target.after(paragraph);
        setActiveWriteBlock(paragraph);
        focusEditableEnd(paragraph);
        scheduleSave();
      }

      return;
    }

    const rawValue = target.innerText.trim();
    const value = rawValue.toLowerCase();

    if (value === "/quote" || value.startsWith("/quote ")) {
      event.preventDefault();
      insertQuoteAfter(target, rawValue.replace(/^\/quote\s*/i, "").trim());
      scheduleSave();
      return;
    }

    if (value === "/image" || value.startsWith("/image ")) {
      event.preventDefault();
      const inlineImage = rawValue.replace(/^\/image\s*/i, "").trim();
      const nextImage = inlineImage || window.prompt("본문 이미지 URL을 입력하세요. 비우면 자동 이미지로 사용됩니다.", "");

      if (nextImage !== null) {
        insertGalleryAfter(target, nextImage.trim());
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
    setActiveWriteBlock(paragraph);
    focusEditableEnd(paragraph);
    scheduleSave();
  };

  const handleWriterChange = async (event: Event): Promise<void> => {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.matches("[data-write-hero-image-file]")) {
      const file = target.files?.[0];

      if (file) {
        try {
          setStatus("대표 이미지를 저장 중...");
          await applyImageFileToHero(file);
          setStatus("대표 이미지를 반영했습니다.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
        }

        target.value = "";
      }
    }

    if (target instanceof HTMLInputElement && target.matches("[data-write-section-rail-image-file]")) {
      const section = target.closest<HTMLElement>("[data-write-section]");
      const file = target.files?.[0];

      if (section && file) {
        try {
          setStatus("레일 이미지를 저장 중...");
          await applyImageFileToSectionRail(section, file);
          setStatus("레일 이미지를 반영했습니다.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
        }

        target.value = "";
      }
    }

    if (target instanceof HTMLInputElement && target.matches("[data-write-gallery-image-file]")) {
      const item = target.closest<HTMLElement>("[data-write-gallery-item]");
      const file = target.files?.[0];

      if (item && file) {
        try {
          setStatus("이미지 파일을 저장 중...");
          await applyImageFileToGalleryItem(item, file);
          setStatus("본문 갤러리 이미지 파일을 반영했습니다.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
        }

        target.value = "";
      }
    }

    if (target instanceof HTMLInputElement && target.matches("[data-write-section-image-file]")) {
      const section = target.closest<HTMLElement>("[data-write-section]");
      const file = target.files?.[0];

      if (section && file) {
        try {
          setStatus("이미지 파일을 저장 중...");
          await applyImageFileToSection(section, file);
          setStatus("본문 이미지 파일을 반영했습니다.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.");
        }

        target.value = "";
      }
    }

    if (target instanceof HTMLSelectElement && target.matches("[data-write-gallery-layout]")) {
      const gallery = target.closest<HTMLElement>("[data-write-section-gallery]");

      if (gallery) {
        updateGalleryLayout(gallery, target.value);
      }
    }

    scheduleSave();
  };

  const switchWriteLocale = (nextLocale: WriteLocale): void => {
    if (nextLocale === activeWriteLocale) {
      return;
    }

    adminArticles[currentIndex] = formArticle();
    adminIssues[currentIssueIndex] = formIssue();
    activeWriteLocale = nextLocale;
    updateLocaleControls();
    applyIssue(currentIssueIndex);
    applyArticle(currentIndex);
    saveCollection(`${languageName(activeWriteLocale)} 입력란으로 전환했습니다.`);
    saveIssueCollection(`${languageName(activeWriteLocale)} 이슈 입력란으로 전환했습니다.`);
  };

  const loadSupabaseContent = async (): Promise<void> => {
    const snapshot = await fetchSupabaseSnapshot().catch(() => null);

    if (!snapshot || !Array.isArray(snapshot.articles) || !Array.isArray(snapshot.issueProjects)) {
      return;
    }

    const nextArticles = snapshot.articles.map((article) => normalizeArticle(article as Partial<AdminArticle>));
    const nextIssues = normalizeIssueCollection(snapshot.issueProjects);

    if (nextArticles.length === 0 || nextIssues.length === 0) {
      return;
    }

    const nextVersion = contentHashClient(`${JSON.stringify(nextArticles)}|${JSON.stringify(nextIssues)}`);
    const hasLocalDraft = window.localStorage.getItem(storageKey) !== null || window.localStorage.getItem(issueStorageKey) !== null;
    const draftVersion = window.localStorage.getItem(articleSourceVersionKey) || window.localStorage.getItem(issueSourceVersionKey) || "";

    if (hasLocalDraft && draftVersion && draftVersion !== nextVersion && !window.confirm("Supabase에 더 최신 콘텐츠가 있습니다. 브라우저 임시 저장을 덮어쓰고 불러올까요?")) {
      setStatus("Supabase 콘텐츠를 발견했지만 브라우저 임시 저장을 유지했습니다.");
      setIssueStatus("Supabase 콘텐츠를 발견했지만 브라우저 임시 저장을 유지했습니다.");
      return;
    }

    adminArticles = nextArticles;
    adminIssues = nextIssues;
    adminIssue = adminIssues[0] || fallbackIssue();
    currentIndex = 0;
    currentIssueIndex = 0;
    sourceVersion = nextVersion;
    writer.dataset.writeContentVersion = nextVersion;
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(issueStorageKey);
    window.localStorage.setItem(articleSourceVersionKey, nextVersion);
    window.localStorage.setItem(issueSourceVersionKey, nextVersion);
    applyIssue(0);
    applyArticle(0);
    setStatus(`Supabase 최신 콘텐츠를 불러왔습니다.${snapshot.updatedAt ? ` (${new Date(snapshot.updatedAt).toLocaleString()})` : ""}`);
    setIssueStatus("Supabase published snapshot을 기준으로 이슈를 불러왔습니다.");
  };

  updateLocaleControls();
  applyIssue(0);
  applyArticle(0);
  void loadSupabaseContent();

  writer.addEventListener("keydown", (event) => {
    void handleEditorKeydown(event);
  });
  writer.addEventListener("focusin", (event) => {
    rememberWriteBlock(event.target);
  });
  writer.addEventListener("pointerdown", (event) => {
    rememberWriteBlock(event.target);
  });
  writer.addEventListener("input", (event) => {
    const target = event.target;

    if (target instanceof HTMLInputElement && target.matches("[data-admin-search-input]")) {
      activeArticleSearch = target.value;
      renderAdminList();
      return;
    }

    if (target instanceof HTMLElement && target.closest("[data-write-issue-editor]")) {
      scheduleIssueSave();
      return;
    }

    scheduleSave();
  });
  writer.addEventListener("change", (event) => {
    const target = event.target;

    if (target instanceof HTMLSelectElement && target.matches("[data-write-issue-list]")) {
      adminIssues[currentIssueIndex] = formIssue();
      applyIssue(Number(target.value || 0));
      saveIssueCollection("선택한 이슈를 불러왔습니다.");
      return;
    }

    if (target instanceof HTMLSelectElement && target.matches("[data-admin-filter-select]")) {
      adminArticles[currentIndex] = formArticle();
      activeCategoryFilter = target.value || "all";

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

    const modeButton = target.closest<HTMLButtonElement>("[data-write-mode-button]");

    if (modeButton) {
      setWriteMode(modeButton.dataset.writeModeButton === "issue" ? "issue" : "article");
      return;
    }

    const localeButton = target.closest<HTMLButtonElement>("[data-write-locale-button]");

    if (localeButton) {
      switchWriteLocale(localeButton.dataset.writeLocaleButton === "en" ? "en" : "ko");
      return;
    }

    const issueListItem = target.closest<HTMLElement>("[data-write-issue-index]");

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
      const duplicateIssue = normalizeIssue(JSON.parse(JSON.stringify(adminIssues[currentIssueIndex])) as AdminIssueProject);
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

    const issueFeatureCard = target.closest<HTMLElement>("[data-write-issue-feature]");

    const issueFeatureVisual = target.closest<HTMLElement>("[data-write-issue-feature-preview]");

    if (target.closest("[data-write-issue-feature-add-after]") && issueFeatureCard) {
      adminIssue = formIssue();
      const featureIndex = Array.from(issueFeatures?.querySelectorAll<HTMLElement>("[data-write-issue-feature]") || []).indexOf(issueFeatureCard);
      const nextFeature = fallbackIssueFeature();
      nextFeature.slug = `scene-${adminIssue.features.length + 1}`;
      nextFeature.title.ko = `새 이슈 장면 ${adminIssue.features.length + 1}`;
      nextFeature.title.en = `New Issue Scene ${adminIssue.features.length + 1}`;

      if (featureIndex >= 0) {
        adminIssue.features.splice(featureIndex + 1, 0, nextFeature);
      } else {
        adminIssue.features.push(nextFeature);
      }

      adminIssues[currentIssueIndex] = adminIssue;
      applyIssue(currentIssueIndex);
      saveIssueCollection("이슈 장면을 추가했습니다.");
      return;
    }

    if (issueFeatureVisual && issueFeatureCard) {
      const nextVisual = cycleSelectVisual(issueFeatureCard.querySelector<HTMLSelectElement>('[data-write-issue-feature-field="heroClass"]'), clickDirection(event, issueFeatureVisual));
      setImageBlockVisual(issueFeatureVisual.querySelector<HTMLElement>(".image-block") || issueFeatureVisual, nextVisual);
      scheduleIssueSave();
      return;
    }

    if (target.closest("[data-write-issue-feature-remove]") && issueFeatureCard) {
      adminIssue = formIssue();
      const featureIndex = Array.from(issueFeatures?.querySelectorAll<HTMLElement>("[data-write-issue-feature]") || []).indexOf(issueFeatureCard);

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

    const issueCreditCard = target.closest<HTMLElement>("[data-write-issue-credit]");

    if (target.closest("[data-write-issue-credit-add-after]") && issueCreditCard) {
      adminIssue = formIssue();
      const creditIndex = Array.from(issueCredits?.querySelectorAll<HTMLElement>("[data-write-issue-credit]") || []).indexOf(issueCreditCard);
      const nextCredit = { label: { ko: "크레딧", en: "Credit" }, value: { ko: "이름", en: "Name" } };

      if (creditIndex >= 0) {
        adminIssue.credits.splice(creditIndex + 1, 0, nextCredit);
      } else {
        adminIssue.credits.push(nextCredit);
      }

      adminIssues[currentIssueIndex] = adminIssue;
      applyIssue(currentIssueIndex);
      saveIssueCollection("이슈 크레딧을 추가했습니다.");
      return;
    }

    if (target.closest("[data-write-issue-credit-remove]") && issueCreditCard) {
      adminIssue = formIssue();
      const creditIndex = Array.from(issueCredits?.querySelectorAll<HTMLElement>("[data-write-issue-credit]") || []).indexOf(issueCreditCard);

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
      } catch {
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

    const section = target.closest<HTMLElement>("[data-write-section]");
    const gallery = target.closest<HTMLElement>("[data-write-section-gallery]");
    const galleryItem = target.closest<HTMLElement>("[data-write-gallery-item]");

    const heroVisual = target.closest<HTMLElement>("[data-write-hero-preview]");
    if (heroVisual) {
      writer.querySelector<HTMLInputElement>("[data-write-hero-image-file]")?.click();
      return;
    }

    const galleryVisual = target.closest<HTMLElement>("[data-write-gallery-image-preview]");
    if (galleryVisual && galleryItem) {
      galleryItem.querySelector<HTMLInputElement>("[data-write-gallery-image-file]")?.click();
      return;
    }

    if (target.closest("[data-write-gallery-image-button]") && galleryItem) {
      galleryItem.querySelector<HTMLInputElement>("[data-write-gallery-image-file]")?.click();
      return;
    }

    if (target.closest("[data-write-gallery-image-url]") && galleryItem) {
      if (promptGalleryImage(galleryItem)) {
        scheduleSave();
      }

      return;
    }

    if (target.closest("[data-write-gallery-image-file-button]") && galleryItem) {
      galleryItem.querySelector<HTMLInputElement>("[data-write-gallery-image-file]")?.click();
      return;
    }

    if (target.closest("[data-write-gallery-image-use-visual]") && galleryItem) {
      const imageInput = galleryItem.querySelector<HTMLInputElement>("[data-write-gallery-image]");

      if (imageInput) {
        imageInput.value = "";
      }

      scheduleSave();
      return;
    }

    if (target.closest("[data-write-gallery-image-remove]") && galleryItem) {
      const items = Array.from(galleryItem.parentElement?.querySelectorAll<HTMLElement>("[data-write-gallery-item]") || []);

      if (items.length > 1) {
        galleryItem.remove();
      } else {
        galleryItem.closest<HTMLElement>("[data-write-section-gallery]")?.remove();
      }

      scheduleSave();
      return;
    }

    if (target.closest("[data-write-gallery-add-image]") && gallery) {
      const visualClass = section?.querySelector<HTMLSelectElement>("[data-write-section-rail-class]")?.value || metaValue("heroClass") || "image-material";
      const items = gallery.querySelector<HTMLElement>("[data-write-gallery-items]");
      items?.append(createGalleryItem(visualClass, ""));
      scheduleSave();
      return;
    }

    if (target.closest("[data-write-gallery-remove]") && gallery) {
      gallery.remove();
      scheduleSave();
      return;
    }

    const railVisual = target.closest<HTMLElement>("[data-write-section-rail-preview]");
    if (railVisual && section) {
      section.querySelector<HTMLInputElement>("[data-write-section-rail-image-file]")?.click();
      return;
    }

    const sectionVisual = target.closest<HTMLElement>("[data-write-section-image-preview]");
    if (sectionVisual && section) {
      section.querySelector<HTMLInputElement>("[data-write-section-image-file]")?.click();
      return;
    }

    if (target.closest("[data-write-section-rail-image-button]") && section) {
      const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-image]");
      const hiddenInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]");
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
      const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-image]");
      const hiddenInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]");

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
      const hiddenInput = section.querySelector<HTMLInputElement>("[data-write-section-rail-hidden]");

      if (hiddenInput) {
        hiddenInput.value = hiddenInput.value === "true" ? "false" : "true";
      }

      scheduleSave();
      return;
    }

    if (target.closest("[data-write-section-image-button]") && section) {
      section.querySelector<HTMLInputElement>("[data-write-section-image-file]")?.click();
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
      section.querySelector<HTMLInputElement>("[data-write-section-image-file]")?.click();
      return;
    }

    if (target.closest("[data-write-section-image-use-visual]") && section) {
      const imageInput = section.querySelector<HTMLInputElement>("[data-write-section-image]");
      const enabledInput = section.querySelector<HTMLInputElement>("[data-write-section-image-enabled]");

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
      const enabledInput = section.querySelector<HTMLInputElement>("[data-write-section-image-enabled]");

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
      const paragraph = createParagraph("새 문단을 입력하세요.");
      insertBlockAtSelection(section, paragraph);
      focusEditableEnd(paragraph);
      scheduleSave();
      return;
    }

    if (target.closest("[data-write-add-quote]") && section) {
      const quote = createSectionQuote(activeWriteLocale === "ko" ? "인용문을 입력하세요." : "Write the pull quote.");
      insertBlockAtSelection(section, quote);
      focusEditableEnd(quote);
      scheduleSave();
      return;
    }

    if (target.closest("[data-write-add-gallery]") && section) {
      const visualClass = section.querySelector<HTMLSelectElement>("[data-write-section-rail-class]")?.value || metaValue("heroClass") || "image-material";
      insertBlockAtSelection(section, createGalleryBlock([{ imageClass: visualClass, image: "" }], ""));
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
      } catch {
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

function updateScrollState(): void {
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
    document.querySelectorAll<HTMLElement>("[data-scroll-motion]").forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const shift = Math.max(-1, Math.min(1, (itemCenter - viewportCenter) / window.innerHeight));
      item.style.setProperty("--scroll-shift", shift.toFixed(3));
      item.style.setProperty("--scroll-visibility", Math.max(0, 1 - Math.abs(shift) * 1.55).toFixed(3));
    });
  }
}

function requestScrollState(): void {
  if (scrollFrame === 0) {
    scrollFrame = window.requestAnimationFrame(updateScrollState);
  }
}

let revealObserver: IntersectionObserver | null = null;

function initRevealItems(root: ParentNode, reset = false): void {
  if (reset && revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  const revealItems = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));

  if (revealItems.length === 0) {
    return;
  }

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach((item) => {
      item.dataset.revealReady = "true";
      item.classList.add("is-visible");
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const target = entry.target as HTMLElement;
          target.classList.add("is-visible");
          revealObserver?.unobserve(target);
        });
      },
      { rootMargin: "0px 0px -12%" }
    );
  }

  revealItems.forEach((item) => {
    if (item.dataset.revealReady === "true" || item.classList.contains("is-visible")) {
      item.dataset.revealReady = "true";
      return;
    }

    item.dataset.revealReady = "true";
    revealObserver?.observe(item);
  });
}

updateScrollState();
window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState);

initRevealItems(document);

function initActionSurfaces(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(
    [
      "[data-action-card]",
      ".home-index-row",
      ".home-issue-link",
      ".home-story-more",
      ".issue-toc-row",
      ".issue-feature-row",
      ".filter-button",
      ".subcategory-filter a",
      ".subcategory-chips a"
    ].join(", ")
  ).forEach((surface) => {
    if (surface.dataset.actionSurfaceReady === "true") {
      return;
    }

    surface.dataset.actionSurfaceReady = "true";
    let clearTimer = 0;
    const clearTimerIfNeeded = (): void => {
      if (clearTimer !== 0) {
        window.clearTimeout(clearTimer);
        clearTimer = 0;
      }
    };
    const activate = (): void => {
      clearTimerIfNeeded();
      surface.classList.add("is-action-active");
    };
    const deactivate = (delay = 0): void => {
      clearTimerIfNeeded();

      if (delay === 0) {
        surface.classList.remove("is-action-active");
        return;
      }

      clearTimer = window.setTimeout(() => {
        clearTimer = 0;
        surface.classList.remove("is-action-active");
      }, delay);
    };

    surface.addEventListener("pointerenter", activate);
    surface.addEventListener("pointerleave", () => deactivate());
    surface.addEventListener("focusin", activate);
    surface.addEventListener("focusout", () => deactivate());
    surface.addEventListener("pointerdown", () => {
      activate();
      deactivate(900);
    });
    surface.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      activate();
      deactivate(900);
    });
  });
}

function initHabitusBoards(root: ParentNode): void {
  if (reduceMotion) {
    return;
  }

  root.querySelectorAll<HTMLElement>("[data-habitus-board]").forEach((board) => {
    if (board.dataset.habitusInteractionReady === "true") {
      return;
    }

    board.dataset.habitusInteractionReady = "true";
    let clearTimer = 0;

    const clearHabitusDrift = (): void => {
      if (clearTimer !== 0) {
        window.clearTimeout(clearTimer);
        clearTimer = 0;
      }

      board.classList.remove("is-interacting");
      [
        "--habitus-experience-x",
        "--habitus-experience-y",
        "--habitus-repeat-x",
        "--habitus-repeat-y",
        "--habitus-lens-x",
        "--habitus-lens-y",
        "--habitus-choice-y"
      ].forEach((property) => board.style.removeProperty(property));
    };

    const setHabitusDrift = (event: PointerEvent): void => {
      const rect = board.getBoundingClientRect();
      const x = rect.width === 0 ? 0 : Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      const y = rect.height === 0 ? 0 : Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      const lift = -2 + y * 1.5;

      board.classList.add("is-interacting");
      board.style.setProperty("--habitus-experience-x", `${(-7 + x * 2).toFixed(2)}px`);
      board.style.setProperty("--habitus-experience-y", `${lift.toFixed(2)}px`);
      board.style.setProperty("--habitus-repeat-x", `${(7 + x * 2).toFixed(2)}px`);
      board.style.setProperty("--habitus-repeat-y", `${lift.toFixed(2)}px`);
      board.style.setProperty("--habitus-lens-x", `${(x * 2).toFixed(2)}px`);
      board.style.setProperty("--habitus-lens-y", `${(-3 + y).toFixed(2)}px`);
      board.style.setProperty("--habitus-choice-y", `${(5 + Math.max(0, y) * 2).toFixed(2)}px`);
    };

    const holdHabitusDrift = (): void => {
      if (clearTimer !== 0) {
        window.clearTimeout(clearTimer);
      }

      clearTimer = window.setTimeout(clearHabitusDrift, 1200);
    };

    board.addEventListener("pointerenter", setHabitusDrift);
    board.addEventListener("pointermove", setHabitusDrift);
    board.addEventListener("pointerdown", (event) => {
      setHabitusDrift(event);
      holdHabitusDrift();
    });
    board.addEventListener("pointerleave", clearHabitusDrift);
    board.addEventListener("pointercancel", clearHabitusDrift);
    board.addEventListener("blur", clearHabitusDrift);
  });
}

function runtimeInitArchiveInteractions(root: ParentNode, locale: RuntimeLocale): void {
  const previewRows = Array.from(root.querySelectorAll<HTMLElement>("[data-preview-class]"));
  const previewImage = root.querySelector<HTMLElement>("[data-archive-preview-image]");
  const previewKicker = root.querySelector<HTMLElement>("[data-archive-preview-kicker]");
  const previewTitle = root.querySelector<HTMLElement>("[data-archive-preview-title]");
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
      if (row.dataset.archivePreviewReady === "true") {
        return;
      }

      row.dataset.archivePreviewReady = "true";
      row.addEventListener("pointerenter", () => setArchivePreview?.(row));
      row.addEventListener("focus", () => setArchivePreview?.(row));
    });

    setArchivePreview(previewRows[0]);
  }

  const filterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const filterPanels = root.querySelectorAll<HTMLElement>("[data-filter-panel]");
  const filterStatus = root.querySelector<HTMLElement>("[data-filter-status]");
  const archiveBoard = root.querySelector<HTMLElement>("[data-archive-board]");

  if (filterButtons.length === 0) {
    return;
  }

  const applyFilter = (button: HTMLButtonElement, updateUrl = true): void => {
    const selectedCategory = button.dataset.filter || "all";
    const selectedLabel = button.dataset.filterLabel || button.textContent?.trim() || selectedCategory;
    const visibleRows: HTMLElement[] = [];

    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

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
      filterStatus.textContent = `${selectedLabel} · ${visibleRows.length} ${locale === "ko" ? "개의 글 표시 중" : "articles showing"}`;
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
    if (button.dataset.runtimeFilterReady === "true") {
      return;
    }

    button.dataset.runtimeFilterReady = "true";
    button.addEventListener("click", () => applyFilter(button));
  });

  const initialCategory = new URLSearchParams(window.location.search).get("category");
  const initialButton = filterButtons.find((button) => button.dataset.filter === initialCategory);
  const allButton = filterButtons.find((button) => button.dataset.filter === "all");
  const fallbackButton = initialButton || allButton || filterButtons[0];

  if (fallbackButton) {
    applyFilter(fallbackButton, false);
  }
}

function runtimeInitScrollSections(root: ParentNode): void {
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-scroll-section]"));

  if (sections.length === 0) {
    return;
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-current-section", entry.isIntersecting);
        });
      },
      { rootMargin: "-34% 0px -48%" }
    );

    sections.forEach((section) => {
      if (section.dataset.scrollSectionReady === "true") {
        return;
      }

      section.dataset.scrollSectionReady = "true";
      sectionObserver.observe(section);
    });

    return;
  }

  sections.forEach((section) => section.classList.add("is-current-section"));
}

initActionSurfaces(document);
initHabitusBoards(document);

const previewRows = document.querySelectorAll<HTMLElement>("[data-preview-class]");
const previewImage = document.querySelector<HTMLElement>("[data-archive-preview-image]");
const previewKicker = document.querySelector<HTMLElement>("[data-archive-preview-kicker]");
const previewTitle = document.querySelector<HTMLElement>("[data-archive-preview-title]");
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

document.querySelectorAll<HTMLSelectElement>("[data-navigation-select]").forEach((select) => {
  select.addEventListener("change", () => {
    if (!select.value) {
      return;
    }

    const nextPath = select.value.startsWith("/") && clientBasePath && !select.value.startsWith(`${clientBasePath}/`) ? `${clientBasePath}${select.value}` : select.value;

    if (nextPath !== window.location.pathname) {
      window.location.href = nextPath;
    }
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

void hydrateRuntimeContent();
