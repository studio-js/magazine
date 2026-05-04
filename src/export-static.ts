import fs from "node:fs/promises";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { loadPublishedContent } from "./content/runtime";
import { issueSlug, renderAboutPage, renderArchivePage, renderArticlePage, renderHomePage, renderIssueCollectionPage, renderIssuePage, renderNotFoundPage, renderWritePage } from "./render/pages";
import type { Article, Locale, SiteContent } from "./types";

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "docs");
const publicDir = path.join(projectRoot, "public");
const distClient = path.join(projectRoot, "dist", "client.js");
const basePath = process.env.BASE_PATH ?? "/magazine";
const pageSize = 5;
let exportSite: SiteContent = site;
let exportArticles: Article[] = articles;

const pageCount = (itemCount: number): number => Math.max(1, Math.ceil(itemCount / pageSize));

const ensureDir = async (dirPath: string): Promise<void> => {
  await fs.mkdir(dirPath, { recursive: true });
};

const prefixAbsoluteUrls = (html: string): string =>
  basePath
    ? html.replace(/(href|src)="\/(?!\/)/g, `$1="${basePath}/`)
    : html;

const prefixCssUrls = (css: string): string =>
  basePath ? css.replace(/url\("\/(?!\/)/g, `url("${basePath}/`) : css;

const writeHtml = async (relativePath: string, html: string): Promise<void> => {
  const filePath = path.join(outputDir, relativePath);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, prefixAbsoluteUrls(html), "utf8");
};

const writeLocalizedPages = async (locale: Locale): Promise<void> => {
  const prefix = locale === "en" ? "en/" : "";

  await writeHtml(`${prefix}index.html`, renderHomePage(exportSite, exportArticles, locale, "/"));
  await writeHtml(`${prefix}issues/index.html`, renderIssueCollectionPage(exportSite, locale, "/issues"));
  await writeHtml(`${prefix}about/index.html`, renderAboutPage(exportSite, locale, "/about"));
  await writeHtml(`${prefix}write/index.html`, renderWritePage(exportSite, exportArticles, locale, "/write"));
  await writeHtml(`${prefix}archive/index.html`, renderArchivePage(exportSite, exportArticles, locale, "/archive"));

  await Promise.all(
    Array.from({ length: pageCount(exportSite.issueProjects.length) - 1 }, (_, index) => index + 2).map((page) =>
      writeHtml(`${prefix}issues/page/${page}/index.html`, renderIssueCollectionPage(exportSite, locale, `/issues/page/${page}/`, page))
    )
  );

  await Promise.all(
    Array.from({ length: pageCount(exportArticles.length) - 1 }, (_, index) => index + 2).map((page) =>
      writeHtml(`${prefix}archive/page/${page}/index.html`, renderArchivePage(exportSite, exportArticles, locale, `/archive/page/${page}/`, undefined, undefined, page))
    )
  );

  await Promise.all(
    exportSite.issueProjects.map((issue) =>
      writeHtml(
        `${prefix}issues/${issueSlug(issue)}/index.html`,
        renderIssuePage(exportSite, exportArticles, locale, `/issues/${issueSlug(issue)}/`, issue)
      )
    )
  );

  await Promise.all(
    exportSite.categories.map((category) =>
      writeHtml(
        `${prefix}archive/${category.key}/index.html`,
        renderArchivePage(exportSite, exportArticles, locale, `/archive/${category.key}/`, category.key)
      )
    )
  );

  await Promise.all(
    exportSite.categories.flatMap((category) => {
      const count = exportArticles.filter((article) => article.category === category.key).length;
      return Array.from({ length: pageCount(count) - 1 }, (_, index) => index + 2).map((page) =>
        writeHtml(
          `${prefix}archive/${category.key}/page/${page}/index.html`,
          renderArchivePage(exportSite, exportArticles, locale, `/archive/${category.key}/page/${page}/`, category.key, undefined, page)
        )
      );
    })
  );

  await Promise.all(
    exportSite.categories.flatMap((category) =>
      category.subcategories.map((subcategory) =>
        writeHtml(
          `${prefix}archive/${category.key}/${subcategory.key}/index.html`,
          renderArchivePage(exportSite, exportArticles, locale, `/archive/${category.key}/${subcategory.key}/`, category.key, subcategory.key)
        )
      )
    )
  );

  await Promise.all(
    exportSite.categories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) => {
        const count = exportArticles.filter((article) => article.category === category.key && article.subcategoryKeys.some((key) => key === subcategory.key)).length;
        return Array.from({ length: pageCount(count) - 1 }, (_, index) => index + 2).map((page) =>
          writeHtml(
            `${prefix}archive/${category.key}/${subcategory.key}/page/${page}/index.html`,
            renderArchivePage(exportSite, exportArticles, locale, `/archive/${category.key}/${subcategory.key}/page/${page}/`, category.key, subcategory.key, page)
          )
        );
      })
    )
  );

  for (const article of exportArticles) {
    await writeHtml(
      `${prefix}articles/${article.slug}/index.html`,
      renderArticlePage(exportSite, article, exportArticles.filter((item) => item.slug !== article.slug).slice(0, 3), locale, `/articles/${article.slug}`, exportArticles)
    );
  }
};

const main = async (): Promise<void> => {
  await fs.rm(outputDir, { recursive: true, force: true });
  await ensureDir(outputDir);
  await fs.cp(publicDir, outputDir, { recursive: true });
  await fs.copyFile(distClient, path.join(outputDir, "client.js"));
  await fs.writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");

  const cssPath = path.join(outputDir, "styles.css");
  const css = await fs.readFile(cssPath, "utf8");
  await fs.writeFile(cssPath, prefixCssUrls(css), "utf8");

  const content = await loadPublishedContent(site, articles);
  exportSite = content.site;
  exportArticles = content.articles;

  if (content.source === "supabase") {
    console.log(`Using Supabase content snapshot${content.updatedAt ? ` updated at ${content.updatedAt}` : ""}`);
  }

  await writeLocalizedPages("ko");
  await writeLocalizedPages("en");
  await writeHtml("404.html", renderNotFoundPage(exportSite, "ko", "/404"));

  console.log(`Static export written to ${outputDir}`);
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
