import fs from "node:fs/promises";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { issueSlug, renderAboutPage, renderArchivePage, renderArticlePage, renderHomePage, renderIssueCollectionPage, renderIssuePage, renderNotFoundPage, renderWritePage } from "./render/pages";
import type { Locale } from "./types";

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "docs");
const publicDir = path.join(projectRoot, "public");
const distClient = path.join(projectRoot, "dist", "client.js");
const basePath = process.env.BASE_PATH ?? "/magazine";
const pageSize = 5;

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

  await writeHtml(`${prefix}index.html`, renderHomePage(site, articles, locale, "/"));
  await writeHtml(`${prefix}issues/index.html`, renderIssueCollectionPage(site, locale, "/issues"));
  await writeHtml(`${prefix}about/index.html`, renderAboutPage(site, locale, "/about"));
  await writeHtml(`${prefix}write/index.html`, renderWritePage(site, articles, locale, "/write"));
  await writeHtml(`${prefix}archive/index.html`, renderArchivePage(site, articles, locale, "/archive"));

  await Promise.all(
    Array.from({ length: pageCount(site.issueProjects.length) - 1 }, (_, index) => index + 2).map((page) =>
      writeHtml(`${prefix}issues/page/${page}/index.html`, renderIssueCollectionPage(site, locale, `/issues/page/${page}/`, page))
    )
  );

  await Promise.all(
    Array.from({ length: pageCount(articles.length) - 1 }, (_, index) => index + 2).map((page) =>
      writeHtml(`${prefix}archive/page/${page}/index.html`, renderArchivePage(site, articles, locale, `/archive/page/${page}/`, undefined, undefined, page))
    )
  );

  await Promise.all(
    site.issueProjects.map((issue) =>
      writeHtml(
        `${prefix}issues/${issueSlug(issue)}/index.html`,
        renderIssuePage(site, articles, locale, `/issues/${issueSlug(issue)}/`, issue)
      )
    )
  );

  await Promise.all(
    site.categories.map((category) =>
      writeHtml(
        `${prefix}archive/${category.key}/index.html`,
        renderArchivePage(site, articles, locale, `/archive/${category.key}/`, category.key)
      )
    )
  );

  await Promise.all(
    site.categories.flatMap((category) => {
      const count = articles.filter((article) => article.category === category.key).length;
      return Array.from({ length: pageCount(count) - 1 }, (_, index) => index + 2).map((page) =>
        writeHtml(
          `${prefix}archive/${category.key}/page/${page}/index.html`,
          renderArchivePage(site, articles, locale, `/archive/${category.key}/page/${page}/`, category.key, undefined, page)
        )
      );
    })
  );

  await Promise.all(
    site.categories.flatMap((category) =>
      category.subcategories.map((subcategory) =>
        writeHtml(
          `${prefix}archive/${category.key}/${subcategory.key}/index.html`,
          renderArchivePage(site, articles, locale, `/archive/${category.key}/${subcategory.key}/`, category.key, subcategory.key)
        )
      )
    )
  );

  await Promise.all(
    site.categories.flatMap((category) =>
      category.subcategories.flatMap((subcategory) => {
        const count = articles.filter((article) => article.category === category.key && article.subcategoryKeys.some((key) => key === subcategory.key)).length;
        return Array.from({ length: pageCount(count) - 1 }, (_, index) => index + 2).map((page) =>
          writeHtml(
            `${prefix}archive/${category.key}/${subcategory.key}/page/${page}/index.html`,
            renderArchivePage(site, articles, locale, `/archive/${category.key}/${subcategory.key}/page/${page}/`, category.key, subcategory.key, page)
          )
        );
      })
    )
  );

  for (const article of articles) {
    await writeHtml(
      `${prefix}articles/${article.slug}/index.html`,
      renderArticlePage(site, article, articles.filter((item) => item.slug !== article.slug).slice(0, 3), locale, `/articles/${article.slug}`)
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

  await writeLocalizedPages("ko");
  await writeLocalizedPages("en");
  await writeHtml("404.html", renderNotFoundPage(site, "ko", "/404"));

  console.log(`Static export written to ${outputDir}`);
};

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
