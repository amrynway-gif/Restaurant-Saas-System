"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateRestaurantPhoneCountryPrefix } from "@/app/actions/admin-restaurant";

type Props = {
  restaurantId: string;
  initialPrefix: string | null;
};

export function RestaurantPhoneCountryForm({ restaurantId, initialPrefix }: Props) {
  const [prefix, setPrefix] = useState(initialPrefix ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const res = await updateRestaurantPhoneCountryPrefix(restaurantId, prefix.trim() || null);
    setLoading(false);
    if (res.error) setError(res.error);
    else setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-country-prefix">Staatliche Einführung in den Mobilfunk</Label>
        <Input
          id="phone-country-prefix"
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Beispiel: 966 oder 963 (ohne +)"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.replace(/\D/g, ""))}
          className="max-w-xs font-mono"
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Gib nur die internationale Vorwahl (Nummern) Ihres Landes ein. Du wird automatisch mit der Kundennummer in der Bestellliste kombiniert und angezeigt{" "}
          <strong>Kommunikation</strong> Und<strong>WhatsApp</strong> Mit einer Nachricht, die die Annahme des Antrags, die Vorbereitung, die Antragsnummer und einen Link enthält
Gehe der Anfrage nach. Lasse das Feld leer, wenn Kundennummern ursprünglich im vollständigen internationalen Format gespeichert wurden.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Gespeichert.</p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sparen..." : "speichern"}
      </Button>
    </form>
  );
}
