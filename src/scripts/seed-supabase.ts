import { articles, site } from "../content/magazine";
import { supabasePublicConfig } from "../config/supabase";

interface SupabaseError {
  message?: string;
  details?: string;
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey || serviceRoleKey === "replace-with-local-only-service-role-key") {
  throw new Error("Set SUPABASE_SERVICE_ROLE_KEY in your local environment before seeding Supabase.");
}

const request = async (path: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(`${supabasePublicConfig.url}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null) as SupabaseError | null;
    throw new Error(error?.message || error?.details || `Supabase request failed: ${response.status}`);
  }

  return response;
};

const upsertRows = async (table: string, rows: unknown[], onConflict: string): Promise<void> => {
  await request(`/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows)
  });
};

const main = async (): Promise<void> => {
  const articleRows = articles.map((article, index) => ({
    slug: article.slug,
    position: index,
    data: article
  }));
  const issueRows = site.issueProjects.map((issue, index) => ({
    number: issue.number,
    position: index,
    data: issue
  }));

  await upsertRows("articles", articleRows, "slug");
  await upsertRows("issues", issueRows, "number");
  await upsertRows("content_snapshots", [{
    id: "published",
    data: {
      articles,
      issueProjects: site.issueProjects
    },
    published_at: new Date().toISOString()
  }], "id");

  console.log(`Seeded ${articleRows.length} articles and ${issueRows.length} issues to ${supabasePublicConfig.url}`);
};

void main();
