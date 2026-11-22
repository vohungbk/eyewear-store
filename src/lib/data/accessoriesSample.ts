// Demo content only. Product data mirrored from the accessories design (acc.html).

export type AccessoryCategory = "cases" | "cleaner" | "clip-ons";

export interface AccessorySwatch {
  name: string;
  /** Image id on the swatch CDN. */
  image: string;
}

export interface Accessory {
  id: string;
  name: string;
  price: number;
  category: AccessoryCategory;
  /** Image id on the product CDN. */
  image: string;
  swatches: AccessorySwatch[];
}

export const ACCESSORY_TABS: { id: "all" | AccessoryCategory; label: string }[] = [
  { id: "all", label: "All accessories" },
  { id: "cases", label: "Glasses cases" },
  { id: "cleaner", label: "Lens cleaner" },
  { id: "clip-ons", label: "Sun Clip-Ons" },
];

const PRODUCT_CDN = "https://i.warbycdn.com/cdn-cgi/image/width=640,quality=80,format=auto/s/c/";
const SWATCH_CDN = "https://i.warbycdn.com/cdn-cgi/image/width=48,quality=80,format=auto/s/f/";

export const accessoryImage = (id: string) => PRODUCT_CDN + id;
export const swatchImage = (id: string) => SWATCH_CDN + id;

