import { redirect } from "next/navigation";
import { getSession, getProfile } from "@/app/actions/auth";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = {
  title: "Einrichten Ihres Restaurants | Speisekarte",
  description: "Erstelle ein neues Restaurant und erhalte den ersten Monat gratis",
};

export default async function CompleteProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfile();
  if (profile?.role === "super_admin") redirect("/admin");
  if (profile?.restaurant_id) redirect("/owner");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4" dir="ltr">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Erstelle dein Restaurant</h1>
          <p className="text-sm text-muted-foreground">
            Erstelle dein neues Restaurant und erhalte den ersten Monat gratis – ohne Eingabe einer Bankkarte.
          </p>
        </div>
        <CompleteProfileForm />
      </div>
    </div>
  );
}
