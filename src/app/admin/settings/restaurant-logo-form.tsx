"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadRestaurantLogo } from "@/lib/supabase/storage";
import { updateRestaurantLogo } from "@/app/actions/admin-restaurant";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  restaurantId: string;
  currentLogoUrl: string | null;
};

export function RestaurantLogoForm({ restaurantId, currentLogoUrl }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!file) {
      setError("Wähle ein Bild für das Logo.");
      return;
    }
    setLoading(true);

    // Extract average color before uploading (runs locally in browser)
    let themeColor: string | null = null;
    try {
      const { FastAverageColor } = await import("fast-average-color");
      const fac = new FastAverageColor();
      const objectUrl = URL.createObjectURL(file);
      const color = await fac.getColorAsync(objectUrl);
      themeColor = color.hex;
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.warn("Konnte Logo-Farbe nicht extrahieren:", err);
    }

    const uploadResult = await uploadRestaurantLogo(restaurantId, file);
    if ("error" in uploadResult) {
      setError(uploadResult.error);
      setLoading(false);
      return;
    }
    const updateResult = await updateRestaurantLogo(restaurantId, uploadResult.url, themeColor);
    setLoading(false);
    if (updateResult.error) {
      setError(updateResult.error);
      return;
    }
    setLogoUrl(uploadResult.url);
    setFile(null);
    setSuccess(true);
  }

  function handleRemove() {
    setError(null);
    setSuccess(false);
    setFile(null);
    setLogoUrl(null);
    updateRestaurantLogo(restaurantId, null).then((r) => {
      if (r.error) setError(r.error);
      else setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          {logoUrl ? (
            <div className="relative h-24 w-40 overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={logoUrl}
                alt="Restaurant-Logo"
                fill
                className="object-contain"
                sizes="160px"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 text-muted-foreground">
              <span className="text-xs">Es gibt kein Logo</span>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Das Logo erscheint in der Kopfzeile der Menüseite für Kunden
          </p>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Label>Logobild (JPG, PNG, WebP)</Label>
            <div className="mt-2 relative inline-block w-full">
              <div className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                {file ? file.name : "Bild auf dem Mac auswählen..."}
              </div>
              <input
                id="logo-file"
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={loading}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">Logo gespeichert.</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={loading || !file}>
              {loading ? "Hochladen..." : "Logo hochladen"}
            </Button>
            {logoUrl && (
              <Button type="button" variant="outline" onClick={handleRemove} disabled={loading}>
                Logo entfernen
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
