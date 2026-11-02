import { useState } from "react";
import { streamImage } from "@/lib/streamImage";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

const IDEAS = [
  "Sliced brisket platter with pickles and onions",
  "Rack of glazed pork ribs fresh off the smoker",
  "Weekend family pack spread for a backyard gathering",
  "Holiday smoked turkey centerpiece",
];

const AdminPromoImages = () => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("square");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);

  const generate = async () => {
    setLoading(true); setErr(null); setImage(null); setIsFinal(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in again to generate images.");
      await streamImage(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/promo-image`, { prompt, size },
        (url, final) => { setImage(url); setIsFinal(final); }, undefined,
        { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY });
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Image generation failed.");
      setImage(null); setIsFinal(false);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!image) return;
    setSaving(true);
    const blob = await (await fetch(image)).blob();
    const path = `promo/${Date.now()}.png`;
    const { error } = await supabase.storage.from("site-images").upload(path, blob, { contentType: "image/png" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(`Saved to site images: ${path}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Promo Images</h1>
        <p className="text-muted-foreground">Lovable AI · Uses workspace AI credits</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Describe your image</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={800} rows={3}
            placeholder="e.g. Smoked brisket sandwich with slaw for our Friday special" />
          <div className="flex flex-wrap gap-2">
            {IDEAS.map((i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => setPrompt(i)}>{i}</Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square (social post)</SelectItem>
                <SelectItem value="landscape">Wide (website/banner)</SelectItem>
                <SelectItem value="portrait">Tall (story/flyer)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generate} disabled={loading || prompt.trim().length < 3}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </CardContent>
      </Card>
      {image && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <img src={image} alt={prompt} className={`mx-auto max-h-[600px] rounded-md ${isFinal ? "" : "blur-lg"}`} />
            {isFinal && !loading && <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href={image} download="promo-image.png"><Download className="mr-2 h-4 w-4" />Download</a>
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save to site images
              </Button>
            </div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPromoImages;
