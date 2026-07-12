import { redirect } from "next/navigation";
import { getSession } from "@/app/actions/auth";
import { SignupForm } from "./signup-form";

export const metadata = {
  title: "Restaurantkonto erstellen | Speisekarte",
  description: "Erstelle ein Restaurantkonto und erhalte den ersten Monat kostenlos",
};

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/complete-profile");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4" dir="ltr">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Erstelle ein Restaurantkonto</h1>
          <p className="text-sm text-muted-foreground">
            Erstelle dein Konto und anschließend auf derselben Seite dein Restaurant – der erste Monat ist kostenlos, ohne die Eingabe einer Bankkarte.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
