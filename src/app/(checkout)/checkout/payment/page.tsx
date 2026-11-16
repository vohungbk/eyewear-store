import type { Metadata } from "next";
import PaymentForm from "@/components/checkout/PaymentForm";

export const metadata: Metadata = { title: "Payment" };

export default function PaymentPage() {
  return <PaymentForm />;
}
