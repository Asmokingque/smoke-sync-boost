import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { ADMIN_SOP_GUIDE, SOP_GROUPS, type SopEntry } from "@/data/adminSopGuide";

type Props = { query: string };

const matches = (e: SopEntry, q: string) => {
  if (!q.trim()) return true;
  const hay = [e.title, e.purpose, e.group, ...e.steps, ...(e.tips ?? [])].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
};

export const SopFunctionIndex = ({ query }: Props) => {
  const results = ADMIN_SOP_GUIDE.filter((e) => matches(e, query));

  if (results.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics match "{query}".</p>;
  }

  return (
    <div className="space-y-8">
      {SOP_GROUPS.map((group) => {
        const items = results.filter((e) => e.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <div className="font-stencil text-[11px] tracking-[0.28em] text-gold mb-3 uppercase">{group}</div>
            <Accordion type="multiple" className="space-y-2">
              {items.map((entry) => (
                <AccordionItem
                  key={entry.id}
                  value={entry.id}
                  className="rounded-md border border-border/50 bg-charcoal-light px-4 data-[state=open]:border-gold/40"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <span className="flex items-center gap-2 text-left">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                      <span className="font-serif text-base">{entry.title}</span>
                      {entry.superOnly && (
                        <Badge variant="outline" className="border-gold/40 text-gold text-[10px] font-stencil tracking-widest">
                          SUPER ADMIN
                        </Badge>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-3">{entry.purpose}</p>
                    <ol className="space-y-2 text-sm list-decimal pl-5 marker:text-gold">
                      {entry.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                    {entry.tips && entry.tips.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {entry.tips.map((t, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to={entry.path}
                      className="inline-flex items-center gap-1 mt-4 text-sm text-gold hover:underline font-stencil tracking-wide"
                    >
                      Open {entry.title} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};

export default SopFunctionIndex;
