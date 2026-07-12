import { getSuperAdminProfileOrRedirect } from "@/app/actions/auth";
import { AdminShell } from "@/app/admin/admin-shell";

export const metadata = {
  title: "Super Admin",
  description: "System owner dashboard",
};

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getSuperAdminProfileOrRedirect();
  return <AdminShell>{children}</AdminShell>;
}

