/**
 * AdminHomepage.tsx
 * Controls: /admin/homepage — structured editor for the homepage copy
 * (hero, featured card, favorites, previews) plus section visibility/order.
 * Saves to the backend; the live site refreshes without a redeploy.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, RotateCcw, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { useContentAdmin } from "@/hooks/useEditableContent";
import { saveOverride, resetOverride } from "@/lib/contentOverrides";
import type { HomepageSection } from "@/data/homepageLayout";

type Favorite = { name: string; desc: string; price: string };
type Highlight = { icon: string; title: string; body: string };

const AdminHomepage = () => {
  const { merged, homepageSections, loading, refresh } = useContentAdmin();
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<Record<string, any>>({});
  const [sections, setSections] = useState<HomepageSection[]>([]);

  useEffect(() => {
    if (loading) return;
    setContent(JSON.parse(JSON.stringify(merged("siteContent"))));
    setSections(homepageSections.map((s) => ({ ...s })));
  }, [loading, merged, homepageSections]);

  const set = (key: string, value: unknown) => setContent((c) => ({ ...c, [key]: value }));
  const setNested = (key: string, field: string, value: unknown) =>
    setContent((c) => ({ ...c, [key]: { ...(c[key] ?? {}), [field]: value } }));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveOverride("siteContent", content);
      await saveOverride("homepageLayout", { sections });
      await refresh();
      toast.success("Homepage updated — the live site is refreshed.");
    } catch {
      toast.error("Couldn't save the homepage. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      await resetOverride("homepageLayout");
      await refresh();
      toast.success("Section order and visibility reset to defaults.");
    } catch {
      toast.error("Couldn't reset the layout.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const favorites: Favorite[] = content.favorites ?? [];
  const highlights: Highlight[] = content.highlights ?? [];
  const cta = content.callToAction ?? {};

  return (
    <div className="space-y-8 max-w-4xl pb-24">
      <header>
        <h1 className="font-serif text-4xl">Homepage Editor</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">
          Hero copy, featured cards, preview text, and which sections appear — no code needed.
        </p>
      </header>

      <AdminFormCard title="Hero" hint="The first thing guests see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hero-eyebrow">Eyebrow</Label>
            <Input id="hero-eyebrow" className="h-11" value={content.heroEyebrow ?? ""} onChange={(e) => set("heroEyebrow", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input id="hero-title" className="h-11" value={content.heroTitle ?? ""} onChange={(e) => set("heroTitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-accent">Title accent</Label>
            <Input id="hero-accent" className="h-11" value={content.heroTitleAccent ?? ""} onChange={(e) => set("heroTitleAccent", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-tagline">Tagline</Label>
            <Input id="hero-tagline" className="h-11" value={content.heroSubtitle ?? ""} onChange={(e) => set("heroSubtitle", e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-desc">Description</Label>
          <Textarea id="hero-desc" rows={3} value={content.heroDescription ?? ""} onChange={(e) => set("heroDescription", e.target.value)} />
        </div>
      </AdminFormCard>

      <AdminFormCard title="Hero buttons" hint="Button labels used across the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["startOrder", "Primary button"],
            ["viewMenu", "Secondary button"],
            ["viewFullMenu", "View full menu"],
            ["requestCatering", "Request catering"],
            ["addToOrder", "Add to order"],
            ["viewAllSpecials", "View all specials"],
            ["leaveReview", "Leave a review"],
            ["checkout", "Checkout"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`cta-${key}`}>{label}</Label>
              <Input
                id={`cta-${key}`}
                className="h-11"
                value={cta[key] ?? ""}
                onChange={(e) => setNested("callToAction", key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </AdminFormCard>

      <AdminFormCard title="Featured special card" hint="The card beside the hero.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="feat-badge">Badge</Label>
            <Input id="feat-badge" className="h-11" value={content.heroFeatured?.badge ?? ""} onChange={(e) => setNested("heroFeatured", "badge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feat-price">Price</Label>
            <Input id="feat-price" className="h-11" value={content.heroFeatured?.price ?? ""} onChange={(e) => setNested("heroFeatured", "price", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="feat-title">Title</Label>
            <Input id="feat-title" className="h-11" value={content.heroFeatured?.title ?? ""} onChange={(e) => setNested("heroFeatured", "title", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="feat-desc">Description</Label>
            <Textarea id="feat-desc" rows={2} value={content.heroFeatured?.description ?? ""} onChange={(e) => setNested("heroFeatured", "description", e.target.value)} />
          </div>
        </div>
      </AdminFormCard>

      <AdminFormCard title="Signature favorites" hint="The three featured dishes.">
        <div className="space-y-4">
          {favorites.map((f, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr_120px] rounded-md border border-gold/20 p-3">
              <div className="space-y-2">
                <Label htmlFor={`fav-name-${i}`}>Name</Label>
                <Input id={`fav-name-${i}`} className="h-11" value={f.name ?? ""} onChange={(e) => {
                  const next = [...favorites]; next[i] = { ...f, name: e.target.value }; set("favorites", next);
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`fav-desc-${i}`}>Description</Label>
                <Input id={`fav-desc-${i}`} className="h-11" value={f.desc ?? ""} onChange={(e) => {
                  const next = [...favorites]; next[i] = { ...f, desc: e.target.value }; set("favorites", next);
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`fav-price-${i}`}>Price</Label>
                <Input id={`fav-price-${i}`} className="h-11" value={f.price ?? ""} onChange={(e) => {
                  const next = [...favorites]; next[i] = { ...f, price: e.target.value }; set("favorites", next);
                }} />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="font-stencil"
            onClick={() => set("favorites", [...favorites, { name: "", desc: "", price: "" }])}
          >
            Add favorite
          </Button>
        </div>
      </AdminFormCard>

      <AdminFormCard title="Highlights" hint="The trust row above the favorites.">
        <div className="space-y-4">
          {highlights.map((h, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-[120px_1fr_2fr] rounded-md border border-gold/20 p-3">
              <div className="space-y-2">
                <Label htmlFor={`hl-icon-${i}`}>Icon</Label>
                <Input id={`hl-icon-${i}`} className="h-11" value={h.icon ?? ""} onChange={(e) => {
                  const next = [...highlights]; next[i] = { ...h, icon: e.target.value }; set("highlights", next);
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hl-title-${i}`}>Title</Label>
                <Input id={`hl-title-${i}`} className="h-11" value={h.title ?? ""} onChange={(e) => {
                  const next = [...highlights]; next[i] = { ...h, title: e.target.value }; set("highlights", next);
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`hl-body-${i}`}>Text</Label>
                <Input id={`hl-body-${i}`} className="h-11" value={h.body ?? ""} onChange={(e) => {
                  const next = [...highlights]; next[i] = { ...h, body: e.target.value }; set("highlights", next);
                }} />
              </div>
            </div>
          ))}
        </div>
      </AdminFormCard>

      <AdminFormCard title="Preview sections" hint="Catering, experience wall and service-area blurbs.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exp-badge">Experience badge</Label>
            <Input id="exp-badge" className="h-11" value={content.experience?.badge ?? ""} onChange={(e) => setNested("experience", "badge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-title">Experience title</Label>
            <Input id="exp-title" className="h-11" value={content.experience?.title ?? ""} onChange={(e) => setNested("experience", "title", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="exp-sub">Experience subtitle</Label>
            <Input id="exp-sub" className="h-11" value={content.experience?.subtitle ?? ""} onChange={(e) => setNested("experience", "subtitle", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="service-blurb">Service area blurb</Label>
            <Input id="service-blurb" className="h-11" value={content.serviceAreaText ?? ""} onChange={(e) => set("serviceAreaText", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="footer-text">Footer text</Label>
            <Textarea id="footer-text" rows={2} value={content.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} />
          </div>
        </div>
      </AdminFormCard>

      <AdminFormCard
        title="Sections"
        hint="Show, hide and reorder the homepage."
        action={
          <Button type="button" variant="ghost" size="sm" className="font-stencil" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        }
      >
        <ul className="space-y-2">
          {sections.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 rounded-md border border-gold/20 px-3 py-2">
              <span className="font-stencil text-xs text-muted-foreground w-6">{i + 1}</span>
              <span className="flex-1 text-sm">{s.label}</span>
              <Switch
                checked={s.visible}
                aria-label={`Show ${s.label}`}
                onCheckedChange={(v) => {
                  const next = [...sections];
                  next[i] = { ...s, visible: v };
                  setSections(next);
                }}
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Move down" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </AdminFormCard>

      <div className="sticky bottom-4">
        <Button onClick={save} disabled={saving} className="h-12 w-full sm:w-auto bg-primary hover:bg-primary/90 font-stencil">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Homepage
        </Button>
      </div>
    </div>
  );
};

export default AdminHomepage;
