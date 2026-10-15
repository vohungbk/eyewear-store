import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/facebook/pixel", () => ({ addToCart: vi.fn() }));
// Must run before the store module is imported (imports are hoisted)
vi.hoisted(() => {
  const data = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  });
});

import { useCartStore } from "./cartStore";

const item = {
  productId: "p1",
  slug: "aviator",
  variantId: "v1",
  name: "Aviator",
  variantName: "Black",
  price: 100,
  imageUrl: null,
  stockQuantity: 3,
};

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it("should add a new item with quantity 1", () => {
    useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items).toEqual([expect.objectContaining({ variantId: "v1", quantity: 1 })]);
  });

  it("should increase the quantity when the same variant is added again", () => {
    const { addItem } = useCartStore.getState();
    addItem(item);
    addItem(item);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it("should not exceed the stock quantity when adding", () => {
    const { addItem } = useCartStore.getState();
    for (let i = 0; i < 10; i++) addItem(item);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("should cap updateQuantity at the stock quantity", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity("v1", 99);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("should remove the item when the quantity is set to 0", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().updateQuantity("v1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should empty the cart on clearCart", () => {
    useCartStore.getState().addItem(item);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });
});
