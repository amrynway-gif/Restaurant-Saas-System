
export const MENU_CURRENCIES = [
  { code: "ILS", labelAr: "NIS", symbol: "₪" },
  { code: "SYP", labelAr: "Syrische Pfund", symbol: "L.S" },
  { code: "JOD", labelAr: "Jordanischer Dinar", symbol: "D.A" },
  { code: "SAR", labelAr: "Saudi-Rial", symbol: "﷼" },
  { code: "USD", labelAr: "US-Dollar", symbol: "$" },
  { code: "AED", labelAr: "Emiratischer Dirham", symbol: "D.E" },
  { code: "KWD", labelAr: "Kuwaitischer Dinar", symbol: "KWD" },
  { code: "IQD", labelAr: "Irakischer Dinar", symbol: "zählen" },
  { code: "LBP", labelAr: "LL", symbol: "LL" },
] as const;

export type MenuCurrencyCode = (typeof MENU_CURRENCIES)[number]["code"];


const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  MENU_CURRENCIES.map((c) => [c.code, c.symbol])
);


export function formatMenuPrice(cents: number, currencyCode: string): string {
  const code =
    currencyCode && MENU_CURRENCIES.some((c) => c.code === currencyCode)
      ? currencyCode
      : "SAR";
  const symbol = CURRENCY_SYMBOLS[code] ?? "﷼";
  const value = cents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${symbol}`;
}
