import Link from "next/link";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4]">
      <header className="border-b border-neutral-200 py-3 text-center">
        <Link
          href="/"
          className="text-base font-light uppercase tracking-[0.22em]"
        >
          VÉLORA
        </Link>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
