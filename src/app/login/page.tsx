import { redirect } from "next/navigation";
import { getSession, getProfile } from "@/app/actions/auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login",
  description: "Melde dich im Control Panel an",
};

export default async function LoginPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4" dir="ltr">
        <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Willkommen zurück</h1>
            <p className="text-sm text-muted-foreground">
              Melde dich an, um dein Restaurant oder System zu verwalten
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  const profile = await getProfile();
  if (profile?.role === "super_admin") redirect("/admin");
  if (profile?.restaurant_id) redirect("/admin");
  redirect("/complete-profile");
}
