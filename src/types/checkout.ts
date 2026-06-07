export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CheckoutFormValues {
  email: string;
  full_name: string;
  phone?: string;
  shipping_address: Address;
  billing_same_as_shipping: boolean;
  billing_address?: Address;
}

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
