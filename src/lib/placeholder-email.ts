
const PLACEHOLDER_DOMAIN = "users.example.com";


export function getPlaceholderEmail(username: string): string {
  const safe = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return safe ? `${safe}@${PLACEHOLDER_DOMAIN}` : `guest@${PLACEHOLDER_DOMAIN}`;
}


export function isPlaceholderEmail(email: string): boolean {
  return typeof email === "string" && email.endsWith(`@${PLACEHOLDER_DOMAIN}`);
}
