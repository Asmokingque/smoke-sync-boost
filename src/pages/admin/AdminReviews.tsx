import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, Check, Trash2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAdminAuth } from "@/context/AdminAuthProvider";

type ReviewRow = Tables<"reviews">;

const AdminReviews = () => {
  const { isSuperAdmin } = useAdminAuth();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews(data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Approved"); fetch();
  };
  const hide = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ is_approved: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Hidden from wall"); fetch();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); fetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider mb-6">Reviews</h1>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {reviews.map((r) => (
            <div key={r.id} className={`bg-gradient-card border rounded-lg p-4 ${r.is_approved ? "border-border" : "border-primary/40"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className={`text-[10px] font-stencil ${r.is_approved ? "text-muted-foreground" : "text-primary"}`}>
                  {r.is_approved ? "PUBLISHED" : "PENDING"}
                </span>
              </div>
              {r.title && <div className="font-stencil text-sm">{r.title}</div>}
              <p className="text-sm text-muted-foreground mb-2">{r.body}</p>
              {r.photo_url && <img src={r.photo_url} alt="" loading="lazy" className="w-full h-32 object-cover rounded mb-2" />}
              <div className="text-xs text-muted-foreground mb-3">— {r.author_name}</div>
              <div className="flex gap-2 flex-wrap">
                {!r.is_approved ? (
                  <Button size="sm" onClick={() => approve(r.id)} className="bg-primary"><Check className="h-3.5 w-3.5" /> Approve</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => hide(r.id)}><EyeOff className="h-3.5 w-3.5" /> Hide</Button>
                )}
                {isSuperAdmin && (
                  <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
