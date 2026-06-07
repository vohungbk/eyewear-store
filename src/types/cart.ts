export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number; // final price (product.price + variant.price_modifier)
  imageUrl: string | null;
  slug: string;
  quantity: number;
  stockQuantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export type CartStore = CartState & CartActions;
