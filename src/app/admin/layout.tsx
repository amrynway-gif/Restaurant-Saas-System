import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRestaurantBySubdomain } from "@/app/actions/menu";
import { resolveAdminTenant } from "@/lib/admin-resolve-tenant";
import {
  getSuperAdminProfileOrRedirect,
  getProfileForRestaurantAdminOrRedirect,
  getRestaurantForProfile,
} from "@/app/actions/auth";
import { AdminShell } from "./admin-shell";
import { AdminRestaurantShell } from "./admin-restaurant-shell";
import { buildTenantPublicSiteUrl } from "@/lib/tenant-public-url";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveAdminTenant();
  if (!tenant) {
    return {
      title: "Bedienfeld",
      description: "System- oder Restaurantmanagement",
    };
  }
  const { data: restaurant } = await getRestaurantBySubdomain(tenant.subdomain);
  const logoUrl = restaurant?.logo_url?.trim();
  return {
    title: restaurant ? `Bedienfeld — ${restaurant.name}` : "Bedienfeld",
    description: "System- oder Restaurantmanagement",
    ...(logoUrl
      ? {
          icons: {
            icon: logoUrl,
            apple: logoUrl,
          },
        }
      : {}),
  };
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await resolveAdminTenant();

  if (!tenant) {
    
    await getSuperAdminProfileOrRedirect();
    return <AdminShell>{children}</AdminShell>;
  }

  
  const profile = await getProfileForRestaurantAdminOrRedirect(tenant.id);

  const restaurant = await getRestaurantForProfile(profile);
  let livePreviewUrl: string | null = null;
  if (restaurant?.subdomain) {
    const h = await headers();
    const host = h.get("host") ?? "";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const built = buildTenantPublicSiteUrl(restaurant.subdomain, host, proto);
    livePreviewUrl = built || null;
  }

  return (
    <AdminRestaurantShell
      restaurantName={restaurant?.name ?? "Das Restaurant"}
      restaurantId={restaurant?.id ?? null}
      livePreviewUrl={livePreviewUrl}
      logoUrl={restaurant?.logo_url ?? null}
      profile={{ name: "Restaurantbesitzer", role: "owner" }}
    >
      {children}
    </AdminRestaurantShell>
  );
}
