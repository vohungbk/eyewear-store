import crypto from "crypto";

function hash(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function hashPhone(phone: string): string {
  return hash(phone.replace(/\D/g, ""));
}

export interface CAPIUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

export interface CAPICustomData {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  searchString?: string;
  orderId?: string;
}

export interface SendCAPIEventParams {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: CAPIUserData;
  customData?: CAPICustomData;
}

export async function sendCAPIEvent(params: SendCAPIEventParams): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const token = process.env.FACEBOOK_CONVERSION_API_TOKEN;
  if (!pixelId || !token) return;

  const { eventName, eventId, eventSourceUrl, userData = {}, customData = {} } = params;

  const hashedUserData: Record<string, unknown> = {};
  if (userData.email) hashedUserData.em = hash(userData.email);
  if (userData.phone) hashedUserData.ph = hashPhone(userData.phone);
  if (userData.firstName) hashedUserData.fn = hash(userData.firstName);
  if (userData.lastName) hashedUserData.ln = hash(userData.lastName);
  if (userData.city) hashedUserData.ct = hash(userData.city);
  if (userData.state) hashedUserData.st = hash(userData.state);
  if (userData.zip) hashedUserData.zp = hash(userData.zip);
  if (userData.country) hashedUserData.country = hash(userData.country);
  // fbp and fbc are sent unmodified per Meta spec
  if (userData.fbp) hashedUserData.fbp = userData.fbp;
  if (userData.fbc) hashedUserData.fbc = userData.fbc;
  if (userData.clientIpAddress) hashedUserData.client_ip_address = userData.clientIpAddress;
  if (userData.clientUserAgent) hashedUserData.client_user_agent = userData.clientUserAgent;

  const cd: Record<string, unknown> = {};
  if (customData.value !== undefined) cd.value = customData.value;
  if (customData.currency) cd.currency = customData.currency;
  if (customData.contentName) cd.content_name = customData.contentName;
  if (customData.contentCategory) cd.content_category = customData.contentCategory;
  if (customData.contentIds?.length) cd.content_ids = customData.contentIds;
  if (customData.contentType) cd.content_type = customData.contentType;
  if (customData.numItems !== undefined) cd.num_items = customData.numItems;
  if (customData.searchString) cd.search_string = customData.searchString;
  if (customData.orderId) cd.order_id = customData.orderId;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: hashedUserData,
        ...(Object.keys(cd).length > 0 && { custom_data: cd }),
      },
    ],
  };

  if (process.env.FACEBOOK_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.FACEBOOK_TEST_EVENT_CODE;
  }

  try {
    await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  } catch {
    // Tracking failures must never break the purchase flow
  }
}
