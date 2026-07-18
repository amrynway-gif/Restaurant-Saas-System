"use client";

import type { GuestOrderWithDetails, OrderStatus } from "@/lib/types/database";
import { formatMenuPrice } from "@/lib/currencies";
import { secondaryCentsFromPrimaryCents } from "@/lib/secondary-currency";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_LABELS,
  nextOperationalStatus,
  orderStatusBadgeClasses,
  orderStatusCardClasses,
} from "@/lib/order-status-ui";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeftIcon } from "lucide-react";
import { CustomerPhoneActions } from "./customer-phone-actions";
import { OrderThermalPrintButton } from "./order-thermal-print-button";

const FULFILLMENT_LABELS: Record<string, string> = {
  dine_in: "Im Restaurant",
  pickup: "zu empfangen",
  delivery: "Lieferung",
};

type Props = {
  order: GuestOrderWithDetails;
  currencyCode: string;
  showSecondary: boolean;
  rate: number;
  secondaryCurrencyCode: string | null;
  updating: boolean;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onOpenDetails: () => void;
  phoneCountryPrefix: string | null;
  subdomain: string;
  publicBaseUrl: string;
  restaurantName: string;
  
  onOwnerApplyLoyaltyRedeem?: (orderId: string) => void | Promise<void>;
  ownerRedeeming?: boolean;
  
  waitersSystemEnabled?: boolean;
  waitersForFilter?: { id: string; name: string }[];
  onAssignWaiter?: (orderId: string, waiterId: string | null) => void | Promise<void>;
  assigningWaiterOrderId?: string | null;
};

