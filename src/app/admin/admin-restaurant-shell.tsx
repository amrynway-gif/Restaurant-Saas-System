"use client";

import {
  LayoutDashboardIcon,
  FolderIcon,
  UtensilsCrossedIcon,
  SettingsIcon,
  QrCodeIcon,
  ClipboardListIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout, type NavGroup } from "@/components/dashboard/DashboardLayout";

type AdminRestaurantShellProps = {
  restaurantName: string;
  
  restaurantId: string | null;
  livePreviewUrl: string | null;
  logoUrl?: string | null;
  profile?: { name?: string; imageUrl?: string | null; role?: string } | null;
  children: React.ReactNode;
};

function getRestaurantNavGroups(): NavGroup[] {
  return [
    {
      label: "Listenverwaltung",
      items: [
        { href: "/admin", label: "Überblick", icon: <LayoutDashboardIcon /> },
        { href: "/admin/menu", label: "Menüpunkte", icon: <UtensilsCrossedIcon /> },
        { href: "/admin/categories", label: "Kategorien", icon: <FolderIcon /> },
      ],
    },
    {
      label: "Bestellungen und Tische",
      items: [
        { href: "/admin/orders", label: "Anfragen", icon: <ClipboardListIcon /> },
        { href: "/admin/customers", label: "Kunden und Loyalität", icon: <UsersIcon /> },
        { href: "/admin/tables", label: "Tabellen und QR", icon: <QrCodeIcon /> },
      ],
    },
    {
      label: "Einstellungen",
      items: [
        { href: "/admin/settings", label: "Einstellungen", icon: <SettingsIcon /> },
      ],
    },
  ];
}

export function AdminRestaurantShell({
  restaurantName,
  restaurantId,
  livePreviewUrl,
  logoUrl,
  profile,
  children,
}: AdminRestaurantShellProps) {
  return (
    <DashboardLayout
      title={restaurantName}
      navGroups={getRestaurantNavGroups()}
      notificationRestaurantId={restaurantId}
      previewUrl={livePreviewUrl}
      logoUrl={logoUrl}
      profile={profile}
      headerRight={
        <form action="/auth/signout" method="POST">
          <Button type="submit" variant="ghost" size="sm">
            Abmelden
          </Button>
        </form>
      }
    >
      {children}
    </DashboardLayout>
  );
}
