import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AdminMenu = () => {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetch = async () => {
    const [c, i] = await Promise.all([
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
    ]);
    setCats(c.data ?? []);
    setItems(i.data ?? []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const startEdit = (item: any) => {
    setEditing(item.id);
    setEditForm({ name: item.name, price: item.price, description: item.description ?? "" });
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("menu_items").update({
      name: editForm.name,
      price: editForm.price === "" ? null : Number(editForm.price),
      description: editForm.description || null,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    fetch();
  };

  const toggleAvail = async (id: string, val: boolean) => {
    const { error } = await supabase.from("menu_items").update({ is_available: val }).eq("id", id);
    if (error) return toast.error(error.message);
    fetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider mb-6">Menu</h1>
      {loading ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      ) : (
        <div className="space-y-8">
          {cats.map((cat) => (
            <div key={cat.id}>
              <h2 className="font-display text-xl text-primary mb-3 tracking-wider">{cat.name}</h2>
              <div className="space-y-2">
                {items.filter((i) => i.category_id === cat.id).map((item) => (
                  <div key={item.id} className="bg-gradient-card border border-border rounded-md p-4">
                    {editing === item.id ? (
                      <div className="grid sm:grid-cols-[2fr_100px_auto] gap-2 items-center">
                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                        <Input type="number" step="0.01" value={editForm.price ?? ""} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                        <div className="flex gap-1">
                          <Button size="icon" onClick={() => saveEdit(item.id)} className="bg-primary"><Check className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="font-stencil">{item.name}</div>
                          {item.price_label && <div className="text-xs text-muted-foreground">{item.price_label}</div>}
                        </div>
                        <div className="font-display text-lg text-primary">
                          {item.price_alt ? `$${Number(item.price).toFixed(0)}/$${Number(item.price_alt).toFixed(0)}` : `$${Number(item.price).toFixed(2)}`}
                        </div>
                        <Switch checked={item.is_available} onCheckedChange={(v) => toggleAvail(item.id, v)} />
                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
