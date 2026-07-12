"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { RestaurantTable, RestaurantWaiter } from "@/lib/types/database";
import {
  createRestaurantTable,
  deleteRestaurantTable,
  setRestaurantTableWaiter,
} from "@/app/actions/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PrinterIcon, QrCodeIcon, Trash2Icon } from "lucide-react";

function escapeHtmlForPrint(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function menuPublicHostname(menuBaseUrl: string): string {
  const u = menuBaseUrl.trim();
  if (!u) return "";
  try {
    return new URL(u).hostname;
  } catch {
    return "";
  }
}

type Props = {
  initialTables: RestaurantTable[];
  menuBaseUrl: string;
  
  restaurantSubdomain: string;
  waitersSystemEnabled: boolean;
  waiters: RestaurantWaiter[];
};

export function TablesClient({
  initialTables,
  menuBaseUrl,
  restaurantSubdomain,
  waitersSystemEnabled,
  waiters,
}: Props) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigningTableId, setAssigningTableId] = useState<string | null>(null);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await createRestaurantTable(label);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setLabel("");
    router.refresh();
  }

  async function assignWaiter(tableId: string, waiterId: string) {
    const next = waiterId === "" ? null : waiterId;
    setAssigningTableId(tableId);
    setError(null);
    const res = await setRestaurantTableWaiter(tableId, next);
    setAssigningTableId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setTables((prev) =>
      prev.map((x) => (x.id === tableId ? { ...x, waiter_id: next } : x))
    );
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Diese Tabelle löschen? Alte QR-Links funktionieren nicht mehr.")) return;
    setError(null);
    const res = await deleteRestaurantTable(id);
    if (res.error) {
      setError(res.error);
      return;
    }
    setTables((t) => t.filter((x) => x.id !== id));
  }

  function printQr(labelText: string, qrSrc: string) {
    const w = window.open("", "_blank");
    if (!w) return;
    const safeLabel = escapeHtmlForPrint(labelText);
    const manualHost =
      menuPublicHostname(menuBaseUrl) || restaurantSubdomain.trim();
    const safeHost = escapeHtmlForPrint(manualHost);
    const subBlock =
      safeHost.length > 0
        ? `<p class="subdomain-label">Über Und Und im Das Restaurant (um Und UndY einzugeben, wenn Yd nicht scannt)</p>
      <p class="subdomain-value" dir="ltr">${safeHost}</p>
      <p class="manual-hint">Öffnen Du A im Browser und geben Du die Adresse über Ae in Y ein, starten Du die Adresse und wählen Du dann den Tisch „${safeLabel}“ aus dem A-Menü.</p>`
        : "";
    w.document.write(`<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8"/><title>QR — ${safeLabel}</title>
      <style>
        body { font-family: system-ui; text-align: center; padding: 2rem; }
        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
        img { width: 280px; height: 280px; }
        p { color: #555; margin-top: 1rem; font-size: 14px; }
        .subdomain-label { margin-top: 1.25rem; margin-bottom: 0.25rem; font-size: 13px; color: #333; }
        .subdomain-value { font-size: 1.35rem; font-weight: 700; font-family: ui-monospace, monospace; letter-spacing: 0.02em; color: #111; margin-top: 0; }
        .manual-hint { font-size: 12px; color: #666; max-width: 320px; margin-left: auto; margin-right: auto; line-height: 1.5; }
      </style></head><body>
      <h1>${safeLabel}</h1>
      <img src="${qrSrc}" alt="QR" />
      ${subBlock}
      <p>Scannen Du den Code, um die Speisekarte zu öffnen und automatisch mit diesem Gerät zu verbinden.</p>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>`);
    w.document.close();
  }

  function printGeneralQr(homeUrl: string, qrSrc: string) {
    const w = window.open("", "_blank");
    if (!w) return;
    const safeTitle = escapeHtmlForPrint("Homepage des Restaurants");
    const safeUrl = escapeHtmlForPrint(homeUrl);
    w.document.write(`<!DOCTYPE html><html dir="ltr"><head><meta charset="utf-8"/><title>QR — ${safeTitle}</title>
      <style>
        body { font-family: system-ui; text-align: center; padding: 2rem; }
        h1 { font-size: 1.5rem; margin-bottom: 1rem; }
        img { width: 280px; height: 280px; }
        p { color: #555; margin-top: 1rem; font-size: 14px; }
        .subdomain-label { margin-top: 1.25rem; margin-bottom: 0.25rem; font-size: 13px; color: #333; }
        .subdomain-value { font-size: 1.1rem; font-weight: 700; font-family: ui-monospace, monospace; letter-spacing: 0.02em; color: #111; margin-top: 0; word-break: break-all; }
      </style></head><body>
      <h1>${safeTitle}</h1>
      <img src="${qrSrc}" alt="QR" />
      <p class="subdomain-label">Das Restaurant-Link (um UndYUndY einzugeben, wenn Y nicht scannt)</p>
      <p class="subdomain-value" dir="ltr">${safeUrl}</p>
      <script>window.onload = () => { window.print(); }</script>
      </body></html>`);
    w.document.close();
  }

  const homeUrl = menuBaseUrl.trim().replace(/\/$/, "");
  const generalQrSrc =
    homeUrl.length > 0 ? `/api/qr?data=${encodeURIComponent(homeUrl)}` : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tabellen und QR-Codes</h1>
        <p className="text-muted-foreground">
          Füge jedem Tisch einen eindeutigen Namen hinzu, drucke dann seinen QR-Code aus und platziere ihn auf dem Tisch. Der Kunde scannt den Code und öffnet das Menü
