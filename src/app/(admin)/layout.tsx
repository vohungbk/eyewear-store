import { Suspense } from "react";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-screen">
            <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
          </div>
        }
      >
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </Suspense>
    </div>
  );
}
