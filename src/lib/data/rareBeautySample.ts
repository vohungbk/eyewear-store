// collection page. Demo content only.

import type { EyeglassItem } from "./eyeglassesSample";

export interface RareBeautyBanner {
  /** hero/wide/video: 2 columns, square: 1 column, full: whole row. */
  variant: "hero" | "wide" | "square" | "video" | "full";
  alt: string;
  mobileImage: string;
  image: string;
  /** Only for the "video" variant. `image`/`mobileImage` are the posters. */
  video?: { src: string; mobileSrc: string };
}

export const RARE_BEAUTY_FRAMES: EyeglassItem[] = [
  {
    id: "franny-resilience",
    name: "Franny",
    price: 95,
    tag: "VÉLORA | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/229a403446bc7548bc49a1ae55929d7ff7157a55.png",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Franny, Franny Resilience", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/971fbc123501d0993c704f92c47bf961ab768820.jpg" },
      { label: "Franny, Franny Toffee Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/948b97ee19f08be6d3a68389c0bd659ae8fca940.jpg" },
      { label: "Franny, Franny Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
      { label: "Franny, Franny Crystal Moss", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7e5d2ee888486df465a311e96493ad186c073a8e.jpg" },
    ],
  },
  {
    id: "albie-faith",
    name: "Albie",
    price: 145,
    tag: "VÉLORA | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/9ab97077e69cdc711a46fe123b53f0c3caa93e6d.png",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Albie, Albie Faith with Polished Gold", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/8968f627ce5022c7b7efa35daba998e82e9c625d.jpg" },
    ],
  },
  {
    id: "gillian-hope",
    name: "Gillian",
    price: 95,
    tag: "VÉLORA | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/c50ce58beed2f5ef2cb4039e9d545328109fcd32.png",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Gillian, Gillian Hope", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/2da1ca7d1b1fe9a45803054b24c7b6442a6bb4dc.jpg" },
      { label: "Gillian, Gillian Meadow", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/708e3f13c53ce3f77cc8a5038929f94e392f45a5.jpg" },
      { label: "Gillian, Gillian Nutmeg Crystal", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/da1920ac1b96a369c394da8c9c14635e7f5c0deb.jpg" },
      { label: "Gillian, Gillian Confetti Tortoise with Polished Gold", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/cf4d8e0dfa2fe4b5dace3ee042f272b2d3cbad1b.jpg" },
      { label: "Gillian, Gillian Teal Tortoise", color: "#2f6f6a" },
    ],
  },
  {
    id: "millie-worth",
    name: "Millie",
    price: 95,
    tag: "VÉLORA | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/cbbbad2cba05ee223bae24b4382d2a028fd0c7b5.png",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Millie, Millie Worth", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/b7df03f999b81965433491240d29f3fcca8d02e8.jpg" },
      { label: "Millie, Millie Ancho Tortoise", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/94599bd11a337e726df14e9882cd294d5cedaee8.jpg" },
      { label: "Millie, Millie Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
    ],
  },
  {
    id: "elwell-encourage",
    name: "Elwell",
    price: 95,
    tag: "VÉLORA | Rare Beauty",
    image: "https://i.warbycdn.com/s/c/2ef9afa3fff657c1b0cbb5d86fb30fe443e22cd8.png",
    href: "/products",
    cta: "Select lenses and buy",
    swatches: [
      { label: "Elwell, Elwell Encourage with Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/6ec9b1421ab76a54cc42177b63f290539cb5f344.jpg" },
    ],
  },
];

export const RARE_BEAUTY_BANNERS: RareBeautyBanner[] = [
  {
    variant: "hero",
    alt: "A young Asian woman wearing sunglasses and a pink fur stole.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/0cb54e9c32d4289e0d444318b28324ac077c751a30dc28474fb6792c0f74729c.jpg?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/b70d661cb3b4682453f02f8fd74ab5709dcb148b1a0c66a244dca770c5385718.jpg?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
  {
    variant: "square",
    alt: "Together with Rare Beauty, we customized five frames to match their fan-favorite Soft Pinch Liquid Blush.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/6cfee59cebad10c0a9766a35a7ebb7f91f6866d3e6e3f798de8d12441d1f576f.jpg?originWidth=684&originHeight=684&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/e8eec315a7ab06b186f3da2a3042c112aa0bf7486c6047a5f5e2964c8b9d3321.jpg?originWidth=852&originHeight=858&quality=80&width=852",
  },
  {
    variant: "wide",
    alt: "Megan from KATSEYE models glasses from the new collection.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/f29c8aa6546c886edcbb365f7f1f5ea07ada405268741ba6ddce69e6445a905f.jpg?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/5f079f865a840f6eebf565e0200580bf6ff2982f97f90472f057a4ed066c32e5.png?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
  {
    variant: "video",
    alt: "It\u2019s an eye-catching take on color coordination. These are five statement shapes in five signature shades.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/09497bc88028d3a30e028e5f6720e02d5e8f42d44457ecd3378e300e8437d24e.jpg?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/66c2cc73b786ea6a57bec7b5dd42ce36693ce55d83ca3acb476ea57497357d89.png?originWidth=1752&originHeight=858&quality=80&width=1752",
    video: {
      src: "https://img.warbyparker.com/AIR_ASSETS/ed9259eada19ff6a1c6d7438d554015930b83de16b2f1ae4b4671bc929166ec8.mp4",
      mobileSrc:
        "https://img.warbyparker.com/AIR_ASSETS/49212e77c4b298c5e4d78a39414283453b24ee5870ba562b85107c3a65b4e6cf.mp4",
    },
  },
  {
    variant: "full",
    alt: "For every pair purchased, a pair of glasses is distributed to someone in need.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/f4c1e67783ec1e7a687477cc7f52610194abd13697d53064ce47900a7ee5a19c.jpg?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/917275d171d84869f00012e68da9201ad145cd6152ea9fe4618d188c0247bb6e.jpg?originWidth=2652&originHeight=858&quality=80&width=2652",
  },
];
