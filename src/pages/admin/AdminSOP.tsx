import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BookOpen,
  Download,
  Printer,
  Eye,
  Search,
  ClipboardList,
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  MessageSquareText,
  Mail,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SopFunctionIndex } from "@/components/admin/SopFunctionIndex";

// Placeholder constant — populated dynamically from Storage when uploaded
const SOP_FILE_NAME = "Andersons_Smoking_Que_Admin_Website_SOP.pdf";
const SOP_BUCKET = "admin-documents";

const QUICK_START = [
  {
    icon: ClipboardList,
    title: "Daily Opening Checklist",
    desc: "Review new orders, check pending payments, confirm specials, review sold-out items, and verify pickup/delivery settings.",
  },
  {
    icon: ShoppingBag,
    title: "Order Management",
    desc: "View new orders, update order status, print tickets, verify manual payments, and complete fulfilled orders.",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu & Specials",
    desc: "Manage menu availability, prices, lunch specials, special of the day, and holiday specials.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    desc: "Review Stripe payments, verify Zelle/Venmo/Cash App payments, and manage Pay at Pickup settings.",
  },
  {
    icon: MessageSquareText,
    title: "Reviews & Experience Wall",
    desc: "Approve, hide, or delete customer reviews and uploaded food photos.",
  },
  {
    icon: Mail,
    title: "Catering Requests",
    desc: "Review catering requests, update request status, and contact customers for event details.",
  },
];

const SOP_INDEX = [
  "Logging into the Admin Dashboard",
  "Reviewing New Orders",
  "Updating Order Status",
  "Verifying Manual Payments",
  "Managing Stripe Payments",
  "Managing Zelle Payments",
  "Managing Venmo Payments",
  "Managing Cash App Payments",
  "Editing Menu Items",
  "Marking Items Sold Out",
  "Managing Special of the Day",
  "Managing Lunch Specials",
  "Managing Community Heroes Deal",
  "Managing Holiday Calendar",
  "Managing Catering Requests",
  "Approving Reviews",
  "Managing Customer Photos",
  "Daily Opening Checklist",
  "Daily Closing Checklist",
  "Troubleshooting Common Issues",
];

const AdminSOP = () => {
  const [sopUrl, setSopUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showViewer, setShowViewer] = useState(true);
  const [query, setQuery] = useState("");

  const today = useMemo(
    () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    []
  );

  const loadSignedUrl = async () => {
    setLoadingUrl(true);
    const { data, error } = await supabase.storage
      .from(SOP_BUCKET)
      .createSignedUrl(SOP_FILE_NAME, 60 * 60);
    if (error || !data) {
      setSopUrl(null);
    } else {
      setSopUrl(data.signedUrl);
    }
    setLoadingUrl(false);
  };

  useEffect(() => {
    loadSignedUrl();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    setUploading(true);
    const { error } = await supabase.storage
      .from(SOP_BUCKET)
      .upload(SOP_FILE_NAME, file, { upsert: true, contentType: "application/pdf" });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("SOP uploaded");
    await loadSignedUrl();
  };

  const handleDownload = async () => {
    if (!sopUrl) return toast.error("SOP not yet uploaded");
    const a = document.createElement("a");
    a.href = sopUrl;
    a.download = SOP_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrint = () => {
    if (!sopUrl) return toast.error("SOP not yet uploaded");
    const w = window.open(sopUrl, "_blank");
    if (w) setTimeout(() => w.print(), 1000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="font-stencil text-xs text-gold tracking-[0.32em] mb-2">ADMIN HELP</div>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
          Anderson's Smoking Que Website SOP
        </h1>
        <span className="block h-px w-24 bg-gradient-to-r from-gold/80 to-transparent my-3" />
        <p className="text-muted-foreground max-w-3xl">
          Complete admin guide for managing orders, menu items, specials, payments, catering,
          reviews, and website operations.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button onClick={() => setShowViewer((v) => !v)} className="font-stencil">
            <Eye className="h-4 w-4" /> {showViewer ? "Hide SOP" : "View SOP"}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="font-stencil border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" className="font-stencil">
            <Printer className="h-4 w-4" /> Print SOP
          </Button>
          <label className="inline-flex">
            <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
            <span className="cursor-pointer inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border bg-secondary text-sm font-stencil hover:bg-secondary/80">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {sopUrl ? "Replace PDF" : "Upload PDF"}
            </span>
          </label>
        </div>
      </div>

      {/* Quick Start */}
      <section>
        <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold" /> Quick Start
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_START.map((q) => (
            <Card key={q.title} className="bg-charcoal-light border-border/60 hover:border-gold/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <q.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="font-serif text-lg">{q.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{q.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PDF Viewer */}
      {showViewer && (
        <section>
          <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold" /> SOP Document
          </h2>
          <div className="rounded-lg border border-gold/20 bg-charcoal-light p-2 shadow-xl">
            {loadingUrl ? (
              <div className="h-[70vh] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : sopUrl ? (
              <iframe
                src={sopUrl}
                title="Anderson's Smoking Que Admin SOP"
                className="w-full h-[80vh] rounded-md bg-background"
              />
            ) : (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center p-8 gap-3">
                <FileText className="h-10 w-10 text-gold" />
                <p className="font-serif text-xl">SOP PDF not yet uploaded</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Upload <code className="text-gold">{SOP_FILE_NAME}</code> using the button above to make
                  it available here for all admins.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Searchable Index */}
      <section>
        <h2 className="font-serif text-2xl mb-1 flex items-center gap-2">
          <Search className="h-5 w-5 text-gold" /> SOP Index — How to Use Each Function
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Expand any topic for step-by-step instructions, then jump straight to that admin page.
        </p>
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search SOP topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-charcoal-light border-border"
          />
        </div>
        <SopFunctionIndex query={query} />
      </section>


      {/* Document Card */}
      <section>
        <Card className="bg-gradient-to-br from-charcoal-light to-background border-gold/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              <CardTitle className="font-serif text-2xl">Anderson's Smoking Que Admin Website SOP</CardTitle>
            </div>
            <CardDescription>PDF Training Guide</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="font-stencil text-xs text-gold tracking-widest">VERSION</dt>
                <dd className="text-foreground">1.0</dd>
              </div>
              <div>
                <dt className="font-stencil text-xs text-gold tracking-widest">AUDIENCE</dt>
                <dd className="text-foreground">Admin Users</dd>
              </div>
              <div>
                <dt className="font-stencil text-xs text-gold tracking-widest">LAST UPDATED</dt>
                <dd className="text-foreground">{today}</dd>
              </div>
              <div>
                <dt className="font-stencil text-xs text-gold tracking-widest">FILE</dt>
                <dd className="text-foreground break-all">{SOP_FILE_NAME}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={handleDownload} className="font-stencil">
                <Download className="h-4 w-4" /> Download SOP PDF
              </Button>
              <Button onClick={handlePrint} variant="outline" className="font-stencil border-gold/40 text-gold hover:bg-gold/10 hover:text-gold">
                <Printer className="h-4 w-4" /> Print SOP
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminSOP;
