import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Users, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30),
  service_type: z.enum(["Pickup", "Delivery", "Full-Service Catering"]),
  event_date: z.string().optional(),
  event_time: z.string().trim().max(50).optional(),
  event_location: z.string().trim().max(300).optional(),
  guest_count: z.number().int().min(1).max(10000).optional(),
  food_requested: z.string().trim().max(1000).optional(),
  message: z.string().trim().max(2000).optional(),
});

const Catering = () => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    service_type: "Pickup" as "Pickup" | "Delivery" | "Full-Service Catering",
    event_date: "", event_time: "", event_location: "",
    guest_count: "", food_requested: "", message: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      guest_count: form.guest_count ? parseInt(form.guest_count) : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("catering_inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service_type: parsed.data.service_type,
      event_date: parsed.data.event_date || null,
      event_time: parsed.data.event_time || null,
      event_location: parsed.data.event_location || null,
      guest_count: parsed.data.guest_count ?? null,
      food_requested: parsed.data.food_requested || null,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Inquiry sent! We'll be in touch within 24 hours.");
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Catering</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">We Bring the Smokehouse</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Family reunions, corporate events, weddings, parties — let us handle the BBQ.
          </p>
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-3 gap-6 max-w-5xl">
        {[
          { icon: Users, title: "Any Size", body: "From 10 guests to 500+. We scale to fit your event." },
          { icon: Calendar, title: "Flexible Dates", body: "Book ahead — popular dates fill up fast." },
          { icon: Mail, title: "Custom Menus", body: "Mix and match meats, sides, and desserts." },
        ].map((f) => (
          <div key={f.title} className="bg-gradient-card border border-border rounded-lg p-6 text-center">
            <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-stencil text-base mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="container pb-20 max-w-2xl">
        <div className="bg-gradient-card border border-border rounded-lg p-6 md:p-8">
          {done ? (
            <div className="text-center py-8">
              <h2 className="font-display text-3xl mb-3">Thank you!</h2>
              <p className="text-muted-foreground">
                We received your catering inquiry and will reach out within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="font-display text-3xl tracking-wider mb-2">Request Catering</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cname">Name *</Label>
                  <Input id="cname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cphone">Phone *</Label>
                  <Input id="cphone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cemail">Email *</Label>
                <Input id="cemail" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="block mb-1">Service Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Pickup", "Delivery", "Full-Service Catering"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, service_type: opt })}
                      className={`h-12 rounded-md border font-stencil text-xs transition-colors ${
                        form.service_type === opt
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/40 text-foreground/80 hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cdate">Event Date</Label>
                  <Input id="cdate" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctime">Event Time</Label>
                  <Input id="ctime" placeholder="e.g. 5:00 PM" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className="h-12" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cloc">Event Location</Label>
                  <Input id="cloc" placeholder="Address or venue" value={form.event_location} onChange={(e) => setForm({ ...form, event_location: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cguests">Guest Count</Label>
                  <Input id="cguests" type="number" min="1" value={form.guest_count} onChange={(e) => setForm({ ...form, guest_count: e.target.value })} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cfood">Food Requested</Label>
                <Textarea id="cfood" rows={3} placeholder="Brisket, ribs, sides, etc." value={form.food_requested} onChange={(e) => setForm({ ...form, food_requested: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmsg">Additional Notes</Label>
                <Textarea id="cmsg" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Anything else we should know" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Inquiry"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Catering;