export function OrderCard({
  order: o,
  currencyCode,
  showSecondary,
  rate,
  secondaryCurrencyCode,
  updating,
  onStatusChange,
  onOpenDetails,
  phoneCountryPrefix,
  subdomain,
  publicBaseUrl,
  restaurantName,
  onOwnerApplyLoyaltyRedeem,
  ownerRedeeming = false,
  waitersSystemEnabled = false,
  waitersForFilter = [],
  onAssignWaiter,
  assigningWaiterOrderId = null,
}: Props) {
  const subtotal = o.items.reduce((s, i) => s + i.line_total_cents, 0);
  const loyaltyDisc = o.loyalty_discount_cents ?? 0;
  const ownerDisc = o.owner_discount_cents ?? 0;
  const payable = Math.max(0, subtotal - loyaltyDisc - ownerDisc);
  const pointsEarnedOnOrder = o.loyalty_points_earned_on_order ?? 0;
  const next = nextOperationalStatus(o.status);
  const previewItems = o.items.slice(0, 3);
  const more = o.items.length - previewItems.length;

  return (
    <article
      className={cn(
        "relative rounded-2xl border p-4 transition-[box-shadow,ring] hover:ring-2 hover:ring-border/35 md:p-5",
        orderStatusCardClasses(o.status)
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl"
              dir="ltr"
            >
              #{o.display_number}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                orderStatusBadgeClasses(o.status)
              )}
            >
              {ORDER_STATUS_LABELS[o.status]}
            </span>
          </div>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <CalendarIcon className="size-3.5 shrink-0" aria-hidden />
            <span dir="ltr" className="tabular-nums">
              {new Date(o.created_at).toLocaleString("de-DE", {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
              })}
            </span>
          </p>
          <div className="space-y-0.5 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Mobiltelefon des Kunden</p>
            <CustomerPhoneActions
              phoneCountryPrefix={phoneCountryPrefix}
              customerPhone={o.customer_phone}
              displayNumber={o.display_number}
              trackingToken={o.tracking_token}
              subdomain={subdomain}
              publicBaseUrl={publicBaseUrl}
              restaurantName={restaurantName}
            />
            <p className="text-muted-foreground">
              {FULFILLMENT_LABELS[o.fulfillment] ?? o.fulfillment}
              {o.table_label ? ` — Tisch: ${o.table_label}` : ""}
            </p>
            {waitersSystemEnabled && o.fulfillment === "dine_in" ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-medium text-muted-foreground">Der verantwortliche Twitter</p>
                {waitersForFilter.length > 0 ? (
                  <select
                    className="w-full max-w-xs rounded-lg border border-input bg-background px-2 py-2 text-sm font-medium"
                    value={o.table_waiter_id ?? ""}
                    disabled={assigningWaiterOrderId === o.id || !onAssignWaiter}
                    onChange={(e) =>
                      onAssignWaiter?.(o.id, e.target.value ? e.target.value : null)
                    }
                    aria-label="Stelle die Luftfeuchtigkeit ein"
                  >
                    <option value="">
                      — Automatisch (Tischnässe falls verfügbar) —
                    </option>
                    {waitersForFilter.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Füge die Twitter-Namen aus den Einstellungen hinzu, um sie hier festzulegen.
                  </p>
                )}
              </div>
            ) : null}
            {o.delivery_address ? (
              <p className="text-xs leading-relaxed text-muted-foreground">die Adresse: {o.delivery_address}</p>
            ) : null}
          </div>
          <ul className="space-y-1 border-t border-border/50 pt-2 text-sm">
            {previewItems.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="min-w-0 truncate font-medium">
                  {i.menu_item_name ?? "Klassifizieren"}
                  {i.price_option_label ? ` (${i.price_option_label})` : ""} × {i.quantity}
                </span>
              </li>
            ))}
            {more > 0 ? (
              <li className="text-xs text-muted-foreground">+ {more} Andere Artikel</li>
            ) : null}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div
            className="w-full min-w-[200px] rounded-xl border border-border/90 bg-muted/35 px-3 py-2.5 sm:max-w-[240px]"
            dir="ltr"
          >
            <p className="text-center text-[10px] font-semibold tracking-wide text-muted-foreground">
              Betragsübersicht
            </p>
            <div className="mt-2 space-y-1.5 text-[12px]">
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-muted-foreground">Gesamtzahl der Artikel</span>
                <span dir="ltr" className="shrink-0 tabular-nums text-foreground">
                  {formatMenuPrice(subtotal, currencyCode)}
                </span>
              </div>
              {ownerDisc > 0 ? (
                <div className="flex w-full items-center justify-between gap-2 text-sky-800 dark:text-sky-300/95">
                  <span>Sonderrabatt</span>
                  <span dir="ltr" className="shrink-0 tabular-nums">
                    −{formatMenuPrice(ownerDisc, currencyCode)}
                  </span>
                </div>
              ) : null}
              {loyaltyDisc > 0 ? (
                <div className="flex w-full items-center justify-between gap-2 text-emerald-700 dark:text-emerald-400">
                  <span>
                    Rabatt auf Treuepunkte
                    <span className="ms-1 tabular-nums" dir="ltr">
                      ({o.loyalty_points_used ?? 0})
                    </span>
                  </span>
                  <span dir="ltr" className="shrink-0 tabular-nums">
                    −{formatMenuPrice(loyaltyDisc, currencyCode)}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {o.customer_loyalty_points_balance > 0 ? (
                    <p className="text-center text-[10px] text-muted-foreground">
                      Kundenpunktestand:{" "}
                      <span className="font-semibold tabular-nums text-foreground" dir="ltr">
                        {o.customer_loyalty_points_balance}
                      </span>
                    </p>
                  ) : (
                    <p className="text-center text-[10px] text-muted-foreground">
                      Für den Kunden besteht derzeit kein Punkteguthaben.
                    </p>
                  )}
                  {o.owner_can_apply_loyalty_redeem && onOwnerApplyLoyaltyRedeem ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-auto w-full whitespace-normal py-2 text-[11px] leading-snug"
                      disabled={ownerRedeeming}
                      onClick={() => void onOwnerApplyLoyaltyRedeem(o.id)}
                    >
                      {ownerRedeeming
                        ? "Rabatt wird angewendet..."
                        : `Punkterabatt anwenden (bis zu −${formatMenuPrice(o.owner_redeem_max_discount_cents, currencyCode)})`}
                    </Button>
                  ) : loyaltyDisc === 0 && o.customer_loyalty_points_balance > 0 ? (
                    <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
                      Auf diese Bestellung kann kein Rabatt gewährt werden (z. B. ein Artikelbetrag unter einem Punktwert oder eine stornierte Bestellung).
                    </p>
                  ) : null}
                  {pointsEarnedOnOrder > 0 ? (
                    <p className="text-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      +{pointsEarnedOnOrder} Durch diese Anfrage erhaltener Punkt
                    </p>
                  ) : null}
                </div>
              )}
              <div className="flex w-full items-center justify-between gap-2 border-t border-border/70 pt-2 text-sm font-bold text-foreground">
                <span>Das Fällige</span>
                <span dir="ltr" className="shrink-0 tabular-nums text-base">
                  {formatMenuPrice(payable, currencyCode)}
                </span>
              </div>
            </div>
            {showSecondary && secondaryCurrencyCode ? (
              <p dir="ltr" className="mt-1.5 text-center text-[10px] font-medium tabular-nums text-muted-foreground">
                {formatMenuPrice(secondaryCentsFromPrimaryCents(payable, rate), secondaryCurrencyCode)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {next ? (
              <Button
                size="sm"
                className="w-full justify-center gap-1 sm:w-auto"
                disabled={updating}
                onClick={() => onStatusChange(o.id, next)}
              >
                {ORDER_STATUS_LABELS[next]}
                <ChevronLeftIcon className="size-4" aria-hidden />
              </Button>
            ) : null}
            {o.status === "ready" ? (
              <p className="text-center text-xs text-blue-200/90 sm:text-end">
                Die Bestellung ist fertig – der Kunde kann sie abholen oder über die Schaltflächen oben Kontakt mit uns aufnehmen.
              </p>
            ) : null}
            <label className="flex items-center gap-2 text-xs text-muted-foreground sm:flex-col sm:items-end">
              <span className="sr-only">Statusaktualisierung</span>
              <select
                className="max-w-full rounded-lg border border-input bg-background px-2 py-2 text-sm font-medium"
                value={o.status}
                disabled={updating}
                onChange={(e) => onStatusChange(o.id, e.target.value as OrderStatus)}
              >
                {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex w-full flex-col gap-2 sm:max-w-[240px] sm:items-end">
              <OrderThermalPrintButton
                order={o}
                restaurantName={restaurantName}
                currencyCode={currencyCode}
                compact
                className="w-full"
              />
              <button
                type="button"
                onClick={onOpenDetails}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Details anzeigen
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
