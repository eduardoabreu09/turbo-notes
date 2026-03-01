import { describe, expect, it } from "@jest/globals";

import { createNoteFormStore } from "../note-form-store";

describe("createNoteFormStore", () => {
  it("creates store with default state", () => {
    const store = createNoteFormStore();
    const state = store.getState();

    expect(state.title).toBe("New Note");
    expect(state.prompt).toBeUndefined();
    expect(state.photos).toEqual([]);
    expect(state.model).toBeUndefined();
  });

  it("applies init props override", () => {
    const photos = [{ uri: "file://1.jpg", width: 100, height: 100 }];
    const store = createNoteFormStore({
      title: "Draft",
      prompt: "Hello",
      photos,
      model: "llama-3b",
    });

    const state = store.getState();
    expect(state.title).toBe("Draft");
    expect(state.prompt).toBe("Hello");
    expect(state.photos).toBe(photos);
    expect(state.model).toBe("llama-3b");
  });

  it("updates state with actions", () => {
    const store = createNoteFormStore();
    const photos = [{ uri: "file://2.jpg", width: 200, height: 300 }];

    store.getState().setTitle("Updated");
    store.getState().setPrompt("Prompt text");
    store.getState().setPhotos(photos);
    store.getState().setModel("qwen-3b");

    const state = store.getState();
    expect(state.title).toBe("Updated");
    expect(state.prompt).toBe("Prompt text");
    expect(state.photos).toBe(photos);
    expect(state.model).toBe("qwen-3b");
  });

  it("allows clearing optional fields with undefined", () => {
    const store = createNoteFormStore({
      prompt: "Existing prompt",
      model: "existing-model",
    });

    store.getState().setPrompt(undefined);
    store.getState().setModel(undefined);

    const state = store.getState();
    expect(state.prompt).toBeUndefined();
    expect(state.model).toBeUndefined();
  });

  it("reset restores initial state values", () => {
    const store = createNoteFormStore({
      title: "Custom title",
      prompt: "Custom prompt",
      photos: [{ uri: "file://3.jpg", width: 100, height: 100 }],
      model: "custom-model",
    });

    store.getState().setTitle("Changed");
    store.getState().setPrompt("Changed prompt");
    store.getState().setPhotos([{ uri: "file://4.jpg", width: 50, height: 50 }]);
    store.getState().setModel("changed-model");
    store.getState().reset();

    const state = store.getState();
    expect(state.title).toBe("New Note");
    expect(state.prompt).toBeUndefined();
    expect(state.photos).toEqual([]);
    expect(state.model).toBeUndefined();
  });

  it("keeps same ref objects and preserves ref current values across reset", () => {
    const store = createNoteFormStore();
    const before = store.getState();
    const titleRef = before.titleRef;
    const promptRef = before.promptRef;
    const bottomModalRef = before.bottomModalRef;
    const titleCurrent = { id: "title-input" };
    const promptCurrent = { id: "prompt-input" };
    const bottomCurrent = { id: "bottom-sheet" };

    (titleRef as { current: unknown }).current = titleCurrent;
    (promptRef as { current: unknown }).current = promptCurrent;
    (bottomModalRef as { current: unknown }).current = bottomCurrent;

    store.getState().reset();

    const after = store.getState();
    expect(after.titleRef).toBe(titleRef);
    expect(after.promptRef).toBe(promptRef);
    expect(after.bottomModalRef).toBe(bottomModalRef);
    expect((after.titleRef as { current: unknown }).current).toBe(titleCurrent);
    expect((after.promptRef as { current: unknown }).current).toBe(promptCurrent);
    expect((after.bottomModalRef as { current: unknown }).current).toBe(
      bottomCurrent,
    );
  });

  it("keeps separate instances isolated", () => {
    const storeA = createNoteFormStore({ title: "A" });
    const storeB = createNoteFormStore({ title: "B" });

    storeA.getState().setTitle("Only A");

    expect(storeA.getState().title).toBe("Only A");
    expect(storeB.getState().title).toBe("B");
  });
});
