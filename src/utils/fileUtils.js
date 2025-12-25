import { UploadStatus } from "../features/upload/uploadTypes";

export function bytesToHuman(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v = v / 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isImageFile(file) {
  return !!file?.type?.startsWith("image/");
}

export function isAllowedFile(file) {
  // basit allowlist (genişletebilirsin)
  const name = (file?.name || "").toLowerCase();
  const okExt = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"];
  const okByExt = okExt.some((x) => name.endsWith(x));
  const okByType = file?.type?.startsWith("image/") || file?.type === "application/pdf";
  return okByType || okByExt;
}

export function createClientFileItem(file) {
  return {
    id: crypto.randomUUID(),
    file,
    status: UploadStatus.QUEUED,
    progress: 0,
    error: null,
    result: null,
  };
}
