import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface ArticleLike {
  slug: string;
}

interface IssueLike {
  number: string;
}

interface SnapshotData {
  articles: ArticleLike[];
  issueProjects: IssueLike[];
}

interface AdminPayload {
  password?: unknown;
  articles?: unknown;
  issueProjects?: unknown;
}

interface DeploymentResult {
  requested: boolean;
  message?: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const adminPassword = Deno.env.get("ADMIN_PASSWORD") || "";
const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";
const githubDispatchToken = Deno.env.get("GITHUB_DISPATCH_TOKEN") || "";
const githubRepository = Deno.env.get("GITHUB_REPOSITORY") || "studio-js/magazine";
const githubWorkflowId = Deno.env.get("GITHUB_WORKFLOW_ID") || "publish-content.yml";
const githubRef = Deno.env.get("GITHUB_REF") || "main";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json"
  }
});

const isArticleArray = (value: unknown): value is ArticleLike[] =>
  Array.isArray(value) && value.every((article) => typeof article === "object" && article !== null && typeof (article as { slug?: unknown }).slug === "string");

const isIssueArray = (value: unknown): value is IssueLike[] =>
  Array.isArray(value) && value.every((issue) => typeof issue === "object" && issue !== null && typeof (issue as { number?: unknown }).number === "string");

const supabaseRequest = async (path: string, init: RequestInit): Promise<Response> => {
  const response = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed: ${response.status}`);
  }

  return response;
};

const readSnapshot = async (): Promise<SnapshotData> => {
  const response = await supabaseRequest("/content_snapshots?id=eq.published&select=data&limit=1", {
    method: "GET"
  });
  const rows = await response.json() as { data?: Partial<SnapshotData> }[];
  const data = rows[0]?.data;

  return {
    articles: isArticleArray(data?.articles) ? data.articles : [],
    issueProjects: isIssueArray(data?.issueProjects) ? data.issueProjects : []
  };
};

const upsertRows = async (table: string, rows: unknown[], onConflict: string): Promise<void> => {
  await supabaseRequest(`/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows)
  });
};

const insertRows = async (table: string, rows: unknown[]): Promise<void> => {
  await supabaseRequest(`/${table}`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(rows)
  });
};

const upsertSnapshot = async (data: SnapshotData): Promise<void> => {
  await upsertRows("content_snapshots", [{
    id: "published",
    data,
    published_at: new Date().toISOString()
  }], "id");
  await insertRows("content_revisions", [{
    snapshot_id: "published",
    data
  }]);
};

const triggerStaticDeploy = async (reason: string): Promise<DeploymentResult> => {
  if (!githubDispatchToken || !githubRepository || !githubWorkflowId || !githubRef) {
    return { requested: false, message: "GitHub dispatch is not configured" };
  }

  const response = await fetch(`https://api.github.com/repos/${githubRepository}/actions/workflows/${encodeURIComponent(githubWorkflowId)}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubDispatchToken}`,
      "Content-Type": "application/json",
      "User-Agent": "habitus-admin-content",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      ref: githubRef,
      inputs: { reason }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    return { requested: false, message: message || `GitHub dispatch failed: ${response.status}` };
  }

  return { requested: true };
};

serve(async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ ok: false, message: "Method not allowed" }, 405);
  }

  if (!supabaseUrl || !serviceRoleKey || !adminPassword) {
    return json({ ok: false, message: "Supabase function secrets are not configured" }, 500);
  }

  try {
    const payload = await request.json() as AdminPayload;

    if (payload.password !== adminPassword) {
      return json({ ok: false, message: "Unauthorized" }, 401);
    }

    if (payload.articles !== undefined && !isArticleArray(payload.articles)) {
      return json({ ok: false, message: "Invalid articles payload" }, 400);
    }

    if (payload.issueProjects !== undefined && !isIssueArray(payload.issueProjects)) {
      return json({ ok: false, message: "Invalid issues payload" }, 400);
    }

    const current = await readSnapshot();
    const nextArticles = payload.articles !== undefined ? payload.articles : current.articles;
    const nextIssues = payload.issueProjects !== undefined ? payload.issueProjects : current.issueProjects;

    if (nextArticles.length === 0 || nextIssues.length === 0) {
      return json({ ok: false, message: "Published content must include articles and issues" }, 400);
    }

    await upsertRows("articles", nextArticles.map((article, index) => ({
      slug: article.slug,
      position: index,
      data: article
    })), "slug");
    await upsertRows("issues", nextIssues.map((issue, index) => ({
      number: issue.number,
      position: index,
      data: issue
    })), "number");
    await upsertSnapshot({ articles: nextArticles, issueProjects: nextIssues });
    const deployment = await triggerStaticDeploy(payload.articles !== undefined ? "article-save" : "issue-save");

    return json({
      ok: true,
      articleCount: nextArticles.length,
      issueCount: nextIssues.length,
      deployment
    });
  } catch (error) {
    return json({ ok: false, message: error instanceof Error ? error.message : "Save failed" }, 500);
  }
});
