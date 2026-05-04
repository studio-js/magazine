import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { loadPublishedContent } from "./content/runtime";
import { issueSlug, renderAboutPage, renderArchivePage, renderArticlePage, renderHomePage, renderIssueCollectionPage, renderIssuePage, renderNotFoundPage, renderWritePage } from "./render/pages";
import type { Article, IssueProject, Locale, PrimaryCategory, SiteContent, SubcategoryKey } from "./types";

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = path.resolve(__dirname, "..");
const contentFilePath = path.join(projectRoot, "src", "content", "magazine.ts");
const uploadsDir = path.join(projectRoot, "public", "uploads");
const localBasePath = "/magazine";
let publishedSite: SiteContent = site;
let publishedArticles: Article[] = articles;
const uploadExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const getLocale = (requestPath: string, queryValue?: unknown): Locale =>
  requestPath === "/en" || requestPath.startsWith("/en/") || queryValue === "en" ? "en" : "ko";

const getCurrentPath = (originalUrl: string): string => {
  const url = new URL(originalUrl, "http://localhost");
  url.pathname = url.pathname.replace(/^\/magazine(?=\/|$)/, "") || "/";
  url.searchParams.delete("lang");
  const pathname = url.pathname === "/en" ? "/" : url.pathname.replace(/^\/en(?=\/)/, "");
  const query = url.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ""}${url.hash}`;
};

const isPrimaryCategory = (value: unknown): value is PrimaryCategory =>
  typeof value === "string" && site.categories.some((category) => category.key === value);

const isSubcategory = (categoryKey: PrimaryCategory | undefined, value: unknown): value is SubcategoryKey =>
  typeof value === "string" && Boolean(site.categories.find((category) => category.key === categoryKey)?.subcategories.some((subcategory) => subcategory.key === value));

void loadPublishedContent(site, articles).then((content) => {
  publishedSite = content.site;
  publishedArticles = content.articles;
  if (content.source === "supabase") {
    console.log(`Using Supabase content snapshot${content.updatedAt ? ` updated at ${content.updatedAt}` : ""}`);
  }
});

const pageFromParam = (value: unknown): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const isArticleArray = (value: unknown): value is Article[] =>
  Array.isArray(value) && value.every((article) => typeof article === "object" && article !== null && typeof (article as { slug?: unknown }).slug === "string");

const isIssueProject = (value: unknown): value is IssueProject =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { number?: unknown }).number === "string" &&
  typeof (value as { title?: unknown }).title === "object" &&
  Array.isArray((value as { features?: unknown }).features) &&
  ((value as { features?: unknown[] }).features?.length ?? 0) > 0;

const safeUploadName = (fileName: string): string => {
  const baseName = path.basename(fileName).replace(/\.[^.]+$/, "");
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";
};

const writeArticlesToContentFile = async (nextArticles: Article[]): Promise<void> => {
  const source = await fs.readFile(contentFilePath, "utf8");
  const startMatch = /export const articles(?:: Article\[])? = /.exec(source);
  const start = startMatch?.index ?? -1;
  const end = start === -1 ? -1 : source.indexOf("\n\nexport const ", start + (startMatch?.[0].length ?? 0));

  if (start === -1 || end === -1) {
    throw new Error("Could not find articles block in content file");
  }

  const nextSource = `${source.slice(0, start)}export const articles = ${JSON.stringify(nextArticles, null, 2)} satisfies Article[];${source.slice(end)}`;
  await fs.writeFile(contentFilePath, nextSource, "utf8");
};

const isIssueProjectArray = (value: unknown): value is IssueProject[] =>
  Array.isArray(value) && value.every(isIssueProject) && value.length > 0;

const writeIssueProjectsToContentFile = async (nextIssues: IssueProject[]): Promise<void> => {
  const source = await fs.readFile(contentFilePath, "utf8");
  const startMatch = /export const issueProjects(?:: IssueProject\[])? = /.exec(source);
  const start = startMatch?.index ?? -1;
  const end = start === -1 ? -1 : source.indexOf("\n\nexport const site", start + (startMatch?.[0].length ?? 0));

  if (start === -1 || end === -1) {
    throw new Error("Could not find issueProjects block in content file");
  }

  const nextSource = `${source.slice(0, start)}export const issueProjects: IssueProject[] = ${JSON.stringify(nextIssues, null, 2)};${source.slice(end)}`;
  await fs.writeFile(contentFilePath, nextSource, "utf8");
};

app.use(express.json({ limit: "18mb" }));
app.use((request, _response, next) => {
  if (request.url === localBasePath || request.url.startsWith(`${localBasePath}/`) || request.url.startsWith(`${localBasePath}?`)) {
    const strippedUrl = request.url.slice(localBasePath.length) || "/";
    request.url = strippedUrl.startsWith("/") ? strippedUrl : `/${strippedUrl}`;
  }

  next();
});
app.use(express.static(path.join(projectRoot, "public")));
app.use("/client.js", express.static(path.join(projectRoot, "dist", "client.js")));

app.get(["/", "/en", "/en/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderHomePage(publishedSite, publishedArticles, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/issues", "/issues/", "/en/issues", "/en/issues/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderIssueCollectionPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/issues/page/:page", "/en/issues/page/:page"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderIssueCollectionPage(publishedSite, locale, getCurrentPath(request.originalUrl), pageFromParam(request.params.page)));
});

app.get(["/issues/:issueSlug", "/en/issues/:issueSlug"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const issue = publishedSite.issueProjects.find((item) => issueSlug(item) === request.params.issueSlug);

  if (!issue) {
    response.status(404).send(renderNotFoundPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  response.send(renderIssuePage(publishedSite, publishedArticles, locale, getCurrentPath(request.originalUrl), issue));
});

app.get(["/about", "/about/", "/en/about", "/en/about/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderAboutPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/write", "/write/", "/en/write", "/en/write/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderWritePage(publishedSite, publishedArticles, locale, getCurrentPath(request.originalUrl)));
});

app.get([
  "/archive/page/:page",
  "/archive/:category/page/:page",
  "/archive/:category/:subcategory/page/:page",
  "/en/archive/page/:page",
  "/en/archive/:category/page/:page",
  "/en/archive/:category/:subcategory/page/:page"
], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const pathCategory = request.params.category;
  const pathSubcategory = request.params.subcategory;
  const selectedCategory = isPrimaryCategory(pathCategory) ? pathCategory : undefined;
  const selectedSubcategory = isSubcategory(selectedCategory, pathSubcategory) ? pathSubcategory : undefined;

  if ((pathCategory && !selectedCategory) || (pathSubcategory && !selectedSubcategory)) {
    response.status(404).send(renderNotFoundPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  response.send(renderArchivePage(publishedSite, publishedArticles, locale, getCurrentPath(request.originalUrl), selectedCategory, selectedSubcategory, pageFromParam(request.params.page)));
});

app.get(["/archive", "/archive/:category", "/archive/:category/:subcategory", "/en/archive", "/en/archive/:category", "/en/archive/:category/:subcategory"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const pathCategory = request.params.category;
  const pathSubcategory = request.params.subcategory;
  const queryCategory = request.query.category;
  const selectedCategory = isPrimaryCategory(pathCategory) ? pathCategory : isPrimaryCategory(queryCategory) ? queryCategory : undefined;
  const selectedSubcategory = isSubcategory(selectedCategory, pathSubcategory) ? pathSubcategory : undefined;

  if ((pathCategory && !selectedCategory) || (pathSubcategory && !selectedSubcategory)) {
    response.status(404).send(renderNotFoundPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  response.send(renderArchivePage(publishedSite, publishedArticles, locale, getCurrentPath(request.originalUrl), selectedCategory, selectedSubcategory));
});

app.get(["/articles/:slug", "/en/articles/:slug"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const article = publishedArticles.find((item) => item.slug === request.params.slug);

  if (!article) {
    response.status(404).send(renderNotFoundPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  const relatedArticles = publishedArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  response.send(renderArticlePage(publishedSite, article, relatedArticles, locale, getCurrentPath(request.originalUrl), publishedArticles));
});

app.get("/api/articles", (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.json({ locale, articles: publishedArticles });
});

app.post("/api/admin/uploads", async (request, response) => {
  const { fileName, dataUrl } = request.body as { fileName?: unknown; dataUrl?: unknown };

  if (typeof fileName !== "string" || typeof dataUrl !== "string") {
    response.status(400).json({ ok: false, message: "Invalid upload payload" });
    return;
  }

  const match = /^data:(image\/(?:gif|jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);

  if (!match) {
    response.status(400).json({ ok: false, message: "Only GIF, JPEG, PNG, and WebP images are supported" });
    return;
  }

  try {
    const [, mimeType, payload] = match;
    const extension = uploadExtensions[mimeType] ?? "jpg";
    const outputName = `${Date.now()}-${safeUploadName(fileName)}.${extension}`;
    const outputPath = path.join(uploadsDir, outputName);

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(outputPath, Buffer.from(payload, "base64"));
    response.json({ ok: true, url: `/uploads/${outputName}` });
  } catch (error) {
    response.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Upload failed" });
  }
});

app.post("/api/admin/articles", async (request, response) => {
  const nextArticles = (request.body as { articles?: unknown }).articles;

  if (!isArticleArray(nextArticles)) {
    response.status(400).json({ ok: false, message: "Invalid articles payload" });
    return;
  }

  try {
    await writeArticlesToContentFile(nextArticles);
    (articles as Article[]).splice(0, articles.length, ...nextArticles);
    publishedArticles = nextArticles;
    response.json({ ok: true, path: contentFilePath, count: nextArticles.length });
  } catch (error) {
    response.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Save failed" });
  }
});

app.post("/api/admin/issue", async (request, response) => {
  const nextIssues = (request.body as { issueProjects?: unknown }).issueProjects;

  if (!isIssueProjectArray(nextIssues)) {
    response.status(400).json({ ok: false, message: "Invalid issues payload" });
    return;
  }

  try {
    await writeIssueProjectsToContentFile(nextIssues);
    site.issueProjects.splice(0, site.issueProjects.length, ...nextIssues);
    publishedSite = { ...publishedSite, issueProjects: nextIssues };
    response.json({ ok: true, path: contentFilePath, count: nextIssues.length, latest: nextIssues[0].number });
  } catch (error) {
    response.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Save failed" });
  }
});

app.use((request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.status(404).send(renderNotFoundPage(publishedSite, locale, getCurrentPath(request.originalUrl)));
});

app.listen(port, () => {
  console.log(`Habitus running at http://localhost:${port}`);
});
