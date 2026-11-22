// Demo content only. Links to collections without a page point to /products.

const A = "https://img.warbyparker.com/AIR_ASSETS/";
const V = "https://img.warbyparker.com/v2/";

export interface CollectionMedia {
  alt: string;
  /** Image shown from the tablet breakpoint up (or the video poster). */
  image: string;
  /** Image shown on mobile (or the mobile video poster). */
  mobileImage: string;
  /** Looping video. `image` and `mobileImage` are used as posters. */
  video?: string;
}

export interface CollectionItem {
  id: string;
  title?: string;
  /** Logo shown above the body instead of a title. */
  logo?: { src: string; alt: string };
  body: string;
  note?: string;
  cta: { label: string; href: string };
  media: CollectionMedia;
}

export const COLLECTIONS: CollectionItem[] = [
  {
    id: "intelligent-eyewear",
    logo: {
      src: `${A}c9116fb4bc82dfba5b8e8cdb1a7d793d9f76d389c86f2526dad027dd6d1806d3.svg?originWidth=454&originHeight=78&quality=80&width=454`,
      alt: "Google and Samsung Intelligent Eyewear",
    },
    body: "In partnership with Google and Samsung, we’ve developed next-gen glasses designed for all-day wear.",
    note: "Google is a trademark of Google LLC.",
    cta: { label: "Shop now", href: "/intelligent-eyewear" },
    media: {
      alt: "Intelligent Eyewear",
      image: `${A}470c465f6372cc0057e32d26205686bb7236d446cfdf34a82275db63bd8a3224.jpg?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      mobileImage: `${A}470c465f6372cc0057e32d26205686bb7236d446cfdf34a82275db63bd8a3224.jpg?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      video: `${A}666bfdf0cb40bab1f6158512316cb8b1d79d5c5a0d5b63168d6843287ebae536.mp4`,
    },
  },
  {
    id: "rare-beauty",
    title: "VÉLORA | Rare Beauty",
    body: "Together with Rare Beauty, we customized five frames to match fan-favorite shades of their Soft Pinch Liquid Blush.",
    cta: { label: "Shop the collection", href: "/collections/rare-beauty" },
    media: {
      alt: "A person wearing pink-tinted glasses applies blush to their cheek with a brush.",
      image: `${A}1ee13f1f6b4ec013c2a58d6b2b60f87dfbb42e3cf34485a16b8d4637f16ee6b6.jpg?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      mobileImage: `${A}e9315cf2f18b790d3ed047fd71a65dde8df6336b8bc79925faa3d9b17910e14c.jpg?originWidth=684&originHeight=692&quality=80&width=684`,
    },
  },
  {
    id: "winter-2026",
    title: "Winter 2026",
    body: "This season’s styles are a feast for the eyes. Modern, contoured profiles are paired with cozy, vintage-inspired colorways.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "Winter 2026 collection",
      image: `${A}e3cc0af790f2f93bb1f2148a03694c61df99640540746dc7715b66cf6f9463a7.jpg?originWidth=1608&originHeight=1608&quality=80&width=1608`,
      mobileImage: `${A}e3cc0af790f2f93bb1f2148a03694c61df99640540746dc7715b66cf6f9463a7.jpg?originWidth=1608&originHeight=1608&quality=80&width=1608`,
      video: `${A}7c29421df38967b78dc5a8c96b80701761c1deb48d381e33ebb1f794aa57ac0d.mp4`,
    },
  },
  {
    id: "iris-edition",
    title: "Iris Edition",
    body: "Constructed with metal and acetate, Iris Edition returns with dialed-up details and fall-ish polish.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "A young woman with wavy blonde hair and a serious expression wears rose-tinted glasses.",
      image: `${V}Collections%20Page_Desktop-1921edc40dce46f78bed483a39fdb0a3.jpg?originWidth=1608&originHeight=1608&quality=80&width=1608`,
      mobileImage: `${V}Collections%20Page_Mobile-f149312ddd784d68b1bbc43fb26dbcb4.jpg?originWidth=1026&originHeight=1038&quality=80&width=1026`,
    },
  },
  {
    id: "archival-edit",
    title: "The Archival Edit",
    body: "We reworked our favorite archival details in a modern, ultrathin construction. These frames are designed for the detail-oriented.",
    cta: { label: "Shop now", href: "/products" },
    media: {
      alt: "Close-up of a man with a mustache and short haircut wearing sunglasses.",
      image: `${V}Collections%20Page_Desktop-5c19de45997d444888baea264417f5a6.jpg?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      mobileImage: `${V}Collections%20Page_Mobile-1dbb3ac2983e453abe3c99db41f2c8e4.jpg?originWidth=684&originHeight=692&quality=80&width=684`,
    },
  },
  {
    id: "spike-jonze",
    title: "Spike Jonze × VÉLORA",
    body: "We reissued Spike Jonze’s favorite frames for a limited time—so you can see the world through his lenses.",
    cta: { label: "Shop the collaboration", href: "/products" },
    media: {
      alt: "Collage of a woman in sunglasses and a red dress and a man in glasses.",
      image: `${V}Spike-Collections-D-1814427ee86145dab13622d42a1dbd50.png?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      mobileImage: `${V}Spike-Collections-M-b15be4855083437fb4d955e8041d9d98.png?originWidth=692&originHeight=692&quality=80&width=692`,
    },
  },
  {
    id: "metal-edit",
    title: "The Metal Edit",
    body: "For our latest collection, a timeless eyewear material takes impressive new forms.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "Two pairs of glasses, one tortoise-shell and one black, are hanging.",
      image: `${V}Collections%20Page_Desktop%20the%20metal%20edit-081ff5f05bf141b4ad30405fd9e20bea.jpg?originWidth=1072&originHeight=1072&quality=80&width=1072`,
      mobileImage: `${V}Collections%20Page_Mobile%20the%20metal%20edit-08cf3cfe069b483eadafedbd0095f436.jpg?originWidth=684&originHeight=692&quality=80&width=684`,
    },
  },
  {
    id: "fall-2026",
    title: "Fall 2026",
    body: "However you approach fall’s fresh start, there’s a new VÉLORA frame to match.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "Three pairs of glasses on a yellow surface with autumn leaves.",
      image: `${V}Collections%20Page_Desktop-6f7c6911952c4d15a4ece1de24db8caa.jpg?originWidth=1608&originHeight=1608&quality=80&width=1608`,
      mobileImage: `${V}Collections%20Page_Mobile-36e8905b099c4708b27ef94a195121b0.jpg?originWidth=1026&originHeight=1038&quality=80&width=1026`,
    },
  },
  {
    id: "tortoise-color-block",
    title: "Tortoise Color Block",
    body: "With contrasting shades on the face front and temples, these frames reimagine some of our bestselling shapes.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "Close-up of a woman wearing oversized tortoiseshell sunglasses, laughing.",
      image: `${A}a92449c84cf201ed4e215ef3bc9df7a3ad550c2fecdbed324843072258f4bc13.jpg?originWidth=1608&originHeight=1608&quality=80&width=1608`,
      mobileImage: `${A}17f5bed104663d92b7ff21c30f69035143278d8c47836b3665b92f712d687150.jpg?originWidth=1026&originHeight=1038&quality=80&width=1026`,
    },
  },
  {
    id: "aero",
    title: "Aero Series",
    body: "These ultralight, ultrathin frames are engineered to a new standard of all-day comfort.",
    cta: { label: "Shop the collection", href: "/products" },
    media: {
      alt: "A pair of black eyeglasses with tortoise shell temples rests atop a surface.",
      image: `${A}26f45b55050bab55912a382a997d3ab57694153181dbca7f8997758511506adf.jpg?originWidth=2144&originHeight=2144&quality=80&width=2144`,
      mobileImage: `${A}a69db0ce0db27fa7fc06912f460024abaa77c83a48e6aaaa263bcc42a4d4bfa2.jpg?originWidth=1368&originHeight=1384&quality=80&width=1368`,
    },
  },
];
