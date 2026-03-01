import { Directory, File, Paths } from "expo-file-system";

type ExportNoteMarkdownInput = {
  title?: string;
  content: string;
  createdAt?: Date;
};

const EXPORTS_DIRECTORY_NAME = "exports";
const FALLBACK_NOTE_FILE_NAME = "untitled-note";

function formatDateSegment(value: Date): string {
  const year = String(value.getFullYear());
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const seconds = String(value.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime());
}

export function sanitizeFileName(title: string): string {
  const normalized = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.\- ]+|[.\- ]+$/g, "");

  return normalized.length > 0 ? normalized : FALLBACK_NOTE_FILE_NAME;
}

export function buildExportFileName(title: string, createdAt?: Date): string {
  const safeTitle = sanitizeFileName(title);
  const date = createdAt && isValidDate(createdAt) ? createdAt : new Date();
  const stamp = formatDateSegment(date);
  return `${safeTitle}-${stamp}.md`;
}

export async function exportNoteMarkdown({
  title,
  content,
  createdAt,
}: ExportNoteMarkdownInput): Promise<File> {
  const exportsDirectory = new Directory(Paths.cache, EXPORTS_DIRECTORY_NAME);

  const fileName = buildExportFileName(
    title ?? FALLBACK_NOTE_FILE_NAME,
    createdAt,
  );
  const file = new File(exportsDirectory, fileName);
  try {
    if (file.exists) {
      file.delete();
    }
    file.create({ intermediates: true });
    file.write(content);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to write markdown file.";
    throw new Error(message);
  }

  return file;
}
