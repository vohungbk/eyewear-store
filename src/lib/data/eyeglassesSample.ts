// Sample catalog copied from the saved Warby Parker eyeglasses page (docs/warby-parker).
// Used only as a demo fallback when the database has too few eyeglasses.

export interface EyeglassSwatch {
  label: string;
  image?: string;
  color?: string;
}

export interface EyeglassItem {
  id: string;
  name: string;
  price: number;
  tag?: string;
  image: string | null;
  href: string;
  cta: string;
  swatches: EyeglassSwatch[];
  wishlistId?: string;
}

export const SAMPLE_EYEGLASSES: EyeglassItem[] = [
  {
    id: "sample-wren",
    name: "Wren",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/adf4cd2af9336f1ffa6956dc6eb1b20cff97a589",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Wren, Wren Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Wren, Wren Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "sample-reid",
    name: "Reid",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/e4e2769e7354da5dc3ee72945fe873b54672a185",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Reid, Reid Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/406ac0dd14625324731bf7e1cc52ed68e4ac403c.jpg" },
    ],
  },
  {
    id: "sample-alden",
    name: "Alden",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/25e8df32361ff8f2c407139b977227b092a3ecbc",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Alden, Alden Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Alden, Alden Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "sample-gillian",
    name: "Gillian",
    price: 95,
    tag: "Warby Parker | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/912b4d5ddcd1592fb398b51599c2c6ad05c66f13",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Gillian, Gillian Hope", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/2da1ca7d1b1fe9a45803054b24c7b6442a6bb4dc.jpg" },
      { label: "Gillian, Gillian Nutmeg Crystal", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/da1920ac1b96a369c394da8c9c14635e7f5c0deb.jpg" },
      { label: "Gillian, Gillian Confetti Tortoise with Polished Gold", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/cf4d8e0dfa2fe4b5dace3ee042f272b2d3cbad1b.jpg" },
    ],
  },
  {
    id: "sample-franny",
    name: "Franny",
    price: 95,
    tag: "Warby Parker | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/550880ddc224dcda5c70176ee793cf7e0bdc4cad",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Franny, Franny Resilience", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/971fbc123501d0993c704f92c47bf961ab768820.jpg" },
      { label: "Franny, Franny Crystal Moss", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7e5d2ee888486df465a311e96493ad186c073a8e.jpg" },
      { label: "Franny, Franny Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
      { label: "Franny, Franny Toffee Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/948b97ee19f08be6d3a68389c0bd659ae8fca940.jpg" },
    ],
  },
  {
    id: "sample-waters",
    name: "Waters",
    price: 95,
    image: "https://i.warbycdn.com/s/c/17943740d57590d1ee32a8513cf37ed62a713435",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Waters, Waters Peanut Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/e5eee6875c809f11506809ac92f3ba646b6ad14f.jpg" },
      { label: "Waters, Waters Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
    ],
  },
  {
    id: "sample-rory",
    name: "Rory",
    price: 95,
    image: "https://i.warbycdn.com/s/c/41b4806bddc9d99b93413e9a9cf231d4c5999d92",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Rory, Rory Oak Barrel", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/-/f/color-oak-barrel-4609b64e.jpg" },
      { label: "Rory, Rory Mulberry Crystal", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/d64a027e5e4414aabdfb7fcc4250bcba4ee71550.jpg" },
    ],
  },
  {
    id: "sample-montgomery",
    name: "Montgomery",
    price: 95,
    image: "https://i.warbycdn.com/s/c/e774dd285d0c02029a63e9558d89c936d937cbfc",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Montgomery, Montgomery Phantom Smoke", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/-/f/color-phantom-smoke-6717f873.jpg" },
      { label: "Montgomery, Montgomery Black Walnut", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/-/f/blac23033ad2.jpg" },
    ],
  },
  {
    id: "sample-monica",
    name: "Monica",
    price: 95,
    image: "https://i.warbycdn.com/s/c/917b6eccc06d9154715588cb5dc970c8cc066948",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Monica, Monica Pinetree Green", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/44a25c8d1bd2a95593817e462e36a79408675962.jpg" },
      { label: "Monica, Monica Ristretto Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/81ed1cfe9ab56031936dbbb3c6d775d0deafdf63.jpg" },
    ],
  },
  {
    id: "sample-mel",
    name: "Mel",
    price: 95,
    image: "https://i.warbycdn.com/s/c/1f06b204836daed9a05b5186032389cd13fec189",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Mel, Mel Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
      { label: "Mel, Mel Confetti Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/cf4d8e0dfa2fe4b5dace3ee042f272b2d3cbad1b.jpg" },
      { label: "Mel, Mel Oak Barrel", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/-/f/color-oak-barrel-4609b64e.jpg" },
    ],
  },
];

export const SAMPLE_BANNER = {
  mobileImage:
    "https://img.warbyparker.com/AIR_ASSETS/a2c45ae48f245a3ac8aa1cb06f43aac89fc86802bfcd18b93643513960c45a68.png?originWidth=684&originHeight=1060&quality=80&width=684",
  href: "/products",
  alt: "Introducing intelligent eyewear from Google and Samsung. Pre-order now.",
  image:
    "https://img.warbyparker.com/AIR_ASSETS/99e82e4fa66f424e16df23a75cfc9b800bda61e0e20eb77889e0c064975a885c.png?originWidth=1334&originHeight=858&quality=80&width=1334",
};
