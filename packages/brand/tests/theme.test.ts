import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultTheme, themeStyle, themeTokens } from "../src/index";

describe("shared semantic theme", () => {
  it("compiles a complete safe default palette", () => {
    expect(themeTokens.parse(defaultTheme)).toEqual(defaultTheme);
    expect(Object.keys(defaultTheme)).toEqual([
      "primary",
      "accent",
      "surface",
      "surfaceRaised",
      "text",
      "textMuted",
      "border",
      "focus",
      "success",
      "warning",
      "danger",
    ]);
  });

  it.each(["url(javascript:x)", "red; display: none", "var(--secret)"])(
    "rejects unsafe CSS colour %s",
    (primary) => {
      expect(() => themeTokens.parse({ ...defaultTheme, primary })).toThrow(
        "unsafe CSS colour",
      );
    },
  );

  it("maps every token to a deterministic CSS custom property", () => {
    expect(themeStyle(defaultTheme)).toEqual({
      "--primary": "#334155",
      "--accent": "#0f766e",
      "--surface": "#f8fafc",
      "--surface-raised": "#ffffff",
      "--text": "#0f172a",
      "--text-muted": "#475569",
      "--border": "#cbd5e1",
      "--focus": "#2563eb",
      "--success": "#15803d",
      "--warning": "#a16207",
      "--danger": "#b91c1c",
    });
  });
});

describe("brand workspace integration", () => {
  const root = resolve(import.meta.dirname, "../../..");

  it.each(["knowledge", "agent"])(
    "%s web depends on the shared brand package",
    (product) => {
      const manifest = JSON.parse(
        readFileSync(
          resolve(root, `products/${product}/apps/web/package.json`),
          "utf8",
        ),
      ) as { dependencies?: Record<string, string> };
      expect(manifest.dependencies?.["@ai-ecosystem/brand"]).toBe("0.1.0");

      const rootLayout = readFileSync(
        resolve(root, `products/${product}/apps/web/app/layout.tsx`),
        "utf8",
      );
      expect(rootLayout).toContain("themeStyle(defaultTheme)");
      expect(rootLayout).toContain('import "@ai-ecosystem/brand/foundation.css"');
    },
  );

  it("keeps the semantic token contract out of product applications", () => {
    for (const product of ["knowledge", "agent"]) {
      const localTheme = resolve(
        root,
        `products/${product}/apps/web/lib/theme.ts`,
      );
      let source = "";
      try {
        source = readFileSync(localTheme, "utf8");
      } catch {}
      expect(source).not.toContain("z.object(");
      expect(source).not.toContain("safeColor");
    }
  });
});
