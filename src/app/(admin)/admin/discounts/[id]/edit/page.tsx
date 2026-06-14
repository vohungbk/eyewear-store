import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDiscount } from "@/lib/data/admin";
import DiscountForm from "@/components/admin/DiscountForm";

export const metadata: Metadata = { title: "Admin — Edit Discount Code" };

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const discount = await getAdminDiscount(id);
  if (!discount) notFound();

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link href="/admin/discounts" className="hover:text-black transition-colors">
          Discount Codes
        </Link>
        <span>/</span>
        <span className="text-neutral-700 font-mono">{discount.code}</span>
      </div>
      <h1 className="text-xl font-bold mb-6">Edit Discount Code</h1>
      <DiscountForm discount={discount} />
    </div>
  );
}
