import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, GitCommit, ExternalLink } from "lucide-react";

type RepoSummary = { full_name: string; private: boolean; pushed_at: string };
type RepoDetail = {
  full_name: string; html_url: string; description: string | null; private: boolean;
  default_branch: string; pushed_at: string; open_issues: number; stars: number;
  language: string | null; status: string;
};
type Commit = { sha: string; url: string; message: string; author: string; date: string };

async function call<T>(body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke("github-status", { body });
  if (error) {
    const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
    throw new Error(details);
  }
  return data as T;
}

const fmt = (d: string) => new Date(d).toLocaleString();
const DEFAULT_REPOSITORY = "Asmokingque/smoke-sync-boost";

const AdminGitHub = () => {
  const [repos, setRepos] = useState<RepoSummary[]>([]);
  const [selected, setSelected] = useState<string>(DEFAULT_REPOSITORY);
  const [repo, setRepo] = useState<RepoDetail | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    call<{ repos: RepoSummary[] }>({})
      .then((d) => { setRepos(d.repos); })
      .catch((e) => setErr(e.message));
  }, []);

  const load = async (full: string) => {
    if (!full) return;
    const [owner, name] = full.split("/");
    setLoading(true); setErr(null);
    try {
      const d = await call<{ repo: RepoDetail; commits: Commit[] }>({ owner, repo: name });
      setRepo(d.repo); setCommits(d.commits);
    } catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(selected); }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-foreground">GitHub</h1>
        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-72"><SelectValue placeholder="Choose a repository" /></SelectTrigger>
            <SelectContent>
              {!repos.some((r) => r.full_name.toLowerCase() === DEFAULT_REPOSITORY.toLowerCase()) && (
                <SelectItem value={DEFAULT_REPOSITORY}>{DEFAULT_REPOSITORY}</SelectItem>
              )}
              {repos.map((r) => <SelectItem key={r.full_name} value={r.full_name}>{r.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => load(selected)} disabled={loading} aria-label="Refresh">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {err && <p className="text-sm text-destructive break-all">{err}</p>}

      {repo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                {repo.full_name} <ExternalLink className="h-4 w-4" />
              </a>
              <Badge variant="outline">{repo.private ? "Private" : "Public"}</Badge>
              <Badge variant={repo.status === "failure" || repo.status === "error" ? "destructive" : "secondary"}>
                Checks: {repo.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {repo.description && <p className="sm:col-span-2">{repo.description}</p>}
            <p>Default branch: <span className="text-foreground">{repo.default_branch}</span></p>
            <p>Last push: <span className="text-foreground">{fmt(repo.pushed_at)}</span></p>
            <p>Open issues: <span className="text-foreground">{repo.open_issues}</span></p>
            <p>Language: <span className="text-foreground">{repo.language ?? "—"}</span></p>
          </CardContent>
        </Card>
      )}

      {commits.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent commits</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {commits.map((c) => (
              <a key={c.sha} href={c.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 py-3 hover:bg-muted/40 px-2 rounded">
                <GitCommit className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">{c.message}</p>
                  <p className="text-xs text-muted-foreground">{c.author} · {fmt(c.date)}</p>
                </div>
                <code className="text-xs text-muted-foreground">{c.sha}</code>
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminGitHub;
