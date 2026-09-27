import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { themeTokens } from "@ai-ecosystem/brand";
import { themes } from "@/lib/theme";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { ThemePicker } from "@/components/theme-picker";
describe("themes", () => {
  it("validates complete safe semantic palettes", () => {
    expect(themeTokens.parse(themes.knowledge)).toEqual(themes.knowledge);
    expect(() =>
      themeTokens.parse({ ...themes.knowledge, primary: "url(javascript:x)" }),
    ).toThrow();
  });
  it("keeps the optional Northstar override product-owned", () => {
    expect(themeTokens.parse(themes.northstar)).toEqual(themes.northstar);
    expect(themes.northstar).toMatchObject({
      primary: "#173b57",
      surfaceRaised: "#fffdf8",
    });
  });
  it("switches the runtime theme cookie", () => {
    render(<ThemePicker value="knowledge" />);
    fireEvent.change(screen.getByLabelText("Company theme"), {
      target: { value: "northstar" },
    });
    expect(document.cookie).toContain("knowledge-theme=northstar");
  });
});
