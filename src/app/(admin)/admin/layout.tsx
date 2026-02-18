import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/chat");
  }

  return (
    <div className="flex h-[100dvh]">
      <AdminNav />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  );
}
