import Link from "next/link";
import { getIdentifiedRestaurant } from "@/lib/restaurant-headers";
import {
  getSuperAdminProfileOrRedirect,
  getProfileForRestaurantAdminOrRedirect,
  getOwnerDashboardStats,
} from "@/app/actions/auth";
import { getSuperAdminStats, getAllRestaurants } from "@/app/actions/super-admin";
import {
  Building2Icon,
  UtensilsCrossedIcon,
  TrendingUpIcon,
  FolderIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  StarIcon,
} from "lucide-react";
import { AdminDashboardCharts } from "./admin-dashboard-charts";
import { OwnerDashboardCharts } from "@/app/owner/owner-dashboard-charts";

export const metadata = {
  title: "Bedienfeld",
  description: "Überblick",
};


const btnPrimary =
  "inline-flex h-[38px] items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-[background,transform] hover:bg-[var(--brand-dark)] active:scale-[0.98]";


export default async function AdminDashboardPage() {
  const tenant = await getIdentifiedRestaurant();

  if (!tenant) {
    await getSuperAdminProfileOrRedirect();
    const stats = await getSuperAdminStats();
    const restaurants = await getAllRestaurants();
    const recentRestaurants = restaurants.slice(0, 5);

    return (
      <div className="space-y-8 page-enter">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-[var(--text-primary)]">
            Überblick
          </h1>
          <p className="mt-1 text-base text-[var(--text-secondary)]">
            System- und Restaurantstatistiken. Füge Restaurants hinzu, bearbeite sie und erstelle Restaurantbenutzer.
          </p>
        </div>

        {/* Stats Row — DESIGN_SYSTEM: grid auto-fill minmax(280px, 1fr) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card card-enter">
            <div className="stat-icon">
              <Building2Icon className="size-5" />
            </div>
            <div className="stat-label">Insgesamt Restaurants</div>
            <div className="stat-value">{stats.totalRestaurants}</div>
            <p className="text-[13px] text-[var(--text-muted)]">Alle registrierten Restaurants</p>
          </div>
          <div className="stat-card card-enter">
            <div className="stat-icon">
              <TrendingUpIcon className="size-5" />
            </div>
            <div className="stat-label">Aktive Restaurants</div>
            <div className="stat-value">{stats.activeRestaurants}</div>
            <p className="text-[13px] text-[var(--text-muted)]">Aktiv oder experimentell</p>
          </div>
          <div className="stat-card card-enter">
            <div className="stat-icon">
              <UtensilsCrossedIcon className="size-5" />
            </div>
            <div className="stat-label">Listentypen</div>
            <div className="stat-value">{stats.totalMenuItems}</div>
            <p className="text-[13px] text-[var(--text-muted)]">In allen Restaurants</p>
          </div>
          <div className="stat-card card-enter">
            <div className="stat-icon">
              <DollarSignIcon className="size-5" />
            </div>
            <div className="stat-label">Monatlicher Umsatz</div>
            <div className="stat-value">—</div>
            <p className="text-[13px] text-[var(--text-muted)]">fast</p>
          </div>
        </div>

        <AdminDashboardCharts stats={stats} />

        {/* Recent Restaurants Table — DESIGN_SYSTEM */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-tight text-[var(--text-primary)]">
              Neueste Restaurants
            </h2>
            <Link href="/admin/restaurants" className={btnPrimary}>
              Alle anzeigen
            </Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-2)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="p-4 text-left">der Name</th>
                  <th className="p-4 text-left">Subdomain</th>
                  <th className="p-4 text-left">Benutzername</th>
                  <th className="p-4 text-left">der Zustand</th>
                  <th className="p-4 text-left">das Datum</th>
                </tr>
              </thead>
              <tbody>
                {recentRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                      Es gibt noch keine Restaurants. Füge ein Restaurant über Schnellaktionen hinzu.
                    </td>
                  </tr>
                ) : (
                  recentRestaurants.map((r) => (
                    <tr
                      key={r.id}
                      className="h-[52px] border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-surface-2)]"
                    >
                      <td className="p-4 font-medium text-[var(--text-primary)]">
                        {r.name}
                      </td>
                      <td className="p-4 font-mono text-[12px] text-[var(--text-secondary)]">
                        {r.subdomain}
                      </td>
                      <td className="p-4 font-medium text-[var(--text-secondary)]">
                        {r.owner_username ?? "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex h-[22px] items-center rounded-full px-2 text-[11px] font-semibold ${
                            r.status === "active" || !r.status
                              ? "bg-[var(--success-bg)] text-[var(--success)]"
                              : r.status === "trial"
                                ? "bg-[var(--warning-bg)] text-[var(--warning)]"
                                : "bg-[var(--danger-bg)] text-[var(--danger)]"
                          }`}
                        >
                          {r.status === "active" || !r.status
                            ? "aktiv"
                            : r.status === "trial"
                              ? "Experimental-"
                              : "Ausgesetzt"}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--text-muted)]">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("ar-SA")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions — DESIGN_SYSTEM */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Schnelle Aktionen
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Verwalte Restaurants und erstelle Benutzer für Restaurants.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/restaurants" className={btnPrimary}>
              Füge ein neues Restaurant hinzu
            </Link>
            <Link
              href="/admin/restaurants"
              className="inline-flex h-[38px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface-2)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-overlay)]"
            >
              Alle Restaurants ansehen
            </Link>
          </div>
        </section>

        {/* Activity Feed placeholder */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Letzte Aktivität
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Neueste registrierte Restaurants und Abonnements – bald verfügbar.
          </p>
        </section>
      </div>
    );
  }

  /* ========== Restaurant Admin Dashboard ========== */
  const profile = await getProfileForRestaurantAdminOrRedirect(tenant.id);
  const stats = await getOwnerDashboardStats(profile.restaurant_id!);

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[var(--text-primary)]">
          Überblick
        </h1>
        <p className="mt-1 text-base text-[var(--text-secondary)]">
          Speisekarte und Restaurant auf einen Blick. Verwalte unten Kategorien und Kategorien.
        </p>
      </div>

      {/* Stats Row — DESIGN_SYSTEM */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card card-enter">
          <div className="stat-icon">
            <ShoppingBagIcon className="size-5" />
          </div>
          <div className="stat-label">Die heutigen Bestellungen</div>
          <div className="stat-value">—</div>
          <p className="text-[13px] text-[var(--text-muted)]">fast</p>
        </div>
        <div className="stat-card card-enter">
          <div className="stat-icon">
            <DollarSignIcon className="size-5" />
          </div>
          <div className="stat-label">Der heutige Umsatz</div>
          <div className="stat-value">—</div>
          <p className="text-[13px] text-[var(--text-muted)]">fast</p>
        </div>
        <div className="stat-card card-enter">
          <div className="stat-icon">
            <UtensilsCrossedIcon className="size-5" />
          </div>
          <div className="stat-label">Menüpunkte</div>
          <div className="stat-value">{stats.menuItemsCount}</div>
          <p className="text-[13px] text-[var(--text-muted)]">Gesamtzahl der Artikel</p>
        </div>
        <div className="stat-card card-enter">
          <div className="stat-icon">
            <StarIcon className="size-5" />
          </div>
          <div className="stat-label">Durchschnittliche Bewertung</div>
          <div className="stat-value">—</div>
          <p className="text-[13px] text-[var(--text-muted)]">fast</p>
        </div>
      </div>

      <OwnerDashboardCharts stats={stats} />

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Kategorien
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {stats.categoriesCount} Einstufung
          </p>
          <Link
            href="/admin/categories"
            className={btnPrimary + " mt-4 inline-block"}
          >
            Kategorienverwaltung
          </Link>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Menüpunkte
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {stats.menuItemsCount} Klassifizieren
          </p>
          <Link href="/admin/menu" className={btnPrimary + " mt-4 inline-block"}>
            Menüpunkte verwalten
          </Link>
        </div>
      </div>

      {/* Recent Orders placeholder */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Letzte Bestellungen
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Aktuelle Bestellungen eingegangen – bald verfügbar.
        </p>
      </section>

      {/* Popular Items placeholder */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Am häufigsten nachgefragte Artikel
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Einfaches Diagramm – bald verfügbar.
        </p>
      </section>
    </div>
  );
}
