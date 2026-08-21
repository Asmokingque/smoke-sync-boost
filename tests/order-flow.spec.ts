import { describe, expect, it } from "vitest";
import { getOrderBusinessMessage, getOrderStatusLabel } from "@/lib/ordering";

describe("order flow messaging", () => {
  it("maps pending orders to new label", () => {
    expect(getOrderStatusLabel("pending")).toBe("New");
  });

  it("returns customer-safe business messaging", () => {
    expect(getOrderBusinessMessage("preparing")).toMatch(/prepared/i);
  });
});
