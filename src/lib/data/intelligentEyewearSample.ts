// Frames and banners copied from the saved Warby Parker "Intelligent Eyewear"
// collection page. Demo content only.

import type { EyeglassItem } from "./eyeglassesSample";

export interface CollectionBanner {
  alt: string;
  mobileImage: string;
  image: string;
}

export const INTELLIGENT_EYEWEAR: EyeglassItem[] = [
  {
    id: "alden-opt-pine",
    name: "Alden",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/6c8fa0907246ca90c85b75bd687d69fdd446c575.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Alden, Alden Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
      { label: "Alden, Alden Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
    ],
  },
  {
    id: "wren-sun-saddle",
    name: "Wren",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/a331df36486f55fe43c09edf3cfb12c46773e10f.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Wren, Wren Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Wren, Wren Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "reid-opt-jet-black",
    name: "Reid",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/01556d3dca5ede670ef960dc5e234486000ead3a.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Reid, Reid Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/406ac0dd14625324731bf7e1cc52ed68e4ac403c.jpg" },
    ],
  },
  {
    id: "alden-sun-saddle",
    name: "Alden",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/3581562a027b35d651ed370b037f2d271f696646.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Alden, Alden Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Alden, Alden Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "wren-opt-pine",
    name: "Wren",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/554165ca748ea0156e1b52e5600d15febdcfb4e5.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Wren, Wren Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
      { label: "Wren, Wren Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
    ],
  },
  {
    id: "reid-sun-jet-black",
    name: "Reid",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/bfcf7d7fc8f7a52333c12ed0bdc5d849ba56740c.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Reid, Reid Jet Black", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/406ac0dd14625324731bf7e1cc52ed68e4ac403c.jpg" },
    ],
  },
  {
    id: "alden-opt-saddle",
    name: "Alden",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/49d60ef1ca80ee7fbc04103569380e7c4e6c6618.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Alden, Alden Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Alden, Alden Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "wren-sun-pine",
    name: "Wren",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/a9962b1bdb468d833533af8bb273452c33f18a32.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Wren, Wren Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
      { label: "Wren, Wren Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
    ],
  },
  {
    id: "wren-opt-saddle",
    name: "Wren",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/9cb081072da9c9669dd439ca8f104885828dc494.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Wren, Wren Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
      { label: "Wren, Wren Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
    ],
  },
  {
    id: "alden-sun-pine",
    name: "Alden",
    price: 395,
    tag: "Intelligent Eyewear",
    image: "https://i.warbycdn.com/s/c/2747f5bc4a55caaceb462a3c955b518bfb594f30.png",
    href: "/products",
    cta: "Select lenses and preorder",
    swatches: [
      { label: "Alden, Alden Pine", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/7cc422e9b9620d88489dbc88c1c7576ed42a7e9d.jpg" },
      { label: "Alden, Alden Saddle", image: "https://i.warbycdn.com/cdn-cgi/image/width=64,quality=80,format=auto/s/f/f1d077b519b3b8f873f94dccdf808d4cdf9e7b8c.jpg" },
    ],
  },
];

export const INTELLIGENT_EYEWEAR_BANNERS: CollectionBanner[] = [
  {
    alt: "Google and Samsung present \"Intelligent Eyewear\" next-gen glasses designed for all-day wear.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/631248047c9e0c2eca6d828d5c8139be8890202e3ab1e38b5b9b923ed15d53e3.png?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/902e0ddb41b3d4e4aed12dae4d8ffac8bc122e58287de24eb9c94abd71fde6e6.png?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
  {
    alt: "Man in Intelligent Eyewear sunglasses. Designed to fit like your favorite frames, but made to do so much more.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/5c14c665c153377c1ca733f51b888a479d6d75e50777a652b8d2affbb2c87c0f.png?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/c99d5415f6e5c18e59545b0dd3cd52cacacd7cb419b440365ea8642814432697.png?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
  {
    alt: "Black Intelligent Eyewear sunglasses. See what's possible with Gemini: hands-free navigation, translation, and more.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/2dbc578c1cee38bfbf4966703f22c55f65709751fb8f081e3d03886d61eb88af.png?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/41f24734302bc4c7adc8402b55451cd1120b5b7176052d84f38dba2eb982ea78.png?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
  {
    alt: "Woman in black Intelligent Eyewear and a striped scarf. Lightweight, long battery life, made for all-day comfort.",
    mobileImage:
      "https://img.warbyparker.com/AIR_ASSETS/f89a701508f75190ab0326c1bb98ca7e22ea3f5fa4c0db95099707ff201a8e46.png?originWidth=684&originHeight=1060&quality=80&width=684",
    image:
      "https://img.warbyparker.com/AIR_ASSETS/b85b12b8d7edeee3ec027f8be9f3f04e88749551bccfc51edd4273683aeba2c8.png?originWidth=1752&originHeight=858&quality=80&width=1752",
  },
];
