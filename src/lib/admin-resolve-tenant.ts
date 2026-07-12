import { headers } from "next/headers";
import { getIdentifiedRestaurant } from "@/lib/restaurant-headers";
import { getRestaurantBySubdomain } from "@/app/actions/auth";

function subdomainFromHost(host: string): string | null {
  const withoutPort = host.split(":")[0].trim().toLowerCase();
  const parts = withoutPort.split(".");
  const first = parts[0];
  if (parts.length >= 2 && first && first !== "www" && first !== "app" && first !== "localhost")
    return first;
  return null;
}


export async function resolveAdminTenant(): Promise<{
  id: string;
  subdomain: string;
} | null> {
  let tenant = await getIdentifiedRestaurant();
  if (tenant) return tenant;

  
  
  const h = await headers();
  const host = h.get("x-original-host") ?? h.get("host") ?? "";
  const sub = subdomainFromHost(host);
  if (!sub) return null;

  tenant = await getRestaurantBySubdomain(sub);
  return tenant;
}
