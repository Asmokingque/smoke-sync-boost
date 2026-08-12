/**
 * Converts design-system.json into Figma-ready token files.
 * Run: npm run export:figma  (requires npm run export:design first)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SRC = "/mnt/documents/design-system.json";
const OUT_DIR = "/mnt/documents/figma-import";
mkdirSync(OUT_DIR, { recursive: true });

type ColorEntry = { raw: string; hsl: string; hex: string; css: string };
type DS = {
  typography: { families: Record<string, string[]>; googleFontsImport: string };
  colors: Record<string, ColorEntry>;
  darkOverrides: Record<string, ColorEntry>;
  gradients: Record<string, string>;
  shadows: Record<string, string>;
  scalars: Record<string, string>;
  meta: Record<string, string>;
};

const ds: DS = JSON.parse(readFileSync(SRC, "utf8"));
const clean = (k: string) => k.replace(/^--/, "");

// --- W3C / Tokens Studio format -------------------------------------------
const colorTokens: Record<string, unknown> = {};
for (const [k, v] of Object.entries(ds.colors)) {
  colorTokens[clean(k)] = { $type: "color", $value: v.hex, $description: v.hsl };
}
const darkTokens: Record<string, unknown> = {};
for (const [k, v] of Object.entries(ds.darkOverrides ?? {})) {
  darkTokens[clean(k)] = { $type: "color", $value: v.hex, $description: v.hsl };
}
const fontTokens: Record<string, unknown> = {};
for (const [k, stack] of Object.entries(ds.typography.families)) {
  fontTokens[k] = { $type: "fontFamily", $value: stack[0], $description: stack.join(", ") };
}
const shadowTokens: Record<string, unknown> = {};
for (const [k, v] of Object.entries(ds.shadows ?? {})) {
  shadowTokens[clean(k)] = { $type: "shadow", $value: v };
}
const gradientTokens: Record<string, unknown> = {};
for (const [k, v] of Object.entries(ds.gradients ?? {})) {
  gradientTokens[clean(k)] = { $type: "gradient", $value: v };
}
const radiusTokens: Record<string, unknown> = {};
for (const [k, v] of Object.entries(ds.scalars ?? {})) {
  radiusTokens[clean(k)] = { $type: "dimension", $value: v };
}

writeFileSync(
  `${OUT_DIR}/figma-tokens.json`,
  JSON.stringify(
    {
      $description: "Anderson's Smoking Que design tokens (Tokens Studio / W3C format)",
      color: colorTokens,
      "color-dark": darkTokens,
      fontFamily: fontTokens,
      radius: radiusTokens,
      shadow: shadowTokens,
      gradient: gradientTokens,
    },
    null,
    2,
  ),
);

// --- Figma Variables REST import shape ------------------------------------
const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: 1,
  };
};
writeFileSync(
  `${OUT_DIR}/figma-variables.json`,
  JSON.stringify(
    {
      collection: "Brand",
      modes: ["Default", "Dark"],
      variables: Object.entries(ds.colors).map(([k, v]) => ({
        name: clean(k).replace(/-/g, "/"),
        resolvedType: "COLOR",
        valuesByMode: {
          Default: toRgb(v.hex),
          Dark: toRgb((ds.darkOverrides?.[k]?.hex) ?? v.hex),
        },
      })),
    },
    null,
    2,
  ),
);

// --- Flat CSV for manual paste --------------------------------------------
const rows = ["token,hex,hsl,group"];
for (const [k, v] of Object.entries(ds.colors)) rows.push(`${clean(k)},${v.hex},"${v.hsl}",light`);
for (const [k, v] of Object.entries(ds.darkOverrides ?? {})) rows.push(`${clean(k)},${v.hex},"${v.hsl}",dark`);
writeFileSync(`${OUT_DIR}/figma-colors.csv`, rows.join("\n"));

console.log("Figma export written to", OUT_DIR);
console.log("Colors:", Object.keys(ds.colors).length, "| Dark:", Object.keys(ds.darkOverrides ?? {}).length);
