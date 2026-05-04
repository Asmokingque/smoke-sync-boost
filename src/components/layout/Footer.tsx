import { Link } from "react-router-dom";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-charcoal">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain" width={56} height={56} loading="lazy" />
            <div>
              <div className="font-display text-2xl">Anderson's Smoking Que</div>
              <div className="font-stencil text-xs text-primary">Smoked Low. Served Bold.</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Authentic southern barbecue, smoked low and slow over hardwood. Order online for pickup or
            book us for your next event.
          </p>
          <a
            href="https://www.facebook.com/people/Andersons-Smoking-Que"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-primary transition-colors"
            aria-label="Follow Anderson's Smoking Que on Facebook"
          >
            <Facebook className="h-4 w-4" />
            Follow us on Facebook
          </a>
        </div>

        <div>
          <h3 className="font-stencil text-sm text-primary mb-3">Visit</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><a href="mailto:Support@Asmokingque.com" className="hover:text-primary break-all">Support@Asmokingque.com</a></li>
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /> Contact for catering</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Serving local communities</li>
          </ul>
        </div>

        <div>
          <h3 className="font-stencil text-sm text-primary mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/menu" className="hover:text-primary">Order Online</Link></li>
            <li><Link to="/catering" className="hover:text-primary">Catering</Link></li>
            <li><Link to="/reviews" className="hover:text-primary">Experience Wall</Link></li>
            <li><Link to="/order-status" className="hover:text-primary">Order Status</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Anderson's Smoking Que. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
