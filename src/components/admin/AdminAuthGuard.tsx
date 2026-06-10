import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((data as { role: string } | null)?.role !== "admin") redirect("/");

  return (
    <>
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </>
  );
}
