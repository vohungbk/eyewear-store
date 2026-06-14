import type { Metadata } from "next";
import Link from "next/link";
import DiscountForm from "@/components/admin/DiscountForm";

export const metadata: Metadata = { title: "Admin — New Discount Code" };

export default function NewDiscountPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link href="/admin/discounts" className="hover:text-black transition-colors">
          Discount Codes
        </Link>
        <span>/</span>
        <span className="text-neutral-700">New</span>
      </div>
      <h1 className="text-xl font-bold mb-6">New Discount Code</h1>
      <DiscountForm />
    </div>
  );
}
