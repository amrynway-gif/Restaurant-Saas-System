import { getLoyaltyPortalByToken } from "@/app/actions/customers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: "Meine Punkte- und Treuehistorie",
  description: "Punktestand und Verlauf der Treuetransaktionen",
};

function txLabel(type: string): string {
  switch (type) {
    case "earn":
      return "Sammle Punkte";
    case "redeem_cash":
      return "Bargeldwechsel";
    case "redeem_reward":
      return "Bonuseinlösung";
    case "adjustment":
      return "Administrative Änderung";
    case "expiry":
      return "Ablauf";
    case "bonus":
      return "Extrapunkte";
    default:
      return type;
  }
}

export default async function LoyaltyPublicPage({ params }: Props) {
  const { token } = await params;
  const { customer, transactions, rewards, error } = await getLoyaltyPortalByToken(token);

  if (error || !customer) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Die Punkteseite konnte nicht geöffnet werden</CardTitle>
            <CardDescription>{error ?? "Der Link ist ungültig"}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Treueprogramm</CardTitle>
          <CardDescription>
            {customer.name ? `Hallo A ${customer.name}` : "Willkommen"} - Handynummer:{" "}
            <span dir="ltr" className="font-mono">
              {customer.phone}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums">{customer.points_balance} ein Punkt</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Dieser Link ist für Sie, teile ihn nicht mit anderen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaktionsprotokoll</CardTitle>
          <CardDescription>Letzte Verdienst- und Einlösungstransaktionen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Es gibt noch keine Operationen.</p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-medium">{txLabel(tx.tx_type)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                      hour12: false,
                    })}
                  </p>
                </div>
                <p
                  className={`font-mono tabular-nums ${
                    tx.points_delta >= 0 ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {tx.points_delta > 0 ? `+${tx.points_delta}` : tx.points_delta}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Belohnungen verfügbar</CardTitle>
          <CardDescription>Du können bei der Kontaktaufnahme mit dem Restaurant einen Ersatz anfordern.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Derzeit sind keine Belohnungen verfügbar.</p>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-start justify-between rounded-md border border-border/60 px-3 py-2"
              >
                <div>
                  <p className="font-medium">{reward.title}</p>
                  {reward.description ? (
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  ) : null}
                </div>
                <p className="font-mono text-sm tabular-nums">{reward.points_cost} ein Punkt</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
