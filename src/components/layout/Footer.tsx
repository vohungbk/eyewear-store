import { Suspense } from "react";
import Link from "next/link";
import CopyrightYear from "@/components/layout/CopyrightYear";

const FOOTER_LINKS = {
  Shop: [
    { href: "/products", label: "All Eyewear" },
    { href: "/collections/sunglasses", label: "Sunglasses" },
    { href: "/collections/eyeglasses", label: "Eyeglasses" },
    { href: "/collections/sports", label: "Sports" },
    { href: "/collections/blue-light", label: "Blue Light" },
  ],
  Help: [
    { href: "/pages/faq", label: "FAQ" },
    { href: "/pages/shipping", label: "Shipping & Returns" },
    { href: "/pages/sizing", label: "Frame Sizing Guide" },
    { href: "/pages/contact", label: "Contact Us" },
  ],
  Company: [
    { href: "/pages/about", label: "About Us" },
    { href: "/pages/privacy", label: "Privacy Policy" },
    { href: "/pages/terms", label: "Terms of Service" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-white text-xl font-bold tracking-tight"
            >
              EYEWEAR
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Premium eyewear crafted for every lifestyle. Quality frames,
              exceptional clarity.
            </p>
            {/* Social */}
            <div className="mt-5 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-sm font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© <Suspense fallback="2026"><CopyrightYear /></Suspense> EYEWEAR. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* Payment icons */}
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
