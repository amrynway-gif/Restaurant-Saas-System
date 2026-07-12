import { getProfileOrRedirect } from "@/app/actions/auth";
import { getRestaurantForProfile } from "@/app/actions/auth";
import { listRestaurantTables } from "@/app/actions/tables";
import { listRestaurantWaiters } from "@/app/actions/waiters";
import { buildTenantPublicSiteUrl } from "@/lib/tenant-public-url";
import { TablesClient } from "@/app/owner/tables/tables-client";
import { headers } from "next/headers";

export const metadata = {
  title: "Tabellen und QR-Codes",
  description: "Verwalte Restauranttische und drucke QR-Codes",
};

export default async function AdminRestaurantTablesPage() {
  const profile = await getProfileOrRedirect();
  const restaurant = await getRestaurantForProfile(profile);
  const { tables, error } = await listRestaurantTables();
  const { waiters: restaurantWaiters } = await listRestaurantWaiters();

  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const menuBaseUrl = buildTenantPublicSiteUrl(restaurant?.subdomain ?? null, host, proto);

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Tabellen können nicht geladen werden: {error}. Tun{" "}
          <code className="rounded bg-muted px-1">supabase/orders-tables-customers.sql</code> Bei Supabase.
        </p>
      ) : null}
      <TablesClient
        initialTables={tables}
        menuBaseUrl={menuBaseUrl}
        restaurantSubdomain={restaurant?.subdomain?.trim() ?? ""}
        waitersSystemEnabled={restaurant?.waiters_system_enabled === true}
        waiters={restaurantWaiters}
      />
    </div>
  );
}
