import { describe, expect, it } from "@jest/globals";
import validateModelId from "../validate-model-id";

describe("validateModelId", () => {
  it("returns invalid when model id is empty", () => {
    expect(validateModelId("")).toEqual({
      valid: false,
      reason: "Model ID is required.",
    });
  });

  it("returns invalid when model id has only spaces", () => {
    expect(validateModelId("   ")).toEqual({
      valid: false,
      reason: "Model ID is required.",
    });
  });

  it("accepts valid gguf model id format", () => {
    const result = validateModelId(
      "Qwen/Qwen2.5-3B-Instruct-GGUF/qwen2.5-3b-instruct-q3_k_m.gguf",
    );
    expect(result).toEqual({ valid: true });
  });

  it("accepts uppercase gguf extension", () => {
    const result = validateModelId("owner/repo/file.GGUF");
    expect(result).toEqual({ valid: true });
  });

  it("trims and validates surrounding spaces", () => {
    const result = validateModelId("  owner/repo/file.gguf  ");
    expect(result).toEqual({ valid: true });
  });

  it("returns invalid when format is not owner/repo/file.gguf", () => {
    expect(validateModelId("owner/repo/file.bin")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
    expect(validateModelId("owner/repo")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });

  it("returns invalid for extra path segments", () => {
    expect(validateModelId("owner/repo/folder/file.gguf")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });

  it("returns invalid for leading or trailing slashes", () => {
    expect(validateModelId("/owner/repo/file.gguf")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
    expect(validateModelId("owner/repo/file.gguf/")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });

  it("returns invalid for internal whitespace or newline", () => {
    expect(validateModelId("owner/repo/my file.gguf")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
    expect(validateModelId("owner/repo/file\n.gguf")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });

  it("returns invalid for query or hash suffixes", () => {
    expect(validateModelId("owner/repo/file.gguf?download=1")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
    expect(validateModelId("owner/repo/file.gguf#main")).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });

  it("accepts complex valid gguf file names", () => {
    expect(validateModelId("owner/repo/model.q4_k_m.gguf")).toEqual({
      valid: true,
    });
  });

  it("returns invalid for full URL strings", () => {
    expect(
      validateModelId("https://huggingface.co/owner/repo/file.gguf"),
    ).toEqual({
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    });
  });
});
