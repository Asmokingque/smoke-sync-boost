/**
 * AdminServiceArea.tsx
 * Controls: /admin/service-area — wording, cities, delivery details, map
 * center/zoom and the footer service-area line.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AdminFormCard } from "@/components/admin/AdminFormCard";
import { useContentAdmin } from "@/hooks/useEditableContent";
import { saveOverride } from "@/lib/contentOverrides";

type Detail = { label: string; value: string };

const AdminServiceArea = () => {
  const { merged, loading, refresh } = useContentAdmin();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});
  const [newCity, setNewCity] = useState("");

  useEffect(() => {
    if (!loading) setData(JSON.parse(JSON.stringify(merged("serviceArea"))));
  }, [loading, merged]);

  const set = (key: string, value: unknown) => setData((d) => ({ ...d, [key]: value }));

  const cities: string[] = data.cities ?? [];
  const details: Detail[] = data.details ?? [];

  const save = async () => {
    const lat = Number(data.mapLat);
    const lng = Number(data.mapLng);
    const zoom = Number(data.mapZoom);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) return toast.error("Latitude must be between -90 and 90.");
    if (Number.isNaN(lng) || lng < -180 || lng > 180) return toast.error("Longitude must be between -180 and 180.");
    if (Number.isNaN(zoom) || zoom < 1 || zoom > 20) return toast.error("Zoom must be between 1 and 20.");

    setSaving(true);
    try {
      await saveOverride("serviceArea", { ...data, mapLat: lat, mapLng: lng, mapZoom: zoom });
      await refresh();
      toast.success("Service area updated.");
    } catch {
      toast.error("Couldn't save the service area. Please try again.");
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

  return (
    <div className="space-y-8 max-w-3xl pb-24">
      <header>
        <h1 className="font-serif text-4xl">Service Area</h1>
        <span className="gold-rule-short block my-3" />
        <p className="text-sm text-muted-foreground">Where you deliver, how it reads, and where the map points.</p>
      </header>

      <AdminFormCard title="Wording">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sa-badge">Badge</Label>
            <Input id="sa-badge" className="h-11" value={data.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-title">Title</Label>
            <Input id="sa-title" className="h-11" value={data.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sa-sub">Subtitle</Label>
            <Input id="sa-sub" className="h-11" value={data.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sa-footnote">Footnote</Label>
            <Textarea id="sa-footnote" rows={2} value={data.footnote ?? ""} onChange={(e) => set("footnote", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="sa-footer">Footer wording</Label>
            <Input id="sa-footer" className="h-11" value={data.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} />
          </div>
        </div>
      </AdminFormCard>

      <AdminFormCard title="Location & map">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sa-city">City</Label>
            <Input id="sa-city" className="h-11" value={data.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-state">State</Label>
            <Input id="sa-state" className="h-11" value={data.state ?? ""} onChange={(e) => set("state", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-lat">Map latitude</Label>
            <Input id="sa-lat" inputMode="decimal" className="h-11" value={data.mapLat ?? ""} onChange={(e) => set("mapLat", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-lng">Map longitude</Label>
            <Input id="sa-lng" inputMode="decimal" className="h-11" value={data.mapLng ?? ""} onChange={(e) => set("mapLng", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-zoom">Map zoom</Label>
            <Input id="sa-zoom" inputMode="numeric" className="h-11" value={data.mapZoom ?? ""} onChange={(e) => set("mapZoom", e.target.value)} />
          </div>
        </div>
      </AdminFormCard>

      <AdminFormCard title="Cities served" hint="Shown as chips on the homepage.">
        <div className="flex flex-wrap gap-2">
          {cities.map((c, i) => (
            <span key={`${c}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-sm">
              {c}
              <button
                type="button"
                aria-label={`Remove ${c}`}
                onClick={() => set("cities", cities.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {cities.length === 0 && <p className="text-sm text-muted-foreground">No cities yet.</p>}
        </div>
        <div className="flex gap-2">
          <Input
            value={newCity}
            placeholder="Add a city"
            className="h-11"
            onChange={(e) => setNewCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCity.trim()) {
                e.preventDefault();
                set("cities", [...cities, newCity.trim()]);
                setNewCity("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="font-stencil"
            onClick={() => {
              if (!newCity.trim()) return;
              set("cities", [...cities, newCity.trim()]);
              setNewCity("");
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </AdminFormCard>

      <AdminFormCard title="Delivery details" hint="The three small info cards.">
        <div className="space-y-3">
          {details.map((d, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 rounded-md border border-gold/20 p-3">
              <div className="space-y-2">
                <Label htmlFor={`det-label-${i}`}>Label</Label>
                <Input id={`det-label-${i}`} className="h-11" value={d.label ?? ""} onChange={(e) => {
                  const next = [...details]; next[i] = { ...d, label: e.target.value }; set("details", next);
                }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`det-value-${i}`}>Value</Label>
                <Input id={`det-value-${i}`} className="h-11" value={d.value ?? ""} onChange={(e) => {
                  const next = [...details]; next[i] = { ...d, value: e.target.value }; set("details", next);
                }} />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" className="font-stencil" onClick={() => set("details", [...details, { label: "", value: "" }])}>
            <Plus className="h-4 w-4" /> Add detail
          </Button>
        </div>
      </AdminFormCard>

      <div className="sticky bottom-4">
        <Button onClick={save} disabled={saving} className="h-12 w-full sm:w-auto bg-primary hover:bg-primary/90 font-stencil">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Service Area
        </Button>
      </div>
    </div>
  );
};

export default AdminServiceArea;
