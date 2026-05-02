import express from "express";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { renderArchivePage, renderArticlePage, renderHomePage, renderNotFoundPage } from "./render/pages";
import type { Locale } from "./types";

const app = express();
const port = Number(process.env.PORT) || 3000;
const projectRoot = path.resolve(__dirname, "..");

const getLocale = (requestPath: string, queryValue?: unknown): Locale =>
  requestPath === "/en" || requestPath.startsWith("/en/") || queryValue === "en" ? "en" : "ko";

const getCurrentPath = (originalUrl: string): string => {
  const url = new URL(originalUrl, "http://localhost");
  url.searchParams.delete("lang");
  const pathname = url.pathname === "/en" ? "/" : url.pathname.replace(/^\/en(?=\/)/, "");
  const query = url.searchParams.toString();
  return `${pathname}${query ? `?${query}` : ""}${url.hash}`;
};

app.use(express.static(path.join(projectRoot, "public")));
app.use("/client.js", express.static(path.join(projectRoot, "dist", "client.js")));

app.get(["/", "/en", "/en/"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderHomePage(site, articles, locale, getCurrentPath(request.originalUrl)));
});

app.get(["/archive", "/en/archive"], (request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.send(renderArchivePage(site, articles, locale, getCurrentPath(request.originalUrl)));
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

app.use((request, response) => {
  const locale = getLocale(request.path, request.query.lang);
  response.status(404).send(renderNotFoundPage(site, locale, getCurrentPath(request.originalUrl)));
});

app.listen(port, () => {
  console.log(`The Thing running at http://localhost:${port}`);
});
