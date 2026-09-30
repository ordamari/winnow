const links = new Map<string, string>();

export function rememberMagicLink(email: string, url: string) {
  if (process.env.E2E_TEST !== "1") return;
  links.set(email.toLowerCase(), url);
}

export function readMagicLink(email: string) {
  return links.get(email.toLowerCase());
}
