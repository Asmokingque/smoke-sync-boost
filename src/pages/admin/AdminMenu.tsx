import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Pencil, X, Check, Plus, Trash2, Upload, Image as ImageIcon, ArrowUp, ArrowDown, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useCartUI } from "@/store/cartUi";

type Category = { id: string; name: string; slug: string; display_order: number; description?: string | null };

type CatForm = { id: string | null; name: string; slug: string; description: string; display_order: string };
const emptyCatForm = (): CatForm => ({ id: null, name: "", slug: "", description: "", display_order: "0" });
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_alt: number | null;
  price_label: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  requires_options: boolean;
  allow_notes: boolean;
};

type FormState = {
  category_id: string;
  name: string;
  description: string;
  price: string;
  price_alt: string;
  price_label: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: string;
  requires_options: boolean;
  allow_notes: boolean;
};

const emptyForm = (categoryId = ""): FormState => ({
  category_id: categoryId,
  name: "",
  description: "",
  price: "",
  price_alt: "",
  price_label: "",
  image_url: "",
  is_available: true,
  is_featured: false,
  display_order: "0",
  requires_options: false,
  allow_notes: true,
});

const AdminMenu = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category management
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState<CatForm>(emptyCatForm());
  const [catSaving, setCatSaving] = useState(false);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [c, i] = await Promise.all([
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
    ]);
    setCats((c.data ?? []) as Category[]);
    setItems((i.data ?? []) as Item[]);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = (categoryId?: string) => {
    setEditingId(null);
    setForm(emptyForm(categoryId ?? cats[0]?.id ?? ""));
    setDialogOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description ?? "",
      price: item.price != null ? String(item.price) : "",
      price_alt: item.price_alt != null ? String(item.price_alt) : "",
      price_label: item.price_label ?? "",
      image_url: item.image_url ?? "",
      is_available: item.is_available,
      is_featured: item.is_featured,
      display_order: String(item.display_order ?? 0),
      requires_options: item.requires_options,
      allow_notes: item.allow_notes,
    });
    setDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("menu-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.category_id) return toast.error("Category is required");
    setSaving(true);
    const payload = {
      category_id: form.category_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: form.price === "" ? null : Number(form.price),
      price_alt: form.price_alt === "" ? null : Number(form.price_alt),
      price_label: form.price_label.trim() || null,
      image_url: form.image_url.trim() || null,
      is_available: form.is_available,
      is_featured: form.is_featured,
      display_order: Number(form.display_order) || 0,
      requires_options: form.requires_options,
      allow_notes: form.allow_notes,
    };
    const { error } = editingId
      ? await supabase.from("menu_items").update(payload).eq("id", editingId)
      : await supabase.from("menu_items").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Item updated" : "Item created");
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from("menu_item_options").delete().eq("menu_item_id", deleteId);
    const { error } = await supabase.from("menu_items").delete().eq("id", deleteId);
    if (error) return toast.error(error.message);
    toast.success("Item deleted");
    setDeleteId(null);
    fetchData();
  };

  const toggleAvail = async (id: string, val: boolean) => {
    const { error } = await supabase.from("menu_items").update({ is_available: val }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_available: val } : i)));
  };

  const [rowUploadingId, setRowUploadingId] = useState<string | null>(null);

  const handleRowImageUpload = async (item: Item, file: File) => {
    setRowUploadingId(item.id);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("menu-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("menu-images").getPublicUrl(path);
      const newUrl = data.publicUrl;
      const { error: dbErr } = await supabase
        .from("menu_items")
        .update({ image_url: newUrl })
        .eq("id", item.id);
      if (dbErr) throw dbErr;
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, image_url: newUrl } : i)));
      toast.success(`Photo updated for ${item.name}`);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setRowUploadingId(null);
    }
  };

  const handleRowImageClear = async (item: Item) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ image_url: null })
      .eq("id", item.id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, image_url: null } : i)));
    toast.success("Photo removed");
  };

  // -------- Category CRUD --------
  const openCatCreate = () => {
    setCatForm({ ...emptyCatForm(), display_order: String((cats[cats.length - 1]?.display_order ?? 0) + 1) });
    setCatDialogOpen(true);
  };
  const openCatEdit = (c: Category) => {
    setCatForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      display_order: String(c.display_order),
    });
    setCatDialogOpen(true);
  };
  const handleCatSave = async () => {
    if (!catForm.name.trim()) return toast.error("Name is required");
    const slug = catForm.slug.trim() ? slugify(catForm.slug) : slugify(catForm.name);
    if (!slug) return toast.error("Slug is required");
    setCatSaving(true);
    const payload = {
      name: catForm.name.trim(),
      slug,
      description: catForm.description.trim() || null,
      display_order: Number(catForm.display_order) || 0,
    };
    const { error } = catForm.id
      ? await supabase.from("menu_categories").update(payload).eq("id", catForm.id)
      : await supabase.from("menu_categories").insert(payload);
    setCatSaving(false);
    if (error) return toast.error(error.message);
    toast.success(catForm.id ? "Category updated" : "Category created");
    setCatDialogOpen(false);
    fetchData();
  };
  const handleCatDelete = async () => {
    if (!deleteCatId) return;
    const hasItems = items.some((i) => i.category_id === deleteCatId);
    if (hasItems) {
      toast.error("Move or delete items in this category first");
      setDeleteCatId(null);
      return;
    }
    const { error } = await supabase.from("menu_categories").delete().eq("id", deleteCatId);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    setDeleteCatId(null);
    fetchData();
  };
  const moveCategory = async (cat: Category, dir: -1 | 1) => {
    const sorted = [...cats].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((c) => c.id === cat.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("menu_categories").update({ display_order: swap.display_order }).eq("id", cat.id),
      supabase.from("menu_categories").update({ display_order: cat.display_order }).eq("id", swap.id),
    ]);
    fetchData();
  };
  const moveItem = async (item: Item, dir: -1 | 1) => {
    const peers = items
      .filter((i) => i.category_id === item.category_id)
      .sort((a, b) => a.display_order - b.display_order);
    const idx = peers.findIndex((i) => i.id === item.id);
    const swap = peers[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("menu_items").update({ display_order: swap.display_order }).eq("id", item.id),
      supabase.from("menu_items").update({ display_order: item.display_order }).eq("id", swap.id),
    ]);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Menu</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage categories and items shown on the customer menu.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCatCreate} variant="outline" className="font-stencil">
            <FolderPlus className="h-4 w-4" /> Add Category
          </Button>
          <Button onClick={() => openCreate()} className="bg-primary font-stencil">
            <Plus className="h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <AutoOpenCartSetting />

      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-8">
          {cats.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No categories yet. Click "Add Category" to create your first one.
            </div>
          )}
          {cats.map((cat, catIdx) => (
            <div key={cat.id} className="border border-border/60 rounded-lg p-4 bg-card/30">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Button size="icon" variant="ghost" className="h-5 w-5" disabled={catIdx === 0} onClick={() => moveCategory(cat, -1)}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" disabled={catIdx === cats.length - 1} onClick={() => moveCategory(cat, 1)}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-primary tracking-wider">{cat.name}</h2>
                    <div className="text-[10px] text-muted-foreground font-stencil tracking-wider">/{cat.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openCreate(cat.id)} className="font-stencil text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openCatEdit(cat)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteCatId(cat.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {items.filter((i) => i.category_id === cat.id).length === 0 && (
                  <div className="text-xs text-muted-foreground italic px-2">No items yet</div>
                )}
                {items
                  .filter((i) => i.category_id === cat.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-gradient-card border border-border rounded-md p-4 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <label
                          className="relative h-12 w-12 rounded border border-border bg-muted overflow-hidden shrink-0 cursor-pointer group"
                          title="Click to upload / replace photo"
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            {rowUploadingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                              <Upload className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleRowImageUpload(item, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="font-stencil truncate">{item.name}</div>
                          {item.price_label && (
                            <div className="text-xs text-muted-foreground">{item.price_label}</div>
                          )}
                          {item.image_url && (
                            <button
                              onClick={() => handleRowImageClear(item)}
                              className="text-[10px] text-muted-foreground hover:text-destructive uppercase tracking-wider mt-0.5"
                            >
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="font-display text-lg text-primary">
                        {item.price_alt
                          ? `$${Number(item.price).toFixed(0)}/$${Number(item.price_alt).toFixed(0)}`
                          : item.price != null
                          ? `$${Number(item.price).toFixed(2)}`
                          : "—"}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex flex-col">
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveItem(item, -1)}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => moveItem(item, 1)}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Switch
                          checked={item.is_available}
                          onCheckedChange={(v) => toggleAvail(item.id, v)}
                        />
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeleteId(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">
              {editingId ? "Edit Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details. Prices can be left blank for "contact for pricing".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image */}
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Upload
                    </Button>
                    {form.image_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="…or paste an image URL"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alt Price (optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price_alt}
                  onChange={(e) => setForm({ ...form, price_alt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price Label</Label>
                <Input
                  placeholder="e.g. Half / Full"
                  value={form.price_label}
                  onChange={(e) => setForm({ ...form, price_label: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                />
              </div>
              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_available}
                    onCheckedChange={(v) => setForm({ ...form, is_available: v })}
                  />
                  <Label>Available</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                  />
                  <Label>Featured Favorite</Label>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.requires_options}
                  onCheckedChange={(v) => setForm({ ...form, requires_options: v })}
                />
                <Label>Requires options</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.allow_notes}
                  onCheckedChange={(v) => setForm({ ...form, allow_notes: v })}
                />
                <Label>Allow notes</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this menu item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item and any associated options. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category create / edit */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">
              {catForm.id ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Categories group menu items (e.g. Meat, Sides, Desserts).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={catForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setCatForm((f) => ({
                    ...f,
                    name,
                    slug: f.id ? f.slug : slugify(name),
                  }));
                }}
                placeholder="e.g. BBQ By The Pound"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder="auto-generated"
              />
              <p className="text-[10px] text-muted-foreground">Used in URLs and category jump nav.</p>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                rows={2}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={catForm.display_order}
                onChange={(e) => setCatForm({ ...catForm, display_order: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCatDialogOpen(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleCatSave} disabled={catSaving} className="bg-primary">
              {catSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {catForm.id ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCatId} onOpenChange={(o) => !o && setDeleteCatId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the category. Items must be moved or deleted first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCatDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMenu;

function AutoOpenCartSetting() {
  const autoOpen = useCartUI((s) => s.autoOpenOnAdd);
  const setAutoOpen = useCartUI((s) => s.setAutoOpenOnAdd);
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-border/60 bg-card/40 px-4 py-3">
      <div>
        <Label htmlFor="auto-open-cart" className="font-stencil text-sm">
          Auto-open cart drawer after Add to Order
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          When off, the cart button animates instead of opening the drawer.
        </p>
      </div>
      <Switch id="auto-open-cart" checked={autoOpen} onCheckedChange={setAutoOpen} />
    </div>
  );
}

