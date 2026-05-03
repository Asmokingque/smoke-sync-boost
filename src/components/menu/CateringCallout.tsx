import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

export function CateringCallout() {
  return (
    <aside className="my-4 rounded-lg border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="h-12 w-12 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
          <Utensils className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="font-stencil text-xs text-primary tracking-widest mb-1">Feeding a Crowd?</div>
          <h3 className="font-display text-2xl md:text-3xl tracking-wider">Let Us Cater Your Next Event</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Smoked meat trays, family-style sides, dessert platters, and full event packages.
          </p>
        </div>
      </div>
      <Button asChild className="bg-primary hover:bg-primary/90 font-stencil h-12 px-6 shadow-ember shrink-0">
        <Link to="/catering">Request Catering</Link>
      </Button>
    </aside>
  );
}
