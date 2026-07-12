"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateRestaurantLoyaltySettings } from "@/app/actions/admin-restaurant";
import { MENU_CURRENCIES } from "@/lib/currencies";

type Props = {
  restaurantId: string;
  currencyCode: string | null;
  initialEnabled: boolean;
  initialSpendCentsPerPoint: number;
  initialPointValueCents: number;
};

function parseMajorToCents(raw: string): number | null {
  const n = parseFloat(raw.replace(",", ".").trim());
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function RestaurantLoyaltySettingsForm({
  restaurantId,
  currencyCode,
  initialEnabled,
  initialSpendCentsPerPoint,
  initialPointValueCents,
}: Props) {
  const code =
    currencyCode && MENU_CURRENCIES.some((c) => c.code === currencyCode)
      ? currencyCode
      : "SAR";
  const symbol = MENU_CURRENCIES.find((c) => c.code === code)?.symbol ?? "﷼";

  const [enabled, setEnabled] = useState(initialEnabled);
  const [spendMajor, setSpendMajor] = useState(
    String((initialSpendCentsPerPoint || 100) / 100)
  );
  const [pointValueMajor, setPointValueMajor] = useState(
    String((initialPointValueCents || 10) / 100)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const preview = useMemo(() => {
    const spendC = parseMajorToCents(spendMajor);
    const valC = parseMajorToCents(pointValueMajor);
    if (spendC == null || valC == null || spendC < 1 || valC < 1) return null;
    
    const pointsPer100CentsSpent = 100 / spendC;
    const rewardCentsPer100Spent = pointsPer100CentsSpent * valC;
    const pct = (rewardCentsPer100Spent / 100) * 100;
    return { rewardCentsPer100Spent, pct };
  }, [spendMajor, pointValueMajor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const spendCents = parseMajorToCents(spendMajor);
    const valCents = parseMajorToCents(pointValueMajor);
    if (spendCents == null || valCents == null) {
      setLoading(false);
      setError("Gib gültige Zahlen für die Beträge ein");
      return;
    }

    const result = await updateRestaurantLoyaltySettings(restaurantId, {
      loyalty_program_enabled: enabled,
      loyalty_spend_cents_per_point: spendCents,
      loyalty_point_value_cents: valCents,
    });

    setLoading(false);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
        <div className="space-y-1">
          <Label htmlFor="loyalty-enabled">Aktiviere das Punkteprogramm</Label>
          <p className="text-xs text-muted-foreground">
            Bei Deaktivierung: Die Gesamteinkäufe werden für Berichte erfasst, ohne dass neue Punkte vergeben werden.
          </p>
        </div>
        <Switch
          id="loyalty-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="text-sm font-medium">Punkte berechnen</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong>Regel:</strong> Anzahl der Punkte = Bestellwert (in Cent) ÷ ausgegebener Betrag, um 1 Punkt zu erhalten
(Der Nachkommateil wird abgeschnitten.) Beispiel: Gib 350 Cent aus und verlange 100 Cent pro Punkt → 3 Punkte.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="spend-per-point">
            Betrag, der ausgegeben wurde, um 1 Punkt zu erhalten ({symbol} — die Hauptwährungseinheit)
          </Label>
          <Input
            id="spend-per-point"
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="font-mono tabular-nums"
            value={spendMajor}
            onChange={(e) => setSpendMajor(e.target.value)}
            placeholder="1.00"
          />
          <p className="text-[11px] text-muted-foreground">
            Beispiel: 1 bedeutet, dass jeder 1,00 Ihrer Währung 1 Punkt ergibt (wenn die kleinste Einheit 0,01 ist).
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="point-value">
            Der Wert eines Punktes bei späterer Diskontierung ({symbol})
          </Label>
          <Input
            id="point-value"
            type="text"
            inputMode="decimal"
            dir="ltr"
            className="font-mono tabular-nums"
            value={pointValueMajor}
            onChange={(e) => setPointValueMajor(e.target.value)}
            placeholder="0.10"
          />
          <p className="text-[11px] text-muted-foreground">
            Bei zukünftiger Aktivierung der Einlösung gilt: Jeder Punkt wird für diesen Betrag Ihrer Währung von der Rechnung abgezogen.
          </p>
        </div>

        {preview ? (
          <p className="rounded-md bg-background/80 px-3 py-2 text-xs text-muted-foreground">
            Grobe Schätzung: etwa alle 100 {symbol} Bei qualifizierenden Ausgaben beträgt der Wert der gesammelten Punkte ca{" "}
            <span dir="ltr" className="font-medium text-foreground tabular-nums">
              {(preview.rewardCentsPer100Spent / 100).toFixed(2)}
            </span>{" "}
            {symbol} Beim Austausch (d. h. ~{preview.pct.toFixed(1)}% des Ausgabenwerts als rückzahlbarer Restbetrag).
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Einstellungen wurden gespeichert.</p>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Sparen..." : "Treueeinstellungen speichern"}
      </Button>
    </form>
  );
}
