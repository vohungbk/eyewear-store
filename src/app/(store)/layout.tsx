import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";

function HeaderFallback() {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 h-16" />
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
