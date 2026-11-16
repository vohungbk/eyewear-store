"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ShippingInfo {
  full_name: string;
  email: string;
  line1: string;
  line2: string;
  postal_code: string;
  city: string;
  state: string;
  phone: string;
  sms_opt_in: boolean;
  country: string;
}

interface CheckoutStore {
  shipping: ShippingInfo | null;
  setShipping: (shipping: ShippingInfo) => void;
  clearShipping: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      shipping: null,
      setShipping: (shipping) => set({ shipping }),
      clearShipping: () => set({ shipping: null }),
    }),
    {
      name: "eyewear-checkout-shipping",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
