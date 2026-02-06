export default function clampProgress(progress: number): number {
  if (Number.isNaN(progress)) {
    return 0;
  }
  return Math.max(0, Math.min(100, progress));
}
