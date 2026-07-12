
export function normalizeInternationalDigits(
  countryPrefixDigits: string | null | undefined,
  customerStoredDigits: string
): string {
  const customer = customerStoredDigits.replace(/\D/g, "");
  const prefix = (countryPrefixDigits ?? "").replace(/\D/g, "");
  if (!prefix) return customer;
  if (customer.startsWith(prefix)) return customer;
  let local = customer;
  if (local.startsWith("0")) local = local.slice(1);
  return prefix + local;
}


export function formatInternationalPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  return `+${d}`;
}

export function buildPublicOrderTrackingUrl(
  publicBaseUrl: string,
  subdomain: string,
  trackingToken: string
): string {
  const base = publicBaseUrl.replace(/\/$/, "");
  const path = `/menu/${encodeURIComponent(subdomain)}/track/${trackingToken}`;
  if (!base) return path;
  return `${base}${path}`;
}


export function buildWhatsAppOrderStaffMessage(params: {
  restaurantName: string;
  displayNumber: number;
  trackingUrl: string;
}): string {
  const name = params.restaurantName.trim() || "Das Restaurant";
  return [
    `Willkommen, es wurde von Dir in Y ${name} angenommen.`,
    "",
    `Bestellnummer: #${params.displayNumber}`,
    "Deine Anfrage wird derzeit vorbereitet.",
    "",
    "🔗 Auftragsverfolgung:",
    params.trackingUrl,
  ].join("\n");
}

export function buildWhatsAppMeUrl(phoneDigits: string, text: string): string {
  const d = phoneDigits.replace(/\D/g, "");
  const q = encodeURIComponent(text);
  return `https://wa.me/${d}?text=${q}`;
}

export function buildTelHref(phoneDigits: string): string {
  const d = phoneDigits.replace(/\D/g, "");
  if (!d) return "#";
  return `tel:+${d}`;
}


export function buildWhatsAppLoyaltyPointsMessage(params: {
  restaurantName: string;
  customerName?: string | null;
  pointsBalance: number;
  loyaltyPageUrl: string;
}): string {
  const place = params.restaurantName.trim() || "Das Restaurant";
  const who = params.customerName?.trim() || "Willkommen";
  return [
    `${who},`,
    `Überwachen Du Ihren Punkt im Programm Und ${place}: ${params.pointsBalance} in Punkt.`,
    "",
    "🔗 Um deinen Punkten zu folgen und sie aufzuzeichnen:",
    params.loyaltyPageUrl,
  ].join("\n");
}
