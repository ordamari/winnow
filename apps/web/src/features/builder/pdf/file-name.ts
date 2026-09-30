export function resumeFileName(name: string) {
  const slug = name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
  return `${slug || "Resume"}_Resume.pdf`;
}
