import { getProfileOrRedirect } from "@/app/actions/auth";
import { getCategoriesForRestaurant } from "@/app/actions/admin-categories";
import { CategoriesManager } from "@/app/admin/categories/categories-manager";

export const metadata = {
  title: "Kategorien | Restauranttafel",
  description: "Listenkategorien verwalten",
};

export default async function OwnerCategoriesPage() {
  const profile = await getProfileOrRedirect();
  const restaurantId = profile.restaurant_id!;
  const categories = await getCategoriesForRestaurant(restaurantId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Kategorien</h2>
        <p className="text-muted-foreground">
          Organisation des Menüs (zum Beispiel: Vorspeisen, Hauptgerichte, Getränke).
        </p>
      </div>
      <CategoriesManager
        restaurantId={restaurantId}
        initialCategories={categories}
      />
    </div>
  );
}
