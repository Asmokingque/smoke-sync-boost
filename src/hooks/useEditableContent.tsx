/**
 * useEditableContent.tsx
 * ---------------------------------------------------------------------------
 * Makes src/data/siteContent.ts, menuData.ts and theme.ts editable at runtime.
 *
 * Components should read copy/theme through these hooks instead of importing
 * the data files directly, so admin edits (stored in the backend) appear live.
 * If the backend is unreachable, the static defaults are used unchanged.
 * ---------------------------------------------------------------------------
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { siteContent as defaultSiteContent, type SiteContent } from "@/data/siteContent";
import { theme as defaultTheme, type Theme } from "@/data/theme";
import { fallbackCategories, fallbackMenuItems } from "@/data/menuData";
import {
  contentDefaults,
  deepMerge,
  fetchOverrides,
  type ContentKey,
  type MenuDataShape,
  type OverrideMap,
} from "@/lib/contentOverrides";

type ContentContextValue = {
  overrides: OverrideMap;
  siteContent: SiteContent;
  theme: Theme;
  menuData: MenuDataShape;
  loading: boolean;
  /** Re-read overrides from the backend (used by the admin dashboard). */
  refresh: () => Promise<void>;
  /** Merged value for any editable file. */
  merged: (key: ContentKey) => Record<string, unknown>;
};

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const map = await fetchOverrides();
    setOverrides(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ContentContextValue>(() => {
    const menuDefaults: MenuDataShape = { categories: fallbackCategories, items: fallbackMenuItems };
    const menuOverride = overrides.menuData as Partial<MenuDataShape> | undefined;
    return {
      overrides,
      loading,
      refresh,
      siteContent: deepMerge(defaultSiteContent, overrides.siteContent) as SiteContent,
      theme: deepMerge(defaultTheme, overrides.theme) as Theme,
      menuData: {
        categories: menuOverride?.categories?.length ? menuOverride.categories : menuDefaults.categories,
        items: menuOverride?.items?.length ? menuOverride.items : menuDefaults.items,
      },
      merged: (key: ContentKey) =>
        deepMerge(contentDefaults[key], overrides[key]) as Record<string, unknown>,
    };
  }, [overrides, loading, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContentContext() {
  return useContext(ContentContext);
}

/** Merged site copy — falls back to the static file outside the provider. */
export function useSiteContent(): SiteContent {
  return useContentContext()?.siteContent ?? defaultSiteContent;
}

/** Merged theme tokens — falls back to the static file outside the provider. */
export function useTheme(): Theme {
  return useContentContext()?.theme ?? defaultTheme;
}

/** Merged fallback menu (used when the live database is empty). */
export function useFallbackMenu(): MenuDataShape {
  return useContentContext()?.menuData ?? { categories: fallbackCategories, items: fallbackMenuItems };
}

/** Full context — for the admin content editor. */
export function useContentAdmin() {
  const ctx = useContentContext();
  if (!ctx) throw new Error("useContentAdmin must be used inside <ContentProvider>");
  return ctx;
}
