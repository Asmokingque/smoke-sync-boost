import { SiteLayout } from "@/components/layout/SiteLayout";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  return (
    <SiteLayout>
      <section className="bg-gradient-smoke border-b border-border">
        <div className="container py-12 md:py-16 text-center">
          <div className="font-stencil text-sm text-primary mb-2">Get in Touch</div>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Contact</h1>
        </div>
      </section>

      <section className="container py-16 max-w-3xl">
        <div className="grid md:grid-cols-2 gap-6">
          <a href="mailto:williealanderson@gmail.com" className="bg-gradient-card border border-border rounded-lg p-6 hover:border-primary/60 transition-colors">
            <Mail className="h-8 w-8 text-primary mb-3" />
            <div className="font-stencil text-sm text-muted-foreground mb-1">Email</div>
            <div className="text-foreground break-all">williealanderson@gmail.com</div>
          </a>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <Phone className="h-8 w-8 text-primary mb-3" />
            <div className="font-stencil text-sm text-muted-foreground mb-1">Phone</div>
            <div className="text-foreground">Contact via email for fastest response</div>
          </div>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <MapPin className="h-8 w-8 text-primary mb-3" />
            <div className="font-stencil text-sm text-muted-foreground mb-1">Service Area</div>
            <div className="text-foreground">Local pickup &amp; catering delivery</div>
          </div>
          <div className="bg-gradient-card border border-border rounded-lg p-6">
            <Clock className="h-8 w-8 text-primary mb-3" />
            <div className="font-stencil text-sm text-muted-foreground mb-1">Hours</div>
            <div className="text-foreground">By order — fresh batches daily</div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
