"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartItemCount, useCartStore } from "@/store/cartStore";
import SearchAutocomplete from "@/components/layout/SearchAutocomplete";

const NAV_LINKS = [
  { href: "/collections/eyeglasses", label: "Eyeglasses" },
  { href: "/collections/sunglasses", label: "Sunglasses" },
  { href: "/collections/sports", label: "Sports" },
  { href: "/products", label: "All Eyewear" },
  { href: "/gift-cards", label: "Gift cards" },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.2 18.6c1.2-2 3.2-3.1 5.8-3.1s4.6 1.1 5.8 3.1" />
  </Icon>
);

const HeartIcon = () => (
  <Icon>
    <path d="M12 20.5s-7.5-4.6-9-9.4C2.1 8 4 5 7 5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3 0 4.9 3 4 6.1-1.5 4.8-9 9.4-9 9.4z" />
  </Icon>
);

const CartIcon = () => (
  <Icon>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Icon>
);

const iconButton = "relative p-2 hover:opacity-60 transition-opacity";

export default function Header() {
  const pathname = usePathname();
  const itemCount = useCartItemCount();
  const openCart = useCartStore((s) => s.openCart);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Keep --header-h in sync so the home hero can slide under the header.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const sync = () =>
      root.style.setProperty("--header-h", `${el.offsetHeight}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The home page hero sits under the header. Over it the header is
  // transparent with white text, and turns solid on hover, focus, scroll
  // or while the mobile menu is open. Other pages are always solid.
  const transparent =
    pathname === "/" && !scrolled && !hovered && !focused && !mobileOpen;

  return (
    <header
      ref={headerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        transparent
          ? "bg-white text-neutral-900 border-neutral-200 md:bg-transparent md:text-white md:border-transparent"
          : "bg-white text-neutral-900 border-neutral-200"
      }`}
    >
      <div className="px-4 sm:px-6">
        {/* Row 1: logo (menu toggle on mobile) */}
        <div className="relative flex min-h-10 items-center justify-center md:justify-start pt-4 md:min-h-0">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="absolute left-0 md:hidden p-2 -ml-2"
          >
            <Icon>
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </Icon>
          </button>
          <Link
            href="/"
            className="text-xl font-light uppercase tracking-[0.22em] shrink-0"
          >
            VÉLORA
          </Link>
          {/* Mobile actions sit on the logo row */}
          <div className="absolute right-0 flex items-center md:hidden">
            <SearchAutocomplete />
            <Link href="/account" aria-label="Account" className={iconButton}>
              <UserIcon />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Cart (${itemCount} items)`}
              className={iconButton}
            >
              <CartIcon />
              <CartBadge count={itemCount} invert={false} />
            </button>
          </div>
        </div>

        {/* Row 2: nav (left) + actions (right), desktop only */}
        <div className="hidden md:flex items-center justify-between gap-4 pt-2 pb-4">
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:opacity-60 ${
                  pathname === href ? "underline underline-offset-8" : ""
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className={`mr-1 inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors ${
                transparent
                  ? "border-white hover:bg-white hover:text-neutral-900"
                  : "border-neutral-900 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <UserIcon />
              Sign in
            </Link>
            <SearchAutocomplete />
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className={iconButton}
            >
              <HeartIcon />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Cart (${itemCount} items)`}
              className={iconButton}
            >
              <CartIcon />
              <CartBadge count={itemCount} invert={transparent} />
            </button>
          </div>
        </div>

        {/* Row 2 on mobile: nav */}
        <nav className="md:hidden flex items-center justify-between gap-4 overflow-x-auto pt-3 pb-3 text-sm font-medium whitespace-nowrap">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={pathname === href ? "underline underline-offset-8" : ""}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/account/wishlist"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium"
            >
              Wishlist
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="py-2 text-sm font-medium"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function CartBadge({ count, invert }: { count: number; invert: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
        invert ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
