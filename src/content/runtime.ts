import { supabasePublicConfig } from "../config/supabase";
import type { Article, IssueProject, SiteContent } from "../types";

interface PublishedContent {
  articles: Article[];
  site: SiteContent;
  source: "static" | "supabase";
  updatedAt?: string;
}

interface SnapshotRow {
  data?: unknown;
  updated_at?: string;
}

const isArticleArray = (value: unknown): value is Article[] =>
  Array.isArray(value) && value.every((article) => typeof article === "object" && article !== null && typeof (article as { slug?: unknown }).slug === "string");

const isIssueProjectArray = (value: unknown): value is IssueProject[] =>
  Array.isArray(value) && value.every((issue) => typeof issue === "object" && issue !== null && typeof (issue as { number?: unknown }).number === "string");

const fallbackContent = (site: SiteContent, articles: Article[]): PublishedContent => ({
  articles,
  site,
  source: "static"
});

export const loadPublishedContent = async (site: SiteContent, articles: Article[]): Promise<PublishedContent> => {
  if (!supabasePublicConfig.enabled) {
    return fallbackContent(site, articles);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${supabasePublicConfig.url}/rest/v1/content_snapshots?id=eq.published&select=data,updated_at&limit=1`, {
      cache: "no-store",
      headers: {
        apikey: supabasePublicConfig.anonKey,
        Authorization: `Bearer ${supabasePublicConfig.anonKey}`,
        "Cache-Control": "no-cache"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return fallbackContent(site, articles);
    }

    const rows = await response.json() as SnapshotRow[];
    const row = rows[0];
    const data = row?.data as { articles?: unknown; issueProjects?: unknown } | undefined;

    if (!data || !isArticleArray(data.articles) || !isIssueProjectArray(data.issueProjects)) {
      return fallbackContent(site, articles);
    }

    return {
      articles: data.articles,
      site: { ...site, issueProjects: data.issueProjects },
      source: "supabase",
      updatedAt: row.updated_at
    };
  } catch {
    return fallbackContent(site, articles);
  } finally {
    clearTimeout(timeout);
  }
};
