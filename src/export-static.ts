import fs from "node:fs/promises";
import path from "node:path";
import { articles, site } from "./content/magazine";
import { renderArchivePage, renderArticlePage, renderHomePage, renderNotFoundPage } from "./render/pages";
import type { Locale } from "./types";

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "docs");
const publicDir = path.join(projectRoot, "public");
const distClient = path.join(projectRoot, "dist", "client.js");
const basePath = process.env.BASE_PATH ?? "/magazine";

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
  await writeHtml(`${prefix}archive/index.html`, renderArchivePage(site, articles, locale, "/archive"));

  await Promise.all(
    articles.map((article) =>
      writeHtml(
        `${prefix}articles/${article.slug}/index.html`,
        renderArticlePage(site, article, articles.filter((item) => item.slug !== article.slug).slice(0, 3), locale, `/articles/${article.slug}`)
      )
    )
  );
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
