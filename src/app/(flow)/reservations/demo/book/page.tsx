/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import DemoLocationPicker from "@/components/reservations/DemoLocationPicker";

export const metadata: Metadata = {
  title: "Book an Intelligent Eyewear demo",
  description:
    "Try on Intelligent Eyewear and see what it can do. Book a demo at a location near you.",
};

const HERO_IMAGE =
  "https://img.warbyparker.com/v2/demo-frame-asset_updated-32e671bbaa9c4727836570b507b6e1f5.png?originWidth=1356&originHeight=534&quality=80&width=1356";

const CONTACTS_ICON =
  "https://img.warbyparker.com/v2/contact-lenses-eedc523009154d6f9d89d62efc468572.png?originWidth=48&originHeight=48";

const EXPECT = [
  {
    title: "Introduction",
    body: "We’ll guide you through the basic controls and voice commands.",
  },
  {
    title: "Get to know Gemini",
    body: "Learn how your new AI assistant helps keep your day on track. All hands-free.",
  },
  {
    title: "See for yourself",
    body: "Try on the glasses and test them with real-world scenarios.",
  },
];

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#121212]">
      {/* Flow nav bar: progress, back, logo, close */}
      <header>
        <div
          role="progressbar"
          aria-label="progressbar"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1 w-full bg-[#e1e5e6]"
        >
          <div className="h-full bg-[#1050d0]" style={{ width: "0%" }} />
        </div>
        <div className="relative flex h-16 items-center justify-center px-4">
          <Link
            href="/"
            className="text-xl font-light uppercase tracking-[0.22em]"
          >
            V&Eacute;LORA
          </Link>
          <Link
            href="/"
            aria-label="Close"
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        <h1 className="font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
          Book an Intelligent Eyewear demo
        </h1>

        <div className="mt-8 overflow-hidden rounded-xl bg-[#e8ebe4]">
          <img
            src={HERO_IMAGE}
            alt="Green Intelligent Eyewear glasses, front view"
            className="aspect-[1356/534] w-full object-cover"
          />
        </div>

        <section className="mt-12">
          <h2 className="font-serif text-2xl md:text-3xl">
            What to expect in the demo
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {EXPECT.map((item) => (
              <div key={item.title}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-base text-[#3a434c]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="mt-12 flex items-start gap-4 rounded-xl bg-[#dbe7fb] p-5 md:items-center">
          <img
            src={CONTACTS_ICON}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0"
          />
          <div>
            <h3 className="text-lg font-semibold">Wear contact lenses?</h3>
            <p className="mt-1 text-base text-[#3a434c]">
              Be sure to wear them to your demo. (Demo Intelligent Eyewear
              won&rsquo;t have prescription lenses.)
            </p>
          </div>
        </aside>

        <section className="mt-12">
          <h2 className="mb-6 font-serif text-3xl md:text-4xl">
            Locations near you
          </h2>
          <DemoLocationPicker />
        </section>
      </main>
    </div>
  );
}
