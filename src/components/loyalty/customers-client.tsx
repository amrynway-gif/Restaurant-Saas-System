"use client";

import type { RestaurantCustomerPhone } from "@/lib/types/database";
import { formatMenuPrice } from "@/lib/currencies";
import { secondaryCentsFromPrimaryCents } from "@/lib/secondary-currency";
import { redemptionValueCents } from "@/lib/loyalty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  customers: RestaurantCustomerPhone[];
  currencyCode: string;
  pointValueCents: number;
  secondaryCurrencyCode?: string | null;
  secondaryExchangeRate?: number | null;
};

export function CustomersClient({
  customers,
  currencyCode,
  pointValueCents,
  secondaryCurrencyCode = null,
  secondaryExchangeRate = null,
}: Props) {
  const rateRaw =
    secondaryExchangeRate != null ? Number(secondaryExchangeRate) : NaN;
  const showSecondary =
    Boolean(secondaryCurrencyCode) &&
    Number.isFinite(rateRaw) &&
    rateRaw > 0;
  const rate = showSecondary ? rateRaw : NaN;
  if (customers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Es sind noch keine Kunden registriert. Der Kunde erscheint hier nach der ersten Bestellung, bei der er seine Handynummer über das Menü eingibt.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-end">ALJUNDAL</TableHead>
            <TableHead className="text-end">Anfragenummer</TableHead>
            <TableHead className="text-end">Gesamtzahl der YA-Käufer</TableHead>
            <TableHead className="text-end">Punktemonitor</TableHead>
            <TableHead className="text-end">Saldowert (Schätzung)</TableHead>
            <TableHead className="text-end">Erreichte Punkte (insgesamt)</TableHead>
            <TableHead className="text-end">Punkte getauscht</TableHead>
            <TableHead className="text-end">Erster Besuch</TableHead>
            <TableHead className="text-end">Letzte Bestellung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => {
            const redeemEstimate = redemptionValueCents(
              c.points_balance,
              pointValueCents
            );
            return (
              <TableRow key={c.id}>
                <TableCell dir="ltr" className="font-mono text-sm tabular-nums">
                  {c.phone_normalized}
                </TableCell>
                <TableCell className="tabular-nums">{c.order_count}</TableCell>
                <TableCell dir="ltr" className="tabular-nums">
                  <div className="flex flex-col gap-0.5">
                    <span>{formatMenuPrice(c.total_spent_cents, currencyCode)}</span>
                    {showSecondary && secondaryCurrencyCode ? (
                      <span className="text-[11px] text-muted-foreground">
                        {formatMenuPrice(
                          secondaryCentsFromPrimaryCents(c.total_spent_cents, rate),
                          secondaryCurrencyCode
                        )}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{c.points_balance}</TableCell>
                <TableCell dir="ltr" className="text-sm tabular-nums text-muted-foreground">
                  <div className="flex flex-col gap-0.5">
                    <span>{formatMenuPrice(redeemEstimate, currencyCode)}</span>
                    {showSecondary && secondaryCurrencyCode ? (
                      <span className="text-[11px] opacity-90">
                        {formatMenuPrice(
                          secondaryCentsFromPrimaryCents(redeemEstimate, rate),
                          secondaryCurrencyCode
                        )}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{c.lifetime_points_earned}</TableCell>
                <TableCell className="tabular-nums">{c.lifetime_points_redeemed}</TableCell>
                <TableCell dir="ltr" className="text-xs tabular-nums text-muted-foreground">
                  {c.first_seen_at
                    ? new Date(c.first_seen_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                        hour12: false,
                      })
                    : "—"}
                </TableCell>
                <TableCell dir="ltr" className="text-xs tabular-nums text-muted-foreground">
                  {c.last_order_at
                    ? new Date(c.last_order_at).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                        hour12: false,
                      })
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