export const ACCESSORIES: Accessory[] = [
  {
    id: "parker-pouch-single",
    name: "Parker Pouch - Single",
    price: 20,
    category: "cases",
    image: "e1209ca0e3f17dc4ee7b425e7fdae453ba191fcf",
    swatches: [
      { name: "Checkered Amarena", image: "bd367f5b20529a6522d0a1f891f97a5fe205e888" },
      { name: "Amarena", image: "62140abb920b9be9121bd0cca0cb26810e6744a1" },
      { name: "Silver", image: "6f258e135887e7ac3aae38439428b661fc7fbb4e" },
      { name: "Walnut", image: "c9de371780d7d99b0b3176dd3871ffd4b3ee49fb" },
      { name: "Fuchsia", image: "c20e1361fb4c1fe19ebdd954145c6fc5da697924" },
      { name: "Midnight", image: "549ddd7b02ce34a18bb4877e1f8282faa6ba8401" },
    ],
  },
  {
    id: "parker-pouch-double",
    name: "Parker Pouch - Double",
    price: 25,
    category: "cases",
    image: "8de8a45844067bcc3eb037c37a9f0ae14daab4ad",
    swatches: [
      { name: "Midnight", image: "549ddd7b02ce34a18bb4877e1f8282faa6ba8401" },
      { name: "Walnut", image: "c9de371780d7d99b0b3176dd3871ffd4b3ee49fb" },
      { name: "Fuchsia", image: "c20e1361fb4c1fe19ebdd954145c6fc5da697924" },
    ],
  },
  {
    id: "parker-travel-case",
    name: "Parker Travel Case",
    price: 40,
    category: "cases",
    image: "daf02b8ef6079485a48b874dae738976f4baf8fa",
    swatches: [
      { name: "Silver", image: "6f258e135887e7ac3aae38439428b661fc7fbb4e" },
      { name: "Midnight", image: "549ddd7b02ce34a18bb4877e1f8282faa6ba8401" },
      { name: "Walnut", image: "c9de371780d7d99b0b3176dd3871ffd4b3ee49fb" },
    ],
  },
  {
    id: "parker-case",
    name: "Parker Case",
    price: 20,
    category: "cases",
    image: "f74d20f8403012a44a1f00f80aa5e4e2d8c045fe",
    swatches: [
      { name: "Midnight", image: "549ddd7b02ce34a18bb4877e1f8282faa6ba8401" },
      { name: "Cornflower", image: "40f5227c6d9e1fdea588c284a2f18fd818df5228" },
      { name: "Ivy", image: "0bc23a4f9101d3a6d3cd90e07cb034c24eb561e9" },
      { name: "Walnut", image: "c9de371780d7d99b0b3176dd3871ffd4b3ee49fb" },
      { name: "Primrose", image: "b9a252a315f4e0cf153f1950b95de5beafa57d32" },
    ],
  },
  {
    id: "anti-fog-lens-spray",
    name: "Anti-Fog Lens Spray",
    price: 20,
    category: "cleaner",
    image: "32bd1cb8107a116519a2b5aee9e76ed1b1338868",
    swatches: [
      { name: "Multi-color", image: "3b611084ea67901d03cdaee947b3d131ac71667b" },
    ],
  },
  {
    id: "clean-my-lenses-kit-with-anti-fog-spray",
    name: "Clean My Lenses Kit with Anti-Fog Spray",
    price: 15,
    category: "cleaner",
    image: "dba6d0f548b99447583925d7b896f89bcedffd3b",
    swatches: [
      { name: "Multi-color", image: "3b611084ea67901d03cdaee947b3d131ac71667b" },
    ],
  },
  {
    id: "lens-cloth-trio",
    name: "Lens Cloth Trio",
    price: 20,
    category: "cleaner",
    image: "e0ab9152211b5fff4bb7c6c87f1f4b1f704c80c0",
    swatches: [
      { name: "Multi-color", image: "3b611084ea67901d03cdaee947b3d131ac71667b" },
    ],
  },
  {
    id: "keiko-medium-clip-on",
    name: "Keiko Medium Clip-On",
    price: 75,
    category: "clip-ons",
    image: "afcc015f5ed78c0da51835825cff8b762150cd0f",
    swatches: [
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Polished Silver with Blue Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
    ],
  },
  {
    id: "esme-medium-clip-on",
    name: "Esme Medium Clip-On",
    price: 75,
    category: "clip-ons",
    image: "80106857862715c9f8ff55101d3c0d6f5933e29b",
    swatches: [
      { name: "Polished Silver with Blue Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
      { name: "Polished Gold with Grey Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
    ],
  },
  {
    id: "percey-clip-on-medium",
    name: "Percey Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "690c8a09d692bd669357859844dcac42395c2fa7",
    swatches: [
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "hayden-clip-on-medium",
    name: "Hayden Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "f0bde84a442aef0c2613996f75aa08da45d0bdeb",
    swatches: [
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "hayden-clip-on-wide",
    name: "Hayden Clip-On Wide",
    price: 75,
    category: "clip-ons",
    image: "f0bde84a442aef0c2613996f75aa08da45d0bdeb",
    swatches: [
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "durand-clip-on-wide",
    name: "Durand Clip-On Wide",
    price: 75,
    category: "clip-ons",
    image: "f14b8862c54e01f55615de2df974a8be45727a5e",
    swatches: [
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Polished Silver with Blue Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "simon-clip-on-medium",
    name: "Simon Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "2bf9d8970b6d578dcbeb8156c14e3f1b0711fe25",
    swatches: [
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Antique Silver with Blue Lenses", image: "7f91bd475f94b20bac5bdc9c41499dfb415a8c3f" },
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "carlton-clip-on-medium",
    name: "Carlton Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "6db3f2764767d65252b57e96393691a7be0251db",
    swatches: [
      { name: "Polished Silver with Blue Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
    ],
  },
  {
    id: "carlton-clip-on-wide",
    name: "Carlton Clip-On Wide",
    price: 75,
    category: "clip-ons",
    image: "a1310d70a914421fbe7fd1f84dc7f9821fbb2355",
    swatches: [
      { name: "Polished Gold with Green Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Polished Silver with Blue Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
    ],
  },
  {
    id: "whalen-medium-clip-on",
    name: "Whalen Medium Clip-On",
    price: 75,
    category: "clip-ons",
    image: "e8d53bbf12ebe1ce194ee4b3c043713c94bf8451",
    swatches: [
      { name: "Polished Gold with Brown Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
      { name: "Polished Silver with Grey Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
    ],
  },
  {
    id: "bodie-wide-clip-on",
    name: "Bodie Wide Clip-On",
    price: 75,
    category: "clip-ons",
    image: "6e06294d6c60c183df4910785aae71725e37e1cb",
    swatches: [
      { name: "Polished Silver with Green Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
    ],
  },
  {
    id: "chamberlain-clip-on-medium",
    name: "Chamberlain Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "ad62264570d84a90972fb0858ba2dbf235ab2251",
    swatches: [
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "wilkie-clip-on-medium",
    name: "Wilkie Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "211f813f06ef0f2842a68d9533c0f56e9ff4b174",
    swatches: [
      { name: "Brushed Ink with Grey Lenses", image: "c0a2be9f9cf011b1bfdc16d97693f81f4b91e65e" },
    ],
  },
  {
    id: "brady-clip-on-medium",
    name: "Brady Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "b2b3b284d417cf8573ee5f69344978d7aad3811c",
    swatches: [
      { name: "Polished Silver with Green Lenses", image: "568ba09970116bceefb097985217806af6211f9c" },
    ],
  },
  {
    id: "daisy-clip-on-medium",
    name: "Daisy Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "ec093b1cf2c68f3da166d11c99e153a752aa8180",
    swatches: [
      { name: "Polished Gold with Grey Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
    ],
  },
  {
    id: "winston-clip-on-medium",
    name: "Winston Clip-On Medium",
    price: 75,
    category: "clip-ons",
    image: "cba910019a920351bf6bbc353255aade6babb131",
    swatches: [
      { name: "Polished Gold with Grey Lenses", image: "8968f627ce5022c7b7efa35daba998e82e9c625d" },
    ],
  },
];
