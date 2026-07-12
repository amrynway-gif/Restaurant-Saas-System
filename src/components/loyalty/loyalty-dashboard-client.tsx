"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  enqueueCustomerPointsNotification,
  generateCustomerMagicLink,
  type LoyaltyDashboardCustomer,
  redeemCustomerCashPoints,
  redeemCustomerReward,
  upsertRestaurantReward,
} from "@/app/actions/customers";
import { processQueuedNotifications } from "@/app/actions/notifications";
import { formatMenuPrice } from "@/lib/currencies";
import { redemptionValueCents } from "@/lib/loyalty";
import { secondaryCentsFromPrimaryCents } from "@/lib/secondary-currency";
import {
  buildWhatsAppLoyaltyPointsMessage,
  buildWhatsAppMeUrl,
  normalizeInternationalDigits,
} from "@/lib/customer-phone";
import { cn } from "@/lib/utils";

type RewardRow = {
  id: string;
  title: string;
  description: string | null;
  points_cost: number;
  active: boolean;
  optional_stock: number | null;
};

type NotificationRow = {
  id: string;
  channel: string;
  template_key: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  error: string | null;
};

type Props = {
  customers: LoyaltyDashboardCustomer[];
  rewards: RewardRow[];
  notifications: NotificationRow[];
  phoneCountryPrefix: string | null;
  subdomain: string;
  publicBaseUrl: string;
  restaurantName: string;
  currencyCode: string;
  pointValueCents: number;
  secondaryCurrencyCode?: string | null;
  secondaryExchangeRate?: number | null;
};

type TabId = "customers" | "transactions" | "rewards" | "campaigns" | "settings";

const tabs: { id: TabId; label: string }[] = [
  { id: "customers", label: "Kunden" },
  { id: "transactions", label: "Schneller Austausch" },
  { id: "rewards", label: "Belohnungen" },
  { id: "campaigns", label: "Benachrichtigungen" },
  { id: "settings", label: "Wiedergabeeinstellungen" },
];

export function LoyaltyDashboardClient({
  customers,
  rewards,
  notifications,
  phoneCountryPrefix,
  subdomain,
  publicBaseUrl,
  restaurantName,
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
  const secondaryRate = showSecondary ? rateRaw : NaN;

  const [tab, setTab] = useState<TabId>("customers");
  const [q, setQ] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedLinkCustomerId, setCopiedLinkCustomerId] = useState<string | null>(null);
  const copySuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cashPointsByCustomer, setCashPointsByCustomer] = useState<Record<string, string>>({});
  const [rewardPickByCustomer, setRewardPickByCustomer] = useState<Record<string, string>>({});

  function flashLinkCopied(customerId: string) {
    if (copySuccessTimerRef.current) clearTimeout(copySuccessTimerRef.current);
    setCopiedLinkCustomerId(customerId);
    copySuccessTimerRef.current = setTimeout(() => {
      setCopiedLinkCustomerId(null);
      copySuccessTimerRef.current = null;
    }, 2200);
  }

  const filteredCustomers = useMemo(() => {
    const query = q.trim();
    if (!query) return customers;
    return customers.filter(
      (c) => c.phone_normalized.includes(query) || (c.name ?? "").includes(query)
    );
  }, [customers, q]);

  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    pointsCost: "100",
    optionalStock: "",
    active: true,
  });

  function waDigitsForCustomer(phoneNormalized: string): string {
    return normalizeInternationalDigits(phoneCountryPrefix, phoneNormalized);
  }

  async function copyTextToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fall through */
      }
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Wie benutzt man dieses Board?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Punkte-Link für den Kunden:</strong> Er öffnet eine allgemeine Seite mit seinem Kontostand und seinem Verlauf (ohne Anmeldung).
          </li>
          <li>
            <strong>WhatsApp:</strong> Dem Kunden wird eine Nachricht mit seinem Kontostand und einem Link zur Seite gesendet (nachdem er zuvor den Link generiert hat).
          </li>
          <li>
            <strong>Hinweis zur Liste:</strong> Fügt eine Nachricht zur Sendewarteschlange hinzu – klicke dann auf der Registerkarte „Benachrichtigungen“ auf „Abspielen“.
