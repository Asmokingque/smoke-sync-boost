/**
 * AdminContent.tsx
 * Admin dashboard for editing src/data/siteContent.ts, menuData.ts and theme.ts
 * through a web UI. Saves live overrides to the backend and can export the
 * regenerated .ts file for the codebase.
 */
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Download, Loader2, RotateCcw, Save, Code2, FormInput } from "lucide-react";
import { ContentFieldEditor } from "@/components/admin/ContentFieldEditor";
import { useContentAdmin } from "@/hooks/useEditableContent";
import {
  CONTENT_KEYS,
  contentMeta,
  downloadTextFile,
  generateTsFile,
  resetOverride,
  saveOverride,
  type ContentKey,
} from "@/lib/contentOverrides";

const AdminContent = () => {
  const { merged, refresh, loading } = useContentAdmin();
  const [active, setActive] = useState<ContentKey>("siteContent");
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({});
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const key of CONTENT_KEYS) if (!next[key]) next[key] = merged(key);
      return next;
    });
  }, [loading, merged]);

  const draft = drafts[active];

  useEffect(() => {
    if (draft) setRawText(JSON.stringify(draft, null, 2));
  }, [active, rawMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fileName = useMemo(() => contentMeta[active].file.split("/").pop() ?? "data.ts", [active]);

  const setDraft = (next: Record<string, unknown>) =>
    setDrafts((prev) => ({ ...prev, [active]: next }));

  const applyRaw = () => {
    try {
      const parsed = JSON.parse(rawText);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Content must be an object");
      }
      setDraft(parsed);
      setRawMode(false);
      toast({ title: "JSON applied", description: "Review the fields, then save." });
    } catch (e) {
      toast({ title: "Invalid JSON", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await saveOverride(active, draft);
      await refresh();
      toast({ title: "Saved", description: `${contentMeta[active].label} is live on the site.` });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await resetOverride(active);
      await refresh();
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[active];
        return next;
      });
      toast({ title: "Reset", description: `Restored the defaults from ${contentMeta[active].file}.` });
    } catch (e) {
      toast({ title: "Reset failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!draft) return;
    downloadTextFile(fileName, generateTsFile(active, draft));
    toast({ title: "Downloaded", description: `Replace ${contentMeta[active].file} with this file.` });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <header>
        <h1 className="font-serif text-4xl">Site Content</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Edit the website's text, fallback menu and theme tokens. Saving publishes changes live;
          downloading gives you the matching <code>.ts</code> file for an exported codebase.
        </p>
      </header>

      <Tabs value={active} onValueChange={(v) => setActive(v as ContentKey)}>
        <TabsList className="flex-wrap h-auto">
          {CONTENT_KEYS.map((k) => (
            <TabsTrigger key={k} value={k} className="font-stencil text-xs tracking-widest">
              {contentMeta[k].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CONTENT_KEYS.map((k) => (
          <TabsContent key={k} value={k} className="space-y-4">
            <div className="rounded-lg border border-gold/20 bg-card/40 p-4">
              <p className="text-sm text-muted-foreground">{contentMeta[k].hint}</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{contentMeta[k].file}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={saving || !draft} className="font-stencil text-xs">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save & Publish
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!draft} className="font-stencil text-xs">
                <Download className="h-4 w-4" /> Download {fileName}
              </Button>
              <Button variant="outline" onClick={() => setRawMode((m) => !m)} className="font-stencil text-xs">
                {rawMode ? <FormInput className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                {rawMode ? "Form editor" : "Raw JSON"}
              </Button>
              <Button variant="ghost" onClick={handleReset} disabled={saving} className="font-stencil text-xs">
                <RotateCcw className="h-4 w-4" /> Reset to file defaults
              </Button>
            </div>

            {loading || !draft ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading content…
              </div>
            ) : rawMode ? (
              <div className="space-y-2">
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={24}
                  className="font-mono text-xs"
                />
                <Button onClick={applyRaw} variant="outline" className="font-stencil text-xs">
                  Apply JSON
                </Button>
              </div>
            ) : (
              <ContentFieldEditor value={draft} onChange={setDraft} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminContent;
