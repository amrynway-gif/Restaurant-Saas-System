"use client";

import {
  LayoutDashboardIcon,
  Building2Icon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout, type NavGroup } from "@/components/dashboard/DashboardLayout";

const superAdminNavGroups: NavGroup[] = [
  {
    label: "Befehl",
    items: [
      { href: "/admin", label: "Überblick", icon: <LayoutDashboardIcon /> },
      { href: "/admin/restaurants", label: "Restaurants", icon: <Building2Icon /> },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      title="Systembesitzer-Panel"
      navGroups={superAdminNavGroups}
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
