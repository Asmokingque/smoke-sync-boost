/**
 * export-design-system.ts
 * ---------------------------------------------------------------------------
 * Exports every important visual detail of the website into two files:
 *
 *   design-system.json  — machine readable tokens (colors, gradients, shadows,
 *                         fonts, radii, custom utility classes, animations)
 *   DESIGN-SYSTEM.md    — human readable reference sheet
 *
 * Run:  npm run export:design
 * Output: /mnt/documents (when available) otherwise ./dist
 * ---------------------------------------------------------------------------
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const OUT_DIR = existsSync("/mnt/documents") ? "/mnt/documents" : resolve(ROOT, "dist");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const read = (p: string) => readFileSync(resolve(ROOT, p), "utf8");

const css = read("src/index.css").replace(/\/\*[\s\S]*?\*\//g, "");
const tailwind = read("tailwind.config.ts");
const indexHtml = read("index.html");

/* ---------------------------------------------------------------- helpers */

function block(source: string, selector: string): string {
  const start = source.indexOf(selector);
  if (start === -1) return "";
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(open + 1, i);
    }
  }
  return "";
}

function vars(scope: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of scope.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
}

/** Resolve `var(--x)` chains down to a raw value. */
function resolveVar(value: string, table: Record<string, string>, seen = 0): string {
  if (seen > 10) return value;
  const m = value.match(/^var\((--[\w-]+)\)$/);
  if (!m) return value;
  const next = table[m[1]];
  return next ? resolveVar(next, table, seen + 1) : value;
}

/** "0 0% 4%" -> "#0a0a0a" */
function hslToHex(hsl: string): string | null {
  const m = hsl.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return null;
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ------------------------------------------------------------- extraction */

const rootVars = vars(block(css, ":root"));
const darkVars = vars(block(css, ".dark"));

const colors: Record<string, { raw: string; hsl: string; hex: string | null; css: string }> = {};
const gradients: Record<string, string> = {};
const shadows: Record<string, string> = {};
const other: Record<string, string> = {};

for (const [name, raw] of Object.entries(rootVars)) {
  const resolved = resolveVar(raw, rootVars);
  if (/^linear-gradient|^radial-gradient/.test(resolved)) {
    gradients[name] = resolved;
  } else if (name.includes("shadow")) {
    shadows[name] = resolved;
  } else if (hslToHex(resolved)) {
    colors[name] = {
      raw,
      hsl: `hsl(${resolved})`,
      hex: hslToHex(resolved),
      css: `hsl(var(${name}))`,
    };
  } else {
    other[name] = resolved;
  }
}

/** Custom utility/component classes declared in index.css */
const customClasses: { name: string; declaration: string }[] = [];
for (const m of css.matchAll(/^\s*(\.[a-z][\w-]*(?:\s*,\s*\.[a-z][\w-]*)*)\s*\{([^}]*)\}/gm)) {
  customClasses.push({
    name: m[1].trim(),
    declaration: m[2].replace(/\s+/g, " ").trim(),
  });
}

/** Keyframes defined in index.css */
const keyframes = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);

