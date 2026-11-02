import { describe, it, expect } from "vitest";
import { undoPlan, changedFields, type MenuHistoryEntry } from "./menuHistory";

const base = { id: "h1", menu_item_id: "m1", item_name: "Half Smoked Chicken", changed_by_email: null, undone_at: null, created_at: "" };

describe("menu history undo", () => {
  it("undoing a price edit restores the old price only", () => {
    const e: MenuHistoryEntry = { ...base, action: "update",
      old_data: { id: "m1", price: 13.99, name: "Half Smoked Chicken", updated_at: "a" },
      new_data: { id: "m1", price: 14.99, name: "Half Smoked Chicken", updated_at: "b" } };
    expect(undoPlan(e)).toEqual({ kind: "update", id: "m1", values: { price: 13.99 } });
    expect(changedFields(e)).toHaveLength(1);
  });
  it("undoing a delete re-creates the item with its original id", () => {
    const e: MenuHistoryEntry = { ...base, action: "delete", new_data: null,
      old_data: { id: "m1", price: 13.99, created_at: "x", updated_at: "y" } };
    expect(undoPlan(e)).toEqual({ kind: "insert", values: { id: "m1", price: 13.99 } });
  });
  it("undoing a new item removes it", () => {
    const e: MenuHistoryEntry = { ...base, action: "create", old_data: null, new_data: { id: "m1" } };
    expect(undoPlan(e)).toEqual({ kind: "delete", id: "m1" });
  });
});
