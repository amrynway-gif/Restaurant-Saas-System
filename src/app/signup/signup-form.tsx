"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createProfileAfterSignup } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/complete-profile`,
      },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    const { error: profileErr } = await createProfileAfterSignup();
    if (profileErr) {
      setError(profileErr);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    router.refresh();
    router.push("/complete-profile");
  }

  if (success) {
    return (
      <div className="space-y-4 text-center text-sm" dir="ltr">
        <p className="text-green-600">
          Das Konto wurde erfolgreich erstellt. You are being directed to create your restaurant...
        </p>
        <Link href="/complete-profile" className={cn(buttonVariants({ variant: "default" }), "w-full inline-flex justify-center h-11")}>
          Erstelle jetzt mein Restaurant
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="ltr">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
            className="text-left"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            disabled={loading}
            className="text-left"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
      )}

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? "Bauarbeiten laufen…" : "Ein Konto erstellen"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Habe ein Konto?{" "}
        <Link href="/login" className="underline font-medium hover:text-foreground">
          Login
        </Link>
      </p>
    </form>
  );
}
