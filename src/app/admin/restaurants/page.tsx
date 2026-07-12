import { redirect } from "next/navigation";
import { getIdentifiedRestaurant } from "@/lib/restaurant-headers";
import { getAllRestaurants } from "@/app/actions/super-admin";
import { RestaurantsTable } from "./restaurants-table";

export const metadata = {
  title: "Restaurants | Systembesitzer-Panel",
  description: "Verwalte alle Restaurants",
};


export default async function AdminRestaurantsPage() {
  const tenant = await getIdentifiedRestaurant();
  if (tenant) redirect("/admin");

  const restaurants = await getAllRestaurants();
  const ownerUsernames = Object.fromEntries(
    restaurants.map((r) => [r.id, r.owner_username ?? null])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-muted-foreground">
          Alle Restaurants anzeigen und verwalten. Füge neue Restaurants hinzu und erstelle einen Benutzer und ein Passwort für den Besitzer jedes Restaurants.
        </p>
      </div>
      <RestaurantsTable
        initialRestaurants={restaurants}
        ownerUsernames={ownerUsernames}
      />
    </div>
  );
}
