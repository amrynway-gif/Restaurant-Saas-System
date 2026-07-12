"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signInWithEmailAndPassword(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      router.push("/admin");
      router.refresh();
    }
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
            className="text-left"
          />
        </div>
      </div>

      {error && <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

      <Button type="submit" className="w-full h-11" disabled={loading}>
        {loading ? "Anmelden..." : "Login"}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Hast du noch kein Konto?{" "}
        <Link href="/signup" className="underline font-medium hover:text-foreground">
          Erstelle jetzt dein Konto
        </Link>
      </p>
    </form>
  );
}
