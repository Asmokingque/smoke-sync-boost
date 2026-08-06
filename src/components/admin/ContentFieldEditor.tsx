/**
 * ContentFieldEditor.tsx
 * Recursive form editor for a plain-JSON content object.
 * Renders text inputs for strings, number inputs for numbers, switches for
 * booleans, and nested groups for objects/arrays.
 */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

type Json = unknown;

const isPlainObject = (v: unknown): v is Record<string, Json> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const humanize = (key: string) =>
  key
    .replace(/[_-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());

function cloneWithPath(root: Json, path: (string | number)[], value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const next = [...root];
    next[head as number] = cloneWithPath(next[head as number], rest, value);
    return next;
  }
  const obj = isPlainObject(root) ? { ...root } : {};
  obj[head as string] = cloneWithPath(obj[head as string], rest, value);
  return obj;
}

type Props = {
  value: Record<string, Json>;
  onChange: (next: Record<string, Json>) => void;
};

export function ContentFieldEditor({ value, onChange }: Props) {
  const setAt = (path: (string | number)[], v: Json) =>
    onChange(cloneWithPath(value, path, v) as Record<string, Json>);

  return <Node node={value} path={[]} setAt={setAt} label={null} />;
}

function Node({
  node,
  path,
  setAt,
  label,
  onRemove,
}: {
  node: Json;
  path: (string | number)[];
  setAt: (path: (string | number)[], v: Json) => void;
  label: string | null;
  onRemove?: () => void;
}) {
  if (typeof node === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <Label className="text-sm">{label ? humanize(label) : ""}</Label>
        <Switch checked={node} onCheckedChange={(c) => setAt(path, c)} />
      </div>
    );
  }

  if (typeof node === "number") {
    return (
      <div className="space-y-1.5 py-1">
        <Label className="text-xs font-stencil tracking-widest text-muted-foreground">
          {label ? humanize(label) : ""}
        </Label>
        <Input
          type="number"
          step="0.01"
          value={node}
          onChange={(e) => setAt(path, e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </div>
    );
  }

  if (node === null || typeof node === "string") {
    const str: string = node ?? "";
    const long = str.length > 70;
    return (
      <div className="space-y-1.5 py-1">
        <Label className="text-xs font-stencil tracking-widest text-muted-foreground">
          {label ? humanize(label) : ""}
        </Label>
        {long ? (
          <Textarea
            rows={3}
            value={str}
            onChange={(e) => setAt(path, e.target.value)}
          />
        ) : (
          <Input value={str} onChange={(e) => setAt(path, e.target.value)} />
        )}
      </div>
    );
  }

  if (Array.isArray(node)) {
    const template = node[0];
    const makeBlank = (): Json => {
      if (isPlainObject(template)) {
        const blank: Record<string, Json> = {};
        for (const [k, v] of Object.entries(template)) {
          blank[k] = typeof v === "number" ? 0 : typeof v === "boolean" ? false : Array.isArray(v) ? [] : isPlainObject(v) ? {} : "";
        }
        return blank;
      }
      if (typeof template === "number") return 0;
      if (typeof template === "boolean") return false;
      return "";
    };

    return (
      <div className="space-y-3 py-2">
        <div className="flex items-center justify-between">
          <Label className="font-stencil text-xs tracking-[0.2em] text-gold">
            {label ? humanize(label) : "Items"} ({node.length})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-stencil text-xs"
            onClick={() => setAt(path, [...node, makeBlank()])}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-3">
          {node.map((child, i) => (
            <div key={i} className="rounded-lg border border-gold/20 bg-card/40 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">#{i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAt(path, node.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
              <Node node={child} path={[...path, i]} setAt={setAt} label={null} />
            </div>
          ))}
          {node.length === 0 && (
            <p className="text-xs text-muted-foreground">No entries yet.</p>
          )}
        </div>
      </div>
    );
  }

  if (isPlainObject(node)) {
    const entries = Object.entries(node);
    const scalars = entries.filter(([, v]) => v === null || typeof v !== "object");
    const groups = entries.filter(([, v]) => v !== null && typeof v === "object");

    return (
      <div className={label ? "rounded-lg border border-gold/20 bg-card/30 p-4 space-y-2" : "space-y-2"}>
        {label && (
          <h3 className="font-serif text-2xl mb-1">{humanize(label)}</h3>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          {scalars.map(([k, v]) => (
            <Node key={k} node={v} path={[...path, k]} setAt={setAt} label={k} />
          ))}
        </div>
        <div className="space-y-4">
          {groups.map(([k, v]) => (
            <Node key={k} node={v} path={[...path, k]} setAt={setAt} label={k} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
