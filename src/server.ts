import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { renderArchivePage, renderArticlePage, renderHomePage, renderIssuePage, renderNotFoundPage, renderWritePage } from "./render/pages";
import type { Article, Locale, PrimaryCategory, SubcategoryKey } from "./types";

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = path.resolve(__dirname, "..");
const contentFilePath = path.join(projectRoot, "src", "content", "magazine.ts");

const getLocale = (requestPath: string, queryValue?: unknown): Locale =>
  requestPath === "/en" || requestPath.startsWith("/en/") || queryValue === "en" ? "en" : "ko";

const getCurrentPath = (originalUrl: string): string => {
  const url = new URL(originalUrl, "http://localhost");
  url.searchParams.delete("lang");
  const pathname = url.pathname === "/en" ? "/" : url.pathname.replace(/^\/en(?=\/)/, "");
  const query = url.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ""}${url.hash}`;
};

const isPrimaryCategory = (value: unknown): value is PrimaryCategory =>
  typeof value === "string" && site.categories.some((category) => category.key === value);

const isSubcategory = (categoryKey: PrimaryCategory | undefined, value: unknown): value is SubcategoryKey =>
  typeof value === "string" && Boolean(site.categories.find((category) => category.key === categoryKey)?.subcategories.some((subcategory) => subcategory.key === value));

const isArticleArray = (value: unknown): value is Article[] =>
  Array.isArray(value) && value.every((article) => typeof article === "object" && article !== null && typeof (article as { slug?: unknown }).slug === "string");

const writeArticlesToContentFile = async (nextArticles: Article[]): Promise<void> => {
  const source = await fs.readFile(contentFilePath, "utf8");
  const startMarker = "export const articles: Article[] = ";
  const endMarker = "\n\nexport const issueProject";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  if (start === -1 || end === -1) {
    throw new Error("Could not find articles block in content file");
  }

  const nextSource = `${source.slice(0, start)}${startMarker}${JSON.stringify(nextArticles, null, 2)};${source.slice(end)}`;
  await fs.writeFile(contentFilePath, nextSource, "utf8");
};

app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(projectRoot, "public")));
app.use("/client.js", express.static(path.join(projectRoot, "dist", "client.js")));

app.get(["/", "/en", "/en/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderHomePage(site, articles, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/issues", "/issues/", "/en/issues", "/en/issues/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderIssuePage(site, articles, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/write", "/write/", "/en/write", "/en/write/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderWritePage(site, articles, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/archive", "/archive/:category", "/archive/:category/:subcategory", "/en/archive", "/en/archive/:category", "/en/archive/:category/:subcategory"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const pathCategory = request.params.category;
  const pathSubcategory = request.params.subcategory;
  const queryCategory = request.query.category;
  const selectedCategory = isPrimaryCategory(pathCategory) ? pathCategory : isPrimaryCategory(queryCategory) ? queryCategory : undefined;
  const selectedSubcategory = isSubcategory(selectedCategory, pathSubcategory) ? pathSubcategory : undefined;

  if ((pathCategory && !selectedCategory) || (pathSubcategory && !selectedSubcategory)) {
    response.status(404).send(renderNotFoundPage(site, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  response.send(renderArchivePage(site, articles, locale, getCurrentPath(request.originalUrl), selectedCategory, selectedSubcategory));
});

app.get(["/articles/:slug", "/en/articles/:slug"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  const article = articles.find((item) => item.slug === request.params.slug);

  if (!article) {
    response.status(404).send(renderNotFoundPage(site, locale, getCurrentPath(request.originalUrl)));
    return;
  }

  const relatedArticles = articles.filter((item) => item.slug !== article.slug).slice(0, 3);
  response.send(renderArticlePage(site, article, relatedArticles, locale, getCurrentPath(request.originalUrl)));
});

app.get("/api/articles", (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.json({ locale, articles });
});

app.post("/api/admin/articles", async (request, response) => {
  const nextArticles = (request.body as { articles?: unknown }).articles;

  if (!isArticleArray(nextArticles)) {
    response.status(400).json({ ok: false, message: "Invalid articles payload" });
    return;
  }

  try {
    await writeArticlesToContentFile(nextArticles);
    response.json({ ok: true, path: contentFilePath });
  } catch (error) {
    response.status(500).json({ ok: false, message: error instanceof Error ? error.message : "Save failed" });
  }
});

app.use((request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.status(404).send(renderNotFoundPage(site, locale, getCurrentPath(request.originalUrl)));
});

app.listen(port, () => {
  console.log(`The Thing running at http://localhost:${port}`);
});
