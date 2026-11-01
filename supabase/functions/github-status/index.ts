// Super Admin only: read GitHub repository status and recent commits.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";
const NAME_RE = /^[A-Za-z0-9_.-]{1,100}$/;

async function gh(path: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GITHUB_API_KEY = Deno.env.get("GITHUB_API_KEY");
  if (!LOVABLE_API_KEY || !GITHUB_API_KEY) throw new Error("[500]: GitHub connection is not configured");
  const res = await fetch(`${GATEWAY_URL}/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GITHUB_API_KEY,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`GitHub request failed [${res.status}]: ${body}`);
    throw new Error(`[${res.status}]: ${body}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "Not authenticated." }, 401);
  const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data: u } = await authClient.auth.getUser(token);
  if (!u?.user) return json({ error: "Not authenticated." }, 401);

  const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: me } = await admin.from("admin_users").select("id")
    .eq("user_id", u.user.id).eq("is_active", true).eq("role", "super_admin").maybeSingle();
  if (!me) return json({ error: "Only an active Super Admin can view GitHub status." }, 403);

  let body: { owner?: string; repo?: string } = {};
  try { body = await req.json(); } catch { /* empty body = list repos */ }

  try {
    if (!body.owner || !body.repo) {
      const repos = await gh("user/repos?per_page=50&sort=updated");
      return json({
        repos: repos.map((r: Record<string, unknown>) => ({
          full_name: r.full_name, private: r.private, pushed_at: r.pushed_at,
        })),
      });
    }
    if (!NAME_RE.test(body.owner) || !NAME_RE.test(body.repo)) return json({ error: "Invalid repository name." }, 400);
    const base = `repos/${body.owner}/${body.repo}`;
    const repo = await gh(base);
    const [commits, statusRes] = await Promise.all([
      gh(`${base}/commits?per_page=15`),
      gh(`${base}/commits/${encodeURIComponent(repo.default_branch)}/status`).catch(() => null),
    ]);
    return json({
      repo: {
        full_name: repo.full_name, html_url: repo.html_url, description: repo.description,
        private: repo.private, default_branch: repo.default_branch, pushed_at: repo.pushed_at,
        open_issues: repo.open_issues_count, stars: repo.stargazers_count, language: repo.language,
        status: statusRes?.state ?? "unknown",
      },
      commits: commits.map((c: { sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } } }) => ({
        sha: c.sha.slice(0, 7), url: c.html_url,
        message: c.commit.message.split("\n")[0], author: c.commit.author?.name, date: c.commit.author?.date,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const m = msg.match(/^\[(\d+)\]/);
    return json({ error: "GitHub request failed", details: msg }, m ? Number(m[1]) : 500);
  }
});
