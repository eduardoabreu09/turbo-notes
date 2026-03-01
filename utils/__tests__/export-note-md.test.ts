import { describe, expect, it } from "@jest/globals";
import { buildExportFileName, sanitizeFileName } from "../export-note-md";

describe("sanitizeFileName", () => {
  it("trims and replaces whitespace with single dashes", () => {
    expect(sanitizeFileName("  My   Note  Title  ")).toBe("My-Note-Title");
  });

  it("replaces invalid path characters", () => {
    expect(sanitizeFileName('a/b\\c:*?"<>|d')).toBe("a-b-c-d");
  });

  it("returns fallback when title has only invalid path characters", () => {
    expect(sanitizeFileName('<>:"/\\|?*')).toBe("untitled-note");
  });

  it("normalizes tabs and newlines into dashes", () => {
    expect(sanitizeFileName("My\tNote\nTitle")).toBe("My-Note-Title");
  });

  it("keeps unicode characters while sanitizing separators", () => {
    expect(sanitizeFileName("Olá 🚀 / Teste")).toBe("Olá-🚀-Teste");
  });

  it("returns fallback name when title sanitizes to empty", () => {
    expect(sanitizeFileName("   ...---   ")).toBe("untitled-note");
  });
});

describe("buildExportFileName", () => {
  it("builds deterministic file name with createdAt", () => {
    const createdAt = new Date(2026, 0, 2, 3, 4, 5);
    expect(buildExportFileName("My Note", createdAt)).toBe(
      "My-Note-20260102-030405.md",
    );
  });

  it("uses fallback title when input title is empty", () => {
    const createdAt = new Date(2026, 0, 2, 3, 4, 5);
    expect(buildExportFileName("   ", createdAt)).toBe(
      "untitled-note-20260102-030405.md",
    );
  });

  it("keeps title with md suffix and still appends final extension", () => {
    const createdAt = new Date(2026, 0, 2, 3, 4, 5);
    expect(buildExportFileName("meeting.md", createdAt)).toBe(
      "meeting.md-20260102-030405.md",
    );
  });

  it("falls back to a valid timestamp when date is invalid", () => {
    const invalidDate = new Date("invalid");
    const result = buildExportFileName("My Note", invalidDate);

    expect(result).toMatch(/^My-Note-\d{8}-\d{6}\.md$/);
    expect(result.includes("NaN")).toBe(false);
  });
});