Jetzt verarbeiten“ (oder Cron später aktivieren, um tatsächliche SMS/WhatsApp zu senden).
          </li>
          <li>
            <strong>Bargeldumtausch:</strong> Es zieht Punkte ab und berechnet den Rabattwert in Cent gemäß den Punktwerteinstellungen (Nr
Bestellnummer erforderlich).
          </li>
          <li>
            <strong>Bonus einlösen:</strong> Wähle eine Belohnung aus der Liste aus, sofern diese auf der Registerkarte „Belohnungen“ verfügbar ist.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {feedback ? (
        <p className="rounded-md border border-border/60 px-3 py-2 text-sm whitespace-pre-wrap text-muted-foreground">
          {feedback}
        </p>
      ) : null}

      {tab === "customers" ? (
        <Card>
          <CardHeader>
            <CardTitle>Loyalitätsmanagement für jeden Kunden</CardTitle>
            <CardDescription>
              Dieselben Mobiltelefonnummern wie oben – automatisch synchronisiert mit dem professionellen Punktesystem. Spalte „Saldowert“.
(Schätzung)“ = Punktestand x Punktewert aus den Treueeinstellungen (wie in der vorherigen Tabelle).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              dir="ltr"
              placeholder="Suche nach Mobiltelefon oder Name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">ALJUNDAL</TableHead>
                    <TableHead>der Name</TableHead>
                    <TableHead>Gleichgewicht</TableHead>
                    <TableHead>Saldowert (Schätzung)</TableHead>
                    <TableHead>Erworben</TableHead>
                    <TableHead>Ersetzt</TableHead>
                    <TableHead>Operationen</TableHead>
                    <TableHead className="min-w-[280px]">Verfahren</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Im neuen System sind noch keine Mandanten vorhanden. Stelle sicher, dass die Loyalitäts-SQL-Datei ausgeführt wird, und lade dann die Seite neu.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((c) => {
                      const redeemEstimate = redemptionValueCents(
                        c.points_balance,
                        pointValueCents
                      );
                      return (
                      <TableRow key={c.customer_id}>
                        <TableCell dir="ltr" className="font-mono text-sm">
                          {c.phone_normalized}
                        </TableCell>
                        <TableCell>{c.name ?? "—"}</TableCell>
                        <TableCell className="tabular-nums">{c.points_balance}</TableCell>
                        <TableCell dir="ltr" className="text-sm tabular-nums text-muted-foreground">
                          <div className="flex flex-col gap-0.5">
                            <span>{formatMenuPrice(redeemEstimate, currencyCode)}</span>
                            {showSecondary && secondaryCurrencyCode ? (
                              <span className="text-[11px] opacity-90">
                                {formatMenuPrice(
                                  secondaryCentsFromPrimaryCents(
                                    redeemEstimate,
                                    secondaryRate
                                  ),
                                  secondaryCurrencyCode
                                )}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="tabular-nums">{c.lifetime_earned}</TableCell>
                        <TableCell className="tabular-nums">{c.lifetime_redeemed}</TableCell>
                        <TableCell className="tabular-nums">{c.tx_count}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                disabled={pending}
                                title="Kopiere den Link zur Punkteseite"
                                aria-label="Kopiere den Link zur Punkteseite"
                                className={cn(
                                  "size-9 shrink-0 border-emerald-500/45 text-emerald-600 transition-all",
                                  "hover:border-emerald-500 hover:bg-emerald-500/12 hover:text-emerald-700",
                                  "focus-visible:ring-emerald-500/30",
                                  copiedLinkCustomerId === c.customer_id &&
                                    "border-emerald-600 bg-emerald-500/15 text-emerald-700 shadow-sm"
                                )}
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await generateCustomerMagicLink(c.customer_id);
                                    if (res.error || !res.url) {
                                      toast.error("Der Link konnte nicht erstellt werden", {
                                        description: res.error ?? undefined,
                                      });
                                      return;
                                    }
                                    const copied = await copyTextToClipboard(res.url);
                                    if (copied) {
                                      flashLinkCopied(c.customer_id);
                                      toast.success("Punktelink kopiert", {
                                        description: "Du können es in WhatsApp oder eine andere Anwendung einfügen.",
                                        duration: 2800,
                                      });
                                    } else {
                                      toast.error("Automatisches Kopieren nicht möglich", {
                                        description: res.url,
                                        duration: 8000,
                                      });
                                    }
                                  })
                                }
                              >
                                {copiedLinkCustomerId === c.customer_id ? (
                                  <Check className="size-4" aria-hidden strokeWidth={2.5} />
                                ) : (
                                  <Link2 className="size-4" aria-hidden strokeWidth={2} />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={pending}
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await generateCustomerMagicLink(c.customer_id);
                                    if (res.error || !res.url) {
                                      setFeedback(res.error ?? "Der Link konnte nicht erstellt werden");
                                      return;
                                    }
                                    const msg = buildWhatsAppLoyaltyPointsMessage({
                                      restaurantName,
                                      customerName: c.name,
                                      pointsBalance: c.points_balance,
                                      loyaltyPageUrl: res.url,
                                    });
                                    const href = buildWhatsAppMeUrl(waDigitsForCustomer(c.phone_normalized), msg);
                                    window.open(href, "_blank", "noopener,noreferrer");
                                    setFeedback("WhatsApp wurde mit einer fertigen Nachricht geöffnet. Sende es an den Kunden.");
                                  })
                                }
                              >
                                WhatsApp
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={pending}
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await enqueueCustomerPointsNotification(c.customer_id);
                                    setFeedback(
                                      res.error
                                        ? res.error
                                        : `Die Nachricht wurde an den Schüler gesendet.\nNachricht:\n${res.previewMessage}\n\nA Gehen Du zu UndY mit „Benachrichtigungen“ und drücken Du „Führe getzt den Assistenten aus“.`
                                    );
                                  })
                                }
                              >
                                Hinweis (Warteschlange)
                              </Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Input
                                dir="ltr"
                                className="h-8 w-20 text-xs"
                                type="number"
                                min={1}
                                placeholder="Punkte"
                                value={cashPointsByCustomer[c.customer_id] ?? ""}
                                onChange={(e) =>
                                  setCashPointsByCustomer((s) => ({
                                    ...s,
                                    [c.customer_id]: e.target.value,
                                  }))
                                }
                              />
                              <Button
                                size="sm"
                                className="h-8"
                                disabled={pending}
                                onClick={() =>
                                  startTransition(async () => {
                                    const raw = cashPointsByCustomer[c.customer_id];
                                    const pts = Math.max(1, Math.floor(Number(raw ?? 0)));
                                    const res = await redeemCustomerCashPoints(c.customer_id, pts, null);
                                    setFeedback(
                                      res.error
                                        ? `Bargeldumtausch: ${res.error}`
                                        : `${res.pointsRedeemed} ein Punkt wurde rabattiert. Rabattwertangebot: ${res.discountCents} Cent (gilt für UndYA in Ihrem System). Gleichgewicht NewBalance: ${res.newBalance}.`
                                    );
                                  })
                                }
                              >
                                Punkteabzug
                              </Button>
                              {rewards.length > 0 ? (
                                <>
                                  <select
                                    className="h-8 max-w-[140px] rounded-md border border-input bg-background px-2 text-xs"
                                    value={rewardPickByCustomer[c.customer_id] ?? ""}
                                    onChange={(e) =>
                                      setRewardPickByCustomer((s) => ({
                                        ...s,
                                        [c.customer_id]: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">belohnen...</option>
                                    {rewards
                                      .filter((r) => r.active)
                                      .map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.title} ({r.points_cost})
                                        </option>
                                      ))}
                                  </select>
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    variant="outline"
                                    disabled={pending || !rewardPickByCustomer[c.customer_id]}
                                    onClick={() =>
                                      startTransition(async () => {
                                        const rid = rewardPickByCustomer[c.customer_id];
                                        if (!rid) return;
                                        const res = await redeemCustomerReward(c.customer_id, rid);
                                        setFeedback(
                                          res.error
                                            ? `Bonus einlösen: ${res.error}`
                                            : `Bonus Undiscounted ${res.pointsSpent} ein Punkt. Gleichgewicht: ${res.newBalance}.`
                                        );
                                      })
                                    }
                                  >
                                    ersetzen
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "transactions" ? (
        <Card>
          <CardHeader>
            <CardTitle>Ersatz ohne technische Kennungen</CardTitle>
            <CardDescription>
              Der einfachste Weg: Nutze den Reiter „Kunden“ und die Buttons „Punkte abziehen“ oder „Einlösen“ neben jeder Zahl. Dieser Abschnitt
Zum manuellen Kopieren von Kunden-/Bestell-IDs, wenn du diese benötigen.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <form
              className="space-y-2 rounded-md border border-border/60 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const customerId = String(form.get("customer_id") ?? "");
                const orderIdRaw = String(form.get("order_id") ?? "");
                const points = Number(form.get("points") ?? 0);
                startTransition(async () => {
                  const res = await redeemCustomerCashPoints(
                    customerId,
                    points,
                    orderIdRaw.trim() ? orderIdRaw.trim() : null
                  );
                  setFeedback(
                    res.error
                      ? `Der Bargeldumtausch ist fehlgeschlagen: ${res.error}`
                      : `${res.pointsRedeemed} ein Punkt Undiskontierte ${res.discountCents} Cent. Gleichgewicht: ${res.newBalance}.`
                  );
                });
              }}
            >
              <p className="text-sm font-medium">Bargeldwechsel (Erweitert)</p>
              <Input name="customer_id" placeholder="Client-ID (UUID)" dir="ltr" required />
              <Input
                name="order_id"
                placeholder="Bestell-ID (optional – leer lassen)"
                dir="ltr"
              />
              <Input name="points" placeholder="Anzahl der Punkte" type="number" min={1} required />
              <Button size="sm" disabled={pending}>
                umzusetzen
              </Button>
            </form>

            <form
              className="space-y-2 rounded-md border border-border/60 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const customerId = String(form.get("customer_id") ?? "");
                const rewardId = String(form.get("reward_id") ?? "");
                const orderIdRaw = String(form.get("order_id") ?? "");
                startTransition(async () => {
                  const res = await redeemCustomerReward(
                    customerId,
                    rewardId,
                    orderIdRaw.trim() ? orderIdRaw.trim() : undefined
                  );
                  setFeedback(
                    res.error
                      ? `Das Einlösen der Prämie ist fehlgeschlagen: ${res.error}`
                      : `Fertig arsetzen. Punkte Eine Zusammenfassung: ${res.pointsSpent} — Gleichgewicht: ${res.newBalance}.`
                  );
                });
              }}
            >
              <p className="text-sm font-medium">Bonus einlösen (Erweitert)</p>
              <Input name="customer_id" placeholder="Kunden-ID" dir="ltr" required />
              <Input name="reward_id" placeholder="Prämien-ID" dir="ltr" required />
              <Input name="order_id" placeholder="Bestell-ID (optional)" dir="ltr" />
              <Button size="sm" disabled={pending}>
                umzusetzen
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "rewards" ? (
        <Card>
          <CardHeader>
            <CardTitle>Prämienkatalog</CardTitle>
            <CardDescription>Definiere die Prämien, die gegen Punkte einlösbar sind, auf der Registerkarte „Kunden“.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="grid gap-3 rounded-md border border-border/60 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                startTransition(async () => {
                  const res = await upsertRestaurantReward({
                    title: rewardForm.title,
                    description: rewardForm.description || null,
                    pointsCost: Number(rewardForm.pointsCost),
                    active: rewardForm.active,
                    optionalStock: rewardForm.optionalStock ? Number(rewardForm.optionalStock) : null,
                  });
                  setFeedback(res.error ? `Speichhere die Belohnung failed: ${res.error}` : "Belohnung gespeichert – lade die Seite neu, wenn sie nicht in der Liste erscheint.");
                });
              }}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="reward-title">die Adresse</Label>
                <Input
                  id="reward-title"
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm((s) => ({ ...s, title: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reward-desc">Beschreibung</Label>
                <Textarea
                  id="reward-desc"
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reward-points">Punkte kosten</Label>
                <Input
                  id="reward-points"
                  type="number"
                  min={1}
                  value={rewardForm.pointsCost}
                  onChange={(e) => setRewardForm((s) => ({ ...s, pointsCost: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reward-stock">Inventar (optional)</Label>
                <Input
                  id="reward-stock"
                  type="number"
                  min={0}
                  value={rewardForm.optionalStock}
                  onChange={(e) => setRewardForm((s) => ({ ...s, optionalStock: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rewardForm.active}
                  onCheckedChange={(v) => setRewardForm((s) => ({ ...s, active: v }))}
                />
                <span className="text-sm">Bonus aktiviert</span>
              </div>
              <Button size="sm" disabled={pending}>
                Speichere die Belohnung
              </Button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Punkte</TableHead>
                    <TableHead>Aktie</TableHead>
                    <TableHead>der Zustand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewards.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium">{r.title}</p>
                        {r.description ? (
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        ) : null}
                      </TableCell>
                      <TableCell className="tabular-nums">{r.points_cost}</TableCell>
                      <TableCell className="tabular-nums">{r.optional_stock ?? "—"}</TableCell>
                      <TableCell>{r.active ? "Aktiviert" : "Angehalten"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "campaigns" ? (
        <Card>
          <CardHeader>
            <CardTitle>Benachrichtigungswarteschlange</CardTitle>
            <CardDescription>
              Nachdem du für einen beliebigen Client auf „Benachrichtigen (Warteschlange)“ geklickt haben, führe den Assistenten hier aus. Der Versand ist derzeit experimentell – schließe einen SMS-Anbieter an
Oder WhatsApp API später auf dem Server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await processQueuedNotifications();
                  setFeedback(
                    res.error
                      ? `Die Verarbeitung ist fehlgeschlagen: ${res.error}`
                      : `Verarbeitet: ${res.processed} | Gesendet an: ${res.sent} | Fehlgeschlagen: ${res.failed}`
                  );
                })
              }
            >
              Führe jetzt den Assistenten aus
            </Button>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Vorlage</TableHead>
                    <TableHead>der Zustand</TableHead>
                    <TableHead>Schöpfungszeit</TableHead>
                    <TableHead>Fehler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.channel}</TableCell>
                      <TableCell className="font-mono text-xs">{n.template_key}</TableCell>
                      <TableCell>{n.status}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(n.created_at).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                          hour12: false,
                        })}
                      </TableCell>
                      <TableCell className="text-xs text-destructive">{n.error ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "settings" ? (
        <Card>
          <CardHeader>
            <CardTitle>Erweiterte Einstellungen</CardTitle>
            <CardDescription>
              Verdienstregeln und Punktewert auf der Seite mit den Restauranteinstellungen. Führe hier den Assistenten aus und verbinde den Anbieter später.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Aktiviere Cron jede Minute, um den Benachrichtigungshandler auf dem Server aufzurufen.</li>
              <li>Verbinde den SMS-Anbieter oder die WhatsApp Business API, anstatt den Versand zu testen.</li>
              <li>Stelle sicher, dass die mobile „Ländereinführung“ in den Einstellungen für die richtige WhatsApp-Verbindung eingestellt ist.</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Aktuelle Reichweite des Panels:{" "}
              <span dir="ltr" className="font-mono">
                {publicBaseUrl || "—"}
              </span>{" "}
              · Restaurant: {subdomain || "—"}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
