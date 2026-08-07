/**
 * ImageUploader.tsx
 * Reusable admin image control: upload / replace / remove a picture stored in
 * a Lovable Cloud storage bucket. Saves the resolvable image URL — never base64.
 *
 * Path conventions (see src/lib/storagePaths.ts):
 *   menu-images/{category-slug}/{item-slug}/{timestamp}-{file-name}
 *   site-images/{section-key}/{timestamp}-{file-name}
 *   specials-images/{special-type}/{special-slug}/{timestamp}-{file-name}
 */
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Trash2, ImageIcon, X, MousePointer2 } from "lucide-react";
import { toast } from "sonner";
import {
  folderPath,
  isPublicBucket,
  menuItemPath,
  sitePath,
  specialPath,
  type ImageBucket,
} from "@/lib/storagePaths";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years, for private buckets

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: ImageBucket;
  /** Fallback folder when no structured path context is given. */
  folder?: string;
  /** menu-images path context */
  menu?: { categorySlug?: string | null; itemSlug?: string | null };
  /** site-images path context */
  sectionKey?: string;
  /** specials-images path context */
  special?: { type?: string | null; slug?: string | null };
  label?: string;
  className?: string;
  /** Show the raw URL field under the preview. */
  showUrlField?: boolean;
  onUploaded?: (url: string, path: string) => void;
};

export function ImageUploader({
  value,
  onChange,
  bucket = "menu-images",
  folder = "uploads",
  menu,
  sectionKey,
  special,
  label = "Photo",
  className = "",
  showUrlField = true,
  onUploaded,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = () => inputRef.current?.click();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const buildPath = (fileName: string) => {
    if (bucket === "menu-images" && (menu?.categorySlug || menu?.itemSlug)) {
      return menuItemPath(menu.categorySlug || "uncategorized", menu.itemSlug || "item", fileName);
    }
    if (bucket === "site-images") return sitePath(sectionKey || folder, fileName);
    if (bucket === "specials-images") {
      return specialPath(special?.type || "featured", special?.slug || folder, fileName);
    }
    return folderPath(folder, fileName);
  };

  /** Raw XHR upload so we can report real progress. */
  const putFile = (path: string, file: File, token: string) =>
    new Promise<void>((resolve, reject) => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("authorization", `Bearer ${token}`);
      xhr.setRequestHeader("x-upsert", "true");
      xhr.setRequestHeader("cache-control", "3600");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText)));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(file);
    });

  const resolveUrl = async (path: string) => {
    if (isPublicBucket(bucket)) {
      return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
    if (error) throw error;
    return data.signedUrl;
  };

  const upload = async (file?: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is too large — keep it under 5 MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setProgress(0);
    setUploading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("You need to be signed in to upload images.");

      const path = buildPath(file.name);
      await putFile(path, file, token);
      const url = await resolveUrl(path);
      onChange(url);
      onUploaded?.(url, path);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error && err.message.length < 120 ? err.message : "Couldn't upload that image. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      setPreview(null);
      URL.revokeObjectURL(localPreview);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shown = preview || value;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start gap-4">
        <button
          ref={dropRef}
          type="button"
          onClick={pick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          title="Upload, replace, or drop a photo here"
          className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted/40 flex items-center justify-center transition-colors ${
            dragActive ? "border-gold border-2 bg-gold/10" : "border-gold/30"
          }`}
        >
          {shown ? (
            <img src={shown} alt={label} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="h-6 w-6" aria-hidden />
              {dragActive && <MousePointer2 className="h-3 w-3" />}
            </div>
          )}
          {dragActive && shown && (
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 text-xs font-stencil uppercase tracking-wider text-gold gap-1">
              <Upload className="h-5 w-5" /> Drop to replace
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </span>
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
            {value && !uploading && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  onChange("");
                  toast.success("Image removed from this record.");
                }}
                className="font-stencil text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP · up to 5 MB
            <br />
            <span className="text-gold/80">Or drag and drop onto the preview</span>
          </p>
        </div>
      </div>

      {uploading && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
        </div>
      )}

      {preview && !uploading && (
        <button
          type="button"
          onClick={() => setPreview(null)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" /> Clear preview
        </button>
      )}

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
