"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPlaceholderEmail } from "@/lib/placeholder-email";
import type { Profile } from "@/lib/types/database";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const SUBDOMAIN_MIN = 2;
const SUBDOMAIN_MAX = 63;

const SUPER_ADMIN_ROLE = "super_admin";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

/** For /owner (restaurant owner): requires session + profile with restaurant_id. Redirects super_admin to /admin. */
export async function getProfileOrRedirect(): Promise<Profile> {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfile();
  if (!profile) redirect("/complete-profile");
  if (profile.role === SUPER_ADMIN_ROLE) redirect("/admin");
  if (!profile.restaurant_id) redirect("/complete-profile");
  return profile;
}

/** For /admin (system owner): requires session + profile with role = 'super_admin'. */
export async function getSuperAdminProfileOrRedirect(): Promise<Profile> {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfile();
  if (!profile || profile.role !== SUPER_ADMIN_ROLE) redirect("/owner");
  return profile;
}



/** For /admin on subdomain (restaurant owner): requires session + profile with restaurant_id = tenantId. */
export async function getProfileForRestaurantAdminOrRedirect(
  tenantId: string
): Promise<Profile> {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfile();
  if (!profile) redirect("/complete-profile");
  if (profile.role === SUPER_ADMIN_ROLE) redirect("/admin");
  if (profile.restaurant_id !== tenantId) redirect("/admin");
  return profile;
}

export async function isSuperAdmin(profile: Profile | null): Promise<boolean> {
  return profile?.role === SUPER_ADMIN_ROLE;
}


export async function createProfileAfterSignup(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Du müssen sich zuerst anmelden" };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      login_email: user.email,
      role: "owner",
    },
    { onConflict: "id" }
  );
  if (error) return { error: error.message || "Die Profilerstellung ist fehlgeschlagen" };
  revalidatePath("/complete-profile");
  return { error: null };
}

export async function setProfileRestaurant(
  restaurantId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      restaurant_id: restaurantId,
      role: "owner",
    },
    { onConflict: "id" }
  );
  if (error) return { error: error.message };
  revalidatePath("/owner");
  revalidatePath("/complete-profile");
  return { error: null };
}


export async function createRestaurantAndLink(payload: {
  name: string;
  subdomain: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Du müssen sich zuerst anmelden" };

  const name = payload.name?.trim();
  const subRaw = payload.subdomain?.trim().toLowerCase();
  if (!name || name.length < 2) return { error: "Der Restaurantname muss mindestens zwei Buchstaben haben" };
  if (!subRaw) return { error: "Subdomain erforderlich" };
  if (subRaw.length < SUBDOMAIN_MIN || subRaw.length > SUBDOMAIN_MAX)
    return { error: `Subdomain zwischen ${SUBDOMAIN_MIN} und ${SUBDOMAIN_MAX} Buchstaben A` };
  if (!SUBDOMAIN_REGEX.test(subRaw))
    return { error: "Subdomain: Nur Kleinbuchstaben, Zahlen und Bindestriche" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("restaurants")
    .select("id")
    .ilike("subdomain", subRaw)
    .maybeSingle();
  if (existing) return { error: "Die Subdomain wird für ein anderes Restaurant verwendet. Wähle ein anderes." };

  const { data: newRestaurant, error: insertErr } = await admin
    .from("restaurants")
    .insert({
      name,
      subdomain: subRaw,
      status: "active",
    })
    .select("id")
    .single();
  if (insertErr) return { error: insertErr.message || "Der Restaurantbetrieb scheiterte" };
  if (!newRestaurant?.id) return { error: "Der Restaurantbetrieb scheiterte" };

  const { error: profileErr } = await admin.from("profiles").upsert(
    {
      id: user.id,
      restaurant_id: newRestaurant.id,
      role: "owner",
      login_email: user.email ?? null,
    },
    { onConflict: "id" }
  );
  if (profileErr) return { error: profileErr.message || "Das Konto konnte nicht mit dem Restaurant verknüpft werden" };

  revalidatePath("/owner");
  revalidatePath("/complete-profile");
  return { error: null };
}


export async function getRestaurantBySubdomain(
  subdomain: string
): Promise<{ id: string; subdomain: string } | null> {
  const key = subdomain.trim().toLowerCase();
  if (!key) return null;
  
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("restaurants")
      .select("id, subdomain")
      .ilike("subdomain", key)
      .maybeSingle();
    if (!error && data) return { id: data.id, subdomain: data.subdomain };
  } catch {
    
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, subdomain")
    .ilike("subdomain", key)
    .maybeSingle();
  if (error || !data) return null;
  return { id: data.id, subdomain: data.subdomain };
}

export async function getRestaurantForProfile(profile: Profile) {
  if (!profile.restaurant_id) return null;
  const admin = createAdminClient();
  const { data: restData } = await admin
    .from("restaurants")
    .select(
      "id, name, subdomain, logo_url, theme_color, headline, subheadline, hero_background_url, footer_note, public_address, public_maps_url, public_phone_1, public_phone_2, public_phone_3, social_facebook_url, social_instagram_url, social_tiktok_url, currency_code, secondary_currency_enabled, secondary_currency_code, secondary_currency_exchange_rate, menu_title_animation_enabled, menu_banner_url, menu_banner_kind, menu_banner_caption, loyalty_program_enabled, loyalty_spend_cents_per_point, loyalty_point_value_cents, phone_country_prefix, waiters_system_enabled"
    )
    .eq("id", profile.restaurant_id)
    .single();
  return restData;
}


export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<{ error: string | null; redirectUrl?: string }> {
  if (!email || !password) return { error: "E-Mail und Passwort sind erforderlich" };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) return { error: signInError.message || "Falsche E-Mail-Adresse oder falsches Passwort" };

  const profile = await getProfile();
  if (profile?.role === "super_admin") {
    return { error: null, redirectUrl: "/admin" };
  }

  if (profile?.role === "owner" && profile.restaurant_id) {
    const restaurant = await getRestaurantForProfile(profile);
    if (restaurant?.subdomain) {
      const headersList = await import("next/headers").then(m => m.headers());
      const host = headersList.get("host") ?? "";
      const proto = headersList.get("x-forwarded-proto") ?? "http";
      const { buildTenantPublicSiteUrl } = await import("@/lib/tenant-public-url");
      const url = buildTenantPublicSiteUrl(restaurant.subdomain, host, proto);
      if (url) {
        return { error: null, redirectUrl: url + "/admin" };
      }
    }
  }

  return { error: null, redirectUrl: "/admin" };
}

export async function getOwnerDashboardStats(restaurantId: string): Promise<{
  categoriesCount: number;
  menuItemsCount: number;
  pendingOrdersCount: number;
}> {
  const supabase = await createClient();
  const [catRes, itemsRes] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
    supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("restaurant_id", restaurantId),
  ]);
  let pendingOrdersCount = 0;
  const pendingRes = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("status", "pending");
  if (!pendingRes.error) pendingOrdersCount = pendingRes.count ?? 0;

  return {
    categoriesCount: catRes.count ?? 0,
    menuItemsCount: itemsRes.count ?? 0,
    pendingOrdersCount,
  };
}
