"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die beiden Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message || "Die Passwortaktualisierung ist fehlgeschlagen");
      return;
    }

    
    router.replace("/login");
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Lege ein neues Passwort fest</h1>
          <p className="text-sm text-muted-foreground">
            Gib ein neues Passwort ein, um den Vorgang zum Zurücksetzen des Passworts abzuschließen.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Neues Passwort</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password-confirm">Passwort bestätigen</Label>
            <Input
              id="new-password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sparen..." : "Speichere dein Passwort"}
          </Button>
        </form>
      </div>
    </div>
  );
}

