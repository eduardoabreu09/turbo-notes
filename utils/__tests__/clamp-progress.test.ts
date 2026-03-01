import { describe, expect, it } from "@jest/globals";
import clampProgress from "../clamp-progress";

describe("clampProgress", () => {
  it("returns 0 for NaN", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
  });

  it("clamps negative infinity to 0", () => {
    expect(clampProgress(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it("clamps values below 0 to 0", () => {
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(-999)).toBe(0);
    expect(clampProgress(-0)).toBe(0);
  });

  it("clamps positive infinity to 100", () => {
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(100);
  });

  it("clamps values above 100 to 100", () => {
    expect(clampProgress(101)).toBe(100);
    expect(clampProgress(999)).toBe(100);
    expect(clampProgress(1e20)).toBe(100);
  });

  it("keeps values within range unchanged", () => {
    expect(clampProgress(42)).toBe(42);
    expect(clampProgress(0.5)).toBe(0.5);
    expect(clampProgress(99.9999)).toBe(99.9999);
  });

  it("keeps boundary values unchanged", () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(100)).toBe(100);
  });
});
