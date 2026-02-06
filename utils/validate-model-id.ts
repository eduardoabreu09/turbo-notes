export type ModelIdValidationResult = {
  valid: boolean;
  reason?: string;
};
const GGUF_MODEL_ID_PATTERN = /^[^/\s]+\/[^/\s]+\/[^/\s]+\.gguf$/i;

export default function validateModelId(
  modelId: string,
): ModelIdValidationResult {
  const normalized = modelId.trim();

  if (!normalized) {
    return {
      valid: false,
      reason: "Model ID is required.",
    };
  }

  if (!GGUF_MODEL_ID_PATTERN.test(normalized)) {
    return {
      valid: false,
      reason: 'Use "owner/repo/file.gguf" format.',
    };
  }

  return { valid: true };
}