Auf dieser Tabelle wird die Bestellung ohne manuelle Eingabe erstellt.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle>Allgemeiner QR-Code – Startseite</CardTitle>
          <CardDescription>
            Für die Oberfläche, den Eingang oder die Werbung: Der Kunde öffnet die Restaurant- und Menüseite direkt, ohne an einen bestimmten Tisch gebunden zu sein.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {homeUrl.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Stelle die Restaurant-Subdomain in den Einstellungen so ein, dass der allgemeine Menülink und der QR-Code angezeigt werden.
            </p>
          ) : (
            <>
              <p className="break-all text-xs text-muted-foreground" dir="ltr">
                {homeUrl}
              </p>
              <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border bg-white">
                <Image src={generalQrSrc} alt="" fill className="object-contain p-2" unoptimized />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="gap-1"
                  onClick={() => printGeneralQr(homeUrl, generalQrSrc)}
                >
                  <PrinterIcon className="size-4" />
                  Öffentlicher QR-Druck
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => window.open(generalQrSrc, "_blank")}
                >
                  <QrCodeIcon className="size-4" />
                  QR-Bild
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Füge eine Tabelle hinzu</CardTitle>
          <CardDescription>Beispiel: Tisch 5, Terrasse 2, VIP...</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTable} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Tabellenname</label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Tabelle 12"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Sparen..." : "Zusatz"}
            </Button>
          </form>
          {error ? (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((t) => {
          const orderUrl = `${menuBaseUrl.replace(/\/$/, "")}/?t=${t.public_token}`;
          const qrSrc = `/api/qr?data=${encodeURIComponent(orderUrl)}`;
          return (
            <Card key={t.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t.label}</CardTitle>
                <CardDescription className="break-all text-xs" dir="ltr">
                  {orderUrl}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {waitersSystemEnabled ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Der verantwortliche Twitter</label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-2 py-2 text-sm"
                      value={t.waiter_id ?? ""}
                      disabled={assigningTableId === t.id}
                      onChange={(e) => void assignWaiter(t.id, e.target.value)}
                    >
                      <option value="">- ohne -</option>
                      {waiters.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {waiters.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">
                        Füge zuerst die Twitter-Namen aus den Einstellungen hinzu.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-lg border bg-white">
                  <Image src={qrSrc} alt="" fill className="object-contain p-2" unoptimized />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => printQr(t.label, qrSrc)}
                  >
                    <PrinterIcon className="size-4" />
                    drucken
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => window.open(qrSrc, "_blank")}
                  >
                    <QrCodeIcon className="size-4" />
                    QR-Bild
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ms-auto text-destructive hover:text-destructive"
                    onClick={() => remove(t.id)}
                  >
                    <Trash2Icon className="size-4" />
                    löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tables.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Es sind noch keine Tische vorhanden. Füge die erste Tabelle oben hinzu und drucke dann die Codes aus.
        </p>
      ) : null}
    </div>
  );
}
