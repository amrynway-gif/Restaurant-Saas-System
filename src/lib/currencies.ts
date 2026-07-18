
export const MENU_CURRENCIES = [
  { code: "EUR", labelAr: "Euro", symbol: "€" },
  { code: "USD", labelAr: "US-Dollar", symbol: "$" },
  { code: "GBP", labelAr: "Britisches Pfund", symbol: "£" },
  { code: "CHF", labelAr: "Schweizer Franken", symbol: "CHF" },
] as const;

export type MenuCurrencyCode = (typeof MENU_CURRENCIES)[number]["code"];


const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  MENU_CURRENCIES.map((c) => [c.code, c.symbol])
);


export function formatMenuPrice(cents: number, currencyCode: string): string {
  const code =
    currencyCode && MENU_CURRENCIES.some((c) => c.code === currencyCode)
      ? currencyCode
      : "EUR";
  const symbol = CURRENCY_SYMBOLS[code] ?? "€";
  const value = cents / 100;
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${symbol}`;
}