/** Google Fonts import */
const fontImport = css.match(/@import url\((['"])(.*?)\1\);/)?.[2] ?? null;

/** Font families from tailwind.config.ts */
const fontFamilies: Record<string, string[]> = {};
const familyBlock = tailwind.match(/fontFamily:\s*\{([\s\S]*?)\n\s{6}\}/)?.[1] ?? "";
for (const m of familyBlock.matchAll(/(\w+):\s*\[([^\]]+)\]/g)) {
  fontFamilies[m[1]] = m[2]
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

/** Tailwind animations + keyframes names */
const tailwindAnimations: Record<string, string> = {};
const animBlock = tailwind.match(/animation:\s*\{([\s\S]*?)\n\s{6}\}/)?.[1] ?? "";
for (const m of animBlock.matchAll(/["']?([\w-]+)["']?:\s*["']([^"']+)["']/g)) {
  tailwindAnimations[m[1]] = m[2];
}

/** Container + radius settings */
const containerScreens = tailwind.match(/screens:\s*\{([^}]*)\}/)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
const containerPadding = tailwind.match(/padding:\s*"([^"]+)"/)?.[1] ?? null;

/** Head metadata */
const decode = (v: string | null) =>
  v
    ? v
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&mdash;/g, "—")
    : null;

const meta = {
  title: decode(indexHtml.match(/<title>([^<]*)<\/title>/)?.[1] ?? null),
  description: decode(indexHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1] ?? null),
  ogTitle: decode(indexHtml.match(/<meta\s+property="og:title"\s+content="([^"]*)"/)?.[1] ?? null),
  favicon: indexHtml.match(/<link\s+rel="icon"[^>]*href="([^"]*)"/)?.[1] ?? null,
};

/* ------------------------------------------------------------------ write */

const payload = {
  generatedAt: new Date().toISOString(),
  source: {
    tokens: "src/index.css",
    tailwind: "tailwind.config.ts",
    classTokens: "src/data/theme.ts",
    content: "src/data/siteContent.ts",
  },
  meta,
  typography: { googleFontsImport: fontImport, families: fontFamilies },
  colors,
  darkOverrides: darkVars,
  gradients,
  shadows,
  scalars: other,
  layout: { containerPadding, containerScreens },
  animations: { tailwind: tailwindAnimations, cssKeyframes: keyframes },
  customClasses,
};

writeFileSync(resolve(OUT_DIR, "design-system.json"), JSON.stringify(payload, null, 2));

const md: string[] = [];
md.push(`# Anderson's Smoking Que — Visual Design Export`);
md.push(`Generated ${payload.generatedAt}`);
md.push(`\n## Page metadata`);
md.push(`- Title: ${meta.title}`);
md.push(`- Description: ${meta.description}`);
md.push(`- Favicon: ${meta.favicon}`);

md.push(`\n## Typography`);
md.push(`Google Fonts import:\n\n\`\`\`css\n@import url('${fontImport}');\n\`\`\`\n`);
md.push(`| Role | Stack |`, `| --- | --- |`);
for (const [role, stack] of Object.entries(fontFamilies)) md.push(`| \`font-${role}\` | ${stack.join(", ")} |`);

md.push(`\n## Colors`);
md.push(`| Variable | HSL | Hex | Usage |`, `| --- | --- | --- | --- |`);
for (const [name, c] of Object.entries(colors)) md.push(`| \`${name}\` | ${c.hsl} | ${c.hex ?? "—"} | \`${c.css}\` |`);

md.push(`\n## Gradients`);
for (const [n, v] of Object.entries(gradients)) md.push(`- \`${n}\`: \`${v}\``);

md.push(`\n## Shadows`);
for (const [n, v] of Object.entries(shadows)) md.push(`- \`${n}\`: \`${v}\``);

md.push(`\n## Scalars`);
for (const [n, v] of Object.entries(other)) md.push(`- \`${n}\`: \`${v}\``);

md.push(`\n## Layout`);
md.push(`- Container padding: ${containerPadding}`);
md.push(`- Container screens: ${containerScreens}`);

md.push(`\n## Animations`);
for (const [n, v] of Object.entries(tailwindAnimations)) md.push(`- \`animate-${n}\`: ${v}`);
md.push(`- CSS keyframes: ${keyframes.join(", ")}`);

md.push(`\n## Custom classes (src/index.css)`);
for (const c of customClasses) md.push(`\n### \`${c.name}\`\n\n\`\`\`css\n${c.name} { ${c.declaration} }\n\`\`\``);

writeFileSync(resolve(OUT_DIR, "DESIGN-SYSTEM.md"), md.join("\n"));

console.log(`Design system exported:
  ${resolve(OUT_DIR, "design-system.json")}
  ${resolve(OUT_DIR, "DESIGN-SYSTEM.md")}
Colors: ${Object.keys(colors).length} | Gradients: ${Object.keys(gradients).length} | Shadows: ${Object.keys(shadows).length} | Custom classes: ${customClasses.length}`);
