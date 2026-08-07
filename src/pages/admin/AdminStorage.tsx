/**
 * AdminStorage.tsx
 * Image library for the menu-images bucket: browse folders, upload, copy the
 * public URL, and (Super Admin only) delete files.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { toast } from "sonner";
import { ChevronRight, Copy, Folder, Loader2, Search, Trash2, Upload } from "lucide-react";

const BUCKET = "menu-images";
const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

type Entry = { name: string; id: string | null; isFolder: boolean; size?: number };

const AdminStorage = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [prefix, setPrefix] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletePath, setDeletePath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 500, sortBy: { column: "name", order: "asc" } });
    setLoading(false);
    if (error) return toast.error(error.message);
    setEntries(
      (data ?? []).map((f) => ({
        name: f.name,
        id: f.id,
        isFolder: f.id === null,
        size: (f.metadata as { size?: number } | null)?.size,
      })),
    );
  }, [prefix]);

  useEffect(() => {
    load();
  }, [load]);

  const publicUrl = (name: string) =>
    supabase.storage.from(BUCKET).getPublicUrl(prefix ? `${prefix}/${name}` : name).data.publicUrl;

  const upload = async (file?: File | null) => {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) return toast.error("Use a JPG, PNG or WEBP image.");
    if (file.size > MAX_BYTES) return toast.error("Image is too large — keep it under 5 MB.");
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const path = `${prefix ? prefix + "/" : "uploads/"}${base}-${stamp}-${crypto
      .randomUUID()
      .slice(0, 6)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (error) return toast.error(error.message);
    toast.success("Image uploaded.");
    load();
  };

  const remove = async () => {
    if (!deletePath) return;
    const { error } = await supabase.storage.from(BUCKET).remove([deletePath]);
    setDeletePath(null);
    if (error) return toast.error(error.message);
    toast.success("File deleted.");
    load();
  };

  const crumbs = prefix ? prefix.split("/") : [];
  const filtered = entries.filter((e) => e.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Storage &amp; Images</h1>
          <p className="text-sm text-muted-foreground">
            Every public image used across the site lives in <code>{BUCKET}</code>.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="font-stencil">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload image
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-sm">
        <button className="font-stencil uppercase tracking-widest text-xs" onClick={() => setPrefix("")}>
          {BUCKET}
        </button>
        {crumbs.map((c, i) => (
          <span key={c + i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setPrefix(crumbs.slice(0, i + 1).join("/"))}
            >
              {c}
            </button>
          </span>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search this folder…"
          className="pl-9 h-11"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading files…
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="font-stencil text-sm uppercase tracking-widest text-muted-foreground">
            This folder is empty
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((e) =>
            e.isFolder ? (
              <button
                key={e.name}
                onClick={() => setPrefix(prefix ? `${prefix}/${e.name}` : e.name)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left hover:border-gold/40"
              >
                <Folder className="h-5 w-5 text-gold" />
                <span className="truncate font-stencil text-sm">{e.name}</span>
              </button>
            ) : (
              <div key={e.name} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="aspect-video bg-muted/40">
                  <img
                    src={publicUrl(e.name)}
                    alt={e.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="truncate text-xs text-muted-foreground" title={e.name}>
                    {e.name}
                  </p>
                  {e.size ? (
                    <Badge variant="outline" className="text-[10px]">
                      {Math.round(e.size / 1024)} KB
                    </Badge>
                  ) : null}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-stencil flex-1"
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl(e.name));
                        toast.success("URL copied.");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy URL
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        aria-label={`Delete ${e.name}`}
                        onClick={() => setDeletePath(prefix ? `${prefix}/${e.name}` : e.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deletePath}
        onOpenChange={(v) => !v && setDeletePath(null)}
        title="Delete this image?"
        description="Any menu item or page still pointing at this file will show a broken image."
        onConfirm={remove}
      />
    </div>
  );
};

export default AdminStorage;
