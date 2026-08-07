/**
 * AdminCategories.tsx
 * Dedicated menu-category manager: create, rename, describe, image, show/hide,
 * reorder and (Super Admin only) delete categories.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { useAdminAuth } from "@/context/AdminAuthProvider";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, FolderPlus, Loader2, Pencil, Search, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_visible: boolean;
  display_order: number;
};

type Form = {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_visible: boolean;
  display_order: string;
};

const emptyForm = (order = 0): Form => ({
  id: null,
  name: "",
  slug: "",
  description: "",
  image_url: "",
  is_visible: true,
  display_order: String(order),
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const AdminCategories = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, i] = await Promise.all([
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("category_id"),
    ]);
    setCats((c.data ?? []) as Category[]);
    const map: Record<string, number> = {};
    (i.data ?? []).forEach((row: { category_id: string }) => {
      map[row.category_id] = (map[row.category_id] ?? 0) + 1;
    });
    setCounts(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm(cats.length ? Math.max(...cats.map((c) => c.display_order)) + 1 : 0));
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url ?? "",
      is_visible: c.is_visible !== false,
      display_order: String(c.display_order ?? 0),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Category name is required.");
    const slug = slugify(form.slug || form.name);
    if (!slug) return toast.error("Could not build a valid slug from that name.");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      is_visible: form.is_visible,
      display_order: Number(form.display_order) || 0,
    };
    const { error } = form.id
      ? await supabase.from("menu_categories").update(payload).eq("id", form.id)
      : await supabase.from("menu_categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Category updated." : "Category created.");
    setOpen(false);
    load();
  };

  const toggleVisible = async (c: Category, val: boolean) => {
    setCats((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_visible: val } : x)));
    const { error } = await supabase.from("menu_categories").update({ is_visible: val }).eq("id", c.id);
    if (error) {
      toast.error(error.message);
      load();
    }
  };

  const move = async (c: Category, dir: -1 | 1) => {
    const idx = cats.findIndex((x) => x.id === c.id);
    const swap = cats[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("menu_categories").update({ display_order: swap.display_order }).eq("id", c.id),
      supabase.from("menu_categories").update({ display_order: c.display_order }).eq("id", swap.id),
    ]);
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    if ((counts[deleteId] ?? 0) > 0) {
      setDeleteId(null);
      return toast.error("Move or delete this category's menu items first.");
    }
    const { error } = await supabase.from("menu_categories").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) return toast.error(error.message);
    toast.success("Category deleted.");
    load();
  };

  const filtered = cats.filter((c) =>
    (c.name + " " + c.slug).toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Menu Categories</h1>
          <p className="text-sm text-muted-foreground">
            Order, images and visibility for every section of the digital menu.
          </p>
        </div>
        <Button onClick={openNew} className="font-stencil">
          <FolderPlus className="h-4 w-4" /> New Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search categories…"
          className="pl-9 h-11"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-16 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading categories…
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="font-stencil text-sm uppercase tracking-widest text-muted-foreground">
            {cats.length === 0 ? "No categories yet" : "No matches"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-3"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gold/20 bg-muted/40">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl truncate">{c.name}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {counts[c.id] ?? 0} items
                  </Badge>
                  {!c.is_visible && (
                    <Badge variant="secondary" className="text-[10px]">Hidden</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">/{c.slug}</p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={c.is_visible !== false}
                  onCheckedChange={(v) => toggleVisible(c, v)}
                  aria-label={`Show ${c.name} on the menu`}
                />
                <Button variant="ghost" size="icon" onClick={() => move(c, -1)} disabled={i === 0} aria-label="Move up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => move(c, 1)}
                  disabled={i === filtered.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Edit category">
                  <Pencil className="h-4 w-4" />
                </Button>
                {isSuperAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(c.id)}
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {form.id ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>Categories group items on the customer-facing menu.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.id ? f.slug : slugify(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              bucket="menu-images"
              folder={`categories/${slugify(form.slug || form.name) || "misc"}`}
              label="Category image"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Display order</Label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.is_visible}
                  onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
                />
                <Label>Visible on menu</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="font-stencil">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete this category?"
        description="This cannot be undone. Categories that still contain menu items can't be deleted."
        onConfirm={remove}
      />
    </div>
  );
};

export default AdminCategories;
