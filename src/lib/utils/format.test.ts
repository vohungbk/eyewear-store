import { describe, expect, it } from "vitest";
import { formatPrice, getDiscountPercent, getPrimaryImage } from "./format";

describe("formatPrice", () => {
  it("should format a number as USD with 2 decimals", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
  });
});

describe("getDiscountPercent", () => {
  it("should return the rounded percent off the compare-at price", () => {
    expect(getDiscountPercent(149.99, 199.99)).toBe(25);
  });

  it("should return null when there is no compare-at price", () => {
    expect(getDiscountPercent(100, null)).toBeNull();
  });

  it("should return null when compare-at price is not higher than the price", () => {
    expect(getDiscountPercent(100, 100)).toBeNull();
  });
});

describe("getPrimaryImage", () => {
  const images = [
    { url: "a.png", alt_text: null, is_primary: false },
    { url: "b.png", alt_text: "Front", is_primary: true },
  ];

  it("should prefer the primary image", () => {
    expect(getPrimaryImage(images)).toEqual({ url: "b.png", alt: "Front" });
  });

  it("should fall back to the first image with an empty alt", () => {
    expect(getPrimaryImage([images[0]])).toEqual({ url: "a.png", alt: "" });
  });

  it("should return null when there are no images", () => {
    expect(getPrimaryImage([])).toBeNull();
  });
});
