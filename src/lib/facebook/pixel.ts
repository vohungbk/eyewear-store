// Client-side Meta Pixel helpers — only call from client components / useEffect

declare global {
  interface Window {
    fbq: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[] };
    _fbq: unknown;
  }
}

function fbq(...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

function getFbp(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.match(/_fbp=([^;]+)/)?.[1];
}

function getFbc(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.match(/_fbc=([^;]+)/)?.[1];
}

async function mirrorToServer(payload: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/facebook/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, fbp: getFbp(), fbc: getFbc() }),
    });
  } catch {
    // Silent fail — never block UX
  }
}

export function pageview(): void {
  fbq("track", "PageView");
}

export function viewContent(product: {
  id: string;
  name: string;
  price: number;
}): void {
  const eventId = crypto.randomUUID();
  fbq(
    "track",
    "ViewContent",
    {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "USD",
    },
    { eventID: eventId }
  );
  mirrorToServer({
    event_name: "ViewContent",
    event_id: eventId,
    content_ids: [product.id],
    content_name: product.name,
    value: product.price,
    currency: "USD",
  });
}

export function addToCart(item: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  const eventId = crypto.randomUUID();
  fbq(
    "track",
    "AddToCart",
    {
      content_ids: [item.productId],
      content_name: item.name,
      content_type: "product",
      value: item.price * item.quantity,
      currency: "USD",
      num_items: item.quantity,
    },
    { eventID: eventId }
  );
  mirrorToServer({
    event_name: "AddToCart",
    event_id: eventId,
    content_ids: [item.productId],
    content_name: item.name,
    value: item.price * item.quantity,
    currency: "USD",
    num_items: item.quantity,
  });
}

export function initiateCheckout(data: {
  value: number;
  numItems: number;
  contentIds: string[];
}): void {
  const eventId = crypto.randomUUID();
  fbq(
    "track",
    "InitiateCheckout",
    {
      value: data.value,
      currency: "USD",
      num_items: data.numItems,
      content_ids: data.contentIds,
      content_type: "product",
    },
    { eventID: eventId }
  );
  mirrorToServer({
    event_name: "InitiateCheckout",
    event_id: eventId,
    value: data.value,
    currency: "USD",
    num_items: data.numItems,
    content_ids: data.contentIds,
  });
}

export function purchase(data: {
  value: number;
  orderId: string;
  eventId: string;
  numItems: number;
  contentIds: string[];
}): void {
  // eventId must match the CAPI event sent from the Stripe webhook for deduplication
  fbq(
    "track",
    "Purchase",
    {
      value: data.value,
      currency: "USD",
      num_items: data.numItems,
      content_ids: data.contentIds,
      content_type: "product",
      order_id: data.orderId,
    },
    { eventID: data.eventId }
  );
  // No server mirror here — Purchase CAPI is sent reliably from the Stripe webhook
}

export function search(query: string): void {
  const eventId = crypto.randomUUID();
  fbq("track", "Search", { search_string: query }, { eventID: eventId });
  mirrorToServer({
    event_name: "Search",
    event_id: eventId,
    search_string: query,
  });
}
