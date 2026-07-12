import { NextResponse, type NextRequest } from "next/server";
import { createEdgeSupabaseClient } from "@/lib/supabase/middleware";

/** Request header names set when middleware identifies a restaurant (rewritten route can read these) */
const RESTAURANT_HEADERS = {
  ID: "x-restaurant-id",
  SUBDOMAIN: "x-restaurant-subdomain",
  
  ORIGINAL_HOST: "x-original-host",
} as const;

/**
 * Middleware: identifies the restaurant from the URL and rewrites to the menu.
 *
 * 1. Reads the request hostname (e.g. "pizza-place.myapp.com" or "pizza-place.localhost").
 * 2. Extracts the subdomain (first segment; ignores "www" and "app").
 * 3. Looks up the restaurant in Supabase "restaurants" by "subdomain".
 * 4. If found: rewrites to /menu/[subdomain] and sets headers so downstream
 *    can read the identified restaurant (x-restaurant-id, x-restaurant-subdomain).
 * 5. If not found or no subdomain: continues without rewriting.
 */

/**
 * Extracts subdomain from hostname.
 * e.g. "pizza-place.myapp.com" -> "pizza-place", "pizza-place.localhost" -> "pizza-place"
 */
function getSubdomain(hostname: string): string | null {
  const parts = hostname.split(".");
  if (parts.length < 2) return null;
  const first = parts[0];
  if (first === "www" || first === "app") return null;
  return first;
}

export async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const subdomain = getSubdomain(hostname);

  if (!subdomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Don't rewrite if we're already on a rewritten path or static/API routes
  if (
    pathname.startsWith("/menu/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  try {
    const supabase = createEdgeSupabaseClient();
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, subdomain, logo_url")
      .ilike("subdomain", subdomain.toLowerCase())
      .maybeSingle();

    if (error || !restaurant) {
      return NextResponse.next();
    }

    const logoUrl =
      typeof restaurant.logo_url === "string" ? restaurant.logo_url.trim() : "";
    if (
      logoUrl &&
      (pathname === "/favicon.ico" ||
        pathname === "/apple-touch-icon.png" ||
        pathname === "/apple-touch-icon-precomposed.png")
    ) {
      return NextResponse.redirect(logoUrl, 302);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(RESTAURANT_HEADERS.ID, restaurant.id);
    requestHeaders.set(RESTAURANT_HEADERS.SUBDOMAIN, restaurant.subdomain);
    requestHeaders.set(RESTAURANT_HEADERS.ORIGINAL_HOST, request.nextUrl.host);

    
    if (pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL(pathname + url.search, request.url), {
        request: { headers: requestHeaders },
      });
    }

    
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      return NextResponse.rewrite(new URL(pathname + url.search, request.url), {
        request: { headers: requestHeaders },
      });
    }

    
    if (pathname.startsWith("/owner")) {
      return NextResponse.rewrite(new URL(pathname + url.search, request.url), {
        request: { headers: requestHeaders },
      });
    }

    
    if (pathname === "/") {
      url.pathname = `/menu/${encodeURIComponent(restaurant.subdomain)}`;
      return NextResponse.rewrite(new URL(url.pathname + url.search, request.url), {
        request: { headers: requestHeaders },
      });
    }

    
    url.pathname = `/menu/${encodeURIComponent(restaurant.subdomain)}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and api routes.
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
