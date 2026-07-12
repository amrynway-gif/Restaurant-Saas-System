
export function buildTenantPublicSiteUrl(
  subdomain: string | null | undefined,
  hostHeader: string,
  proto: string
): string {
  if (!subdomain?.trim() || !hostHeader.trim()) return "";
  const sub = subdomain.trim().toLowerCase();
  const raw = hostHeader.trim();
  const hostnameOnly = raw.split(":")[0].toLowerCase();

  if (hostnameOnly === sub || hostnameOnly.startsWith(`${sub}.`)) {
    return `${proto}://${raw}`.replace(/\/$/, "");
  }

  return `${proto}://${sub}.${raw}`.replace(/\/$/, "");
}
