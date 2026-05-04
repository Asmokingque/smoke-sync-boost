import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Tell us a bit more").max(2000),
});

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ customer_name: "", email: "", phone: "", message: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      customer_name: parsed.data.customer_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Get in Touch</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Contact</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Questions, custom orders, or just want to say hi? Drop us a line.
          </p>
        </div>
      </section>

      <section className="container py-12 grid lg:grid-cols-[1fr_400px] gap-10 max-w-6xl">
        <div className="bg-gradient-card border border-border rounded-lg p-6 md:p-8">
          {done ? (
            <div className="text-center py-10">
              <h2 className="font-display text-3xl mb-3">Thank you!</h2>
              <p className="text-muted-foreground">We received your message and will be in touch.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="font-display text-3xl tracking-wider mb-2">Send a Message</h2>
              <div className="space-y-2">
                <Label htmlFor="mname">Name *</Label>
                <Input id="mname" required value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="h-12" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memail">Email</Label>
                  <Input id="memail" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mphone">Phone</Label>
                  <Input id="mphone" type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mmsg">Message *</Label>
                <Textarea id="mmsg" required rows={5} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button type="submit" disabled={submitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 font-stencil">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <a href="mailto:Support@Asmokingque.com"
            className="block bg-gradient-card border border-border rounded-lg p-6 hover:border-primary/60 transition-colors">
            <Mail className="h-7 w-7 text-primary mb-2" />
            <div className="font-stencil text-xs text-muted-foreground mb-1">Email</div>
            <div className="text-foreground break-all text-sm">Support@Asmokingque.com</div>
          </a>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <Phone className="h-7 w-7 text-primary mb-2" />
            <div className="font-stencil text-xs text-muted-foreground mb-1">Phone</div>
            <div className="text-foreground text-sm">Email for fastest response</div>
          </div>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <MapPin className="h-7 w-7 text-primary mb-2" />
            <div className="font-stencil text-xs text-muted-foreground mb-1">Service Area</div>
            <div className="text-foreground text-sm">Local pickup &amp; catering delivery</div>
          </div>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <Clock className="h-7 w-7 text-primary mb-2" />
            <div className="font-stencil text-xs text-muted-foreground mb-1">Hours</div>
            <div className="text-foreground text-sm">By order — fresh batches daily</div>
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
};

export default Contact;
