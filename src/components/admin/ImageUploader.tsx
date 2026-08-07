/**
 * ImageUploader.tsx
 * Reusable admin image control: upload / replace / remove a picture stored in
 * a Supabase Storage bucket. Saves the public URL — never base64.
 */
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  className?: string;
  /** Show the raw URL field under the preview. */
  showUrlField?: boolean;
};

export function ImageUploader({
  value,
  onChange,
  bucket = "menu-images",
  folder = "uploads",
  label = "Photo",
  className = "",
  showUrlField = true,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = () => inputRef.current?.click();

  const upload = async (file?: File | null) => {
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      return toast.error("Use a JPG, PNG or WEBP image.");
    }
    if (file.size > MAX_BYTES) {
      return toast.error("Image is too large — keep it under 5 MB.");
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Couldn't upload that image. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={pick}
          title="Upload or replace photo"
          className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-gold/30 bg-muted/40 flex items-center justify-center"
        >
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden />
          )}
        </button>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={pick} disabled={uploading} className="font-stencil">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {value ? "Replace" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange("")}
                className="font-stencil text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG or WEBP · up to 5 MB</p>
        </div>
      </div>

      {showUrlField && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="…or paste an image URL"
          className="h-10"
        />
      )}
    </div>
  );
}
