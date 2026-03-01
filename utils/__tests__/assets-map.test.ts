import { describe, expect, it } from "@jest/globals";
import { toAsset } from "../assets-map";

describe("toAsset", () => {
  it("returns empty array when input is empty", () => {
    expect(toAsset([])).toEqual([]);
  });

  it("maps required and optional fields", () => {
    const input = [
      {
        uri: "file://photo-1.jpg",
        assetId: "asset-1",
        width: 400,
        height: 300,
        fileName: "photo-1.jpg",
        fileSize: 1200,
        mimeType: "image/jpeg",
        base64: "abc123",
      },
    ] as any;

    expect(toAsset(input)).toEqual([
      {
        uri: "file://photo-1.jpg",
        assetId: "asset-1",
        width: 400,
        height: 300,
        fileName: "photo-1.jpg",
        fileSize: 1200,
        mimeType: "image/jpeg",
        base64: "abc123",
      },
    ]);
  });

  it("keeps output order equal to input order", () => {
    const input = [
      { uri: "1", width: 1, height: 1 },
      { uri: "2", width: 2, height: 2 },
      { uri: "3", width: 3, height: 3 },
    ] as any;

    const result = toAsset(input);
    expect(result.map((item) => item.uri)).toEqual(["1", "2", "3"]);
  });

  it("does not mutate input objects", () => {
    const input = [{ uri: "1", width: 10, height: 20 }] as any;
    const originalSnapshot = JSON.parse(JSON.stringify(input));

    toAsset(input);

    expect(input).toEqual(originalSnapshot);
  });

  it("does not include unknown extra fields", () => {
    const input = [
      {
        uri: "file://photo-2.jpg",
        width: 100,
        height: 100,
        customField: "should-not-be-copied",
      },
    ] as any;

    const result = toAsset(input);
    expect(result[0]).toEqual({
      uri: "file://photo-2.jpg",
      assetId: undefined,
      width: 100,
      height: 100,
      fileName: undefined,
      fileSize: undefined,
      mimeType: undefined,
      base64: undefined,
    });
    expect((result[0] as any).customField).toBeUndefined();
  });
});
