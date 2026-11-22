import type { Metadata } from "next";
import FrameCatalogPage, {
  type FrameCatalogConfig,
  type FrameCatalogSearchParams,
} from "@/components/ui/FrameCatalogPage";
import { SAMPLE_BANNER, SAMPLE_EYEGLASSES } from "@/lib/data/eyeglassesSample";

export const metadata: Metadata = {
  title: "Eyeglasses",
  description:
    "Prescription frames for every face. Shop our full eyeglasses collection.",
};

const CONFIG: FrameCatalogConfig = {
  categorySlug: "eyeglasses",
  title: "Eyeglasses",
  basePath: "/eyeglasses",
  description: [
    "Starting at $95, including prescription lenses with scratch-resistant, anti-reflective coatings. After choosing your eyeglasses, pick from a variety of prescription types and lens options to meet your vision needs.",
    "Buy one pair and get 20% off additional pairs, plus get free shipping and free 30-day returns on every order.",
  ],
  merch: [
    { value: "bestsellers", label: "Bestsellers" },
    { value: "90s", label: "Trending: 90s minimalism" },
    { value: "progressives", label: "Good for progressives" },
    { value: "new-arrival", label: "New arrivals" },
  ],
  sample: SAMPLE_EYEGLASSES,
  banner: SAMPLE_BANNER,
};

export default function EyeglassesPage({
  searchParams,
}: {
  searchParams: Promise<FrameCatalogSearchParams>;
}) {
  return <FrameCatalogPage config={CONFIG} searchParams={searchParams} />;
}
