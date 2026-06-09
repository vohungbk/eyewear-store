import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "EYEWEAR <onboarding@resend.dev>";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface OrderItem {
  product_snapshot: { name: string; variant_name?: string; image_url?: string } | null;
  unit_price: number;
  quantity: number;
}

export interface OrderEmailData {
  id: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  order_items: OrderItem[];
}

function fmt(cents: number): string {
  return `$${cents.toFixed(2)}`;
}

function buildOrderItemsHtml(items: OrderItem[]): string {
  return items
    .map((item) => {
      const snap = item.product_snapshot;
      const name = snap?.name ?? "Product";
      const variant = snap?.variant_name ? ` — ${snap.variant_name}` : "";
      const img = snap?.image_url;

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${img ? `
                <td style="width:56px;vertical-align:top;padding-right:12px;">
                  <img src="${img}" alt="${name}" width="56" height="56"
                    style="border-radius:6px;object-fit:cover;display:block;" />
                </td>` : ""}
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#111;">${name}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#888;">${variant}Qty: ${item.quantity}</p>
                </td>
                <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#111;">
                    ${fmt(item.unit_price * item.quantity)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join("");
}

function buildHtml(order: OrderEmailData): string {
  const addr = order.shipping_address;
  const addressLines = [
    addr.line1,
    addr.line2,
    `${addr.city}, ${addr.state} ${addr.postal_code}`,
    addr.country,
  ]
    .filter(Boolean)
    .join("<br />");

  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const orderUrl = `${SITE_URL}/account/orders/${order.id}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f6f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="580"
          style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#000;padding:24px 32px;">
              <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.12em;color:#fff;">
                EYEWEAR
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:1px solid #f0f0f0;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">
                Order Confirmed! 🎉
              </p>
              <p style="margin:0;font-size:14px;color:#666;line-height:1.6;">
                Hi ${order.customer_name}, thanks for your purchase. We've received your order
                and will process it shortly.
              </p>
            </td>
          </tr>

          <!-- Order number -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-bottom:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.08em;">
                Order number
              </p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:700;font-family:monospace;color:#111;">
                #${orderNumber}
              </p>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;
                letter-spacing:0.08em;color:#888;">Items ordered</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${buildOrderItemsHtml(order.order_items)}
              </table>
            </td>
          </tr>

          <!-- Price breakdown -->
          <tr>
            <td style="padding:20px 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Subtotal</td>
                  <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">${fmt(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Shipping</td>
                  <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">
                    ${order.shipping === 0 ? "Free" : fmt(order.shipping)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Tax</td>
                  <td style="padding:4px 0;font-size:13px;color:#111;text-align:right;">${fmt(order.tax)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0 4px;font-size:15px;font-weight:700;color:#111;
                    border-top:2px solid #111;">Total</td>
                  <td style="padding:12px 0 4px;font-size:15px;font-weight:700;color:#111;
                    border-top:2px solid #111;text-align:right;">${fmt(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;
                letter-spacing:0.08em;color:#888;">Shipping to</p>
              <p style="margin:0;font-size:13px;color:#333;line-height:1.7;">
                <strong>${order.customer_name}</strong><br />
                ${addressLines}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px;">
              <a href="${orderUrl}"
                style="display:inline-block;background:#000;color:#fff;font-size:14px;
                  font-weight:600;padding:12px 28px;border-radius:6px;text-decoration:none;">
                View Order Status
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                You received this email because you placed an order at EYEWEAR.<br />
                If you have any questions, reply to this email and we'll help you out.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const orderNumber = order.id.slice(0, 8).toUpperCase();

  try {
    await resend.emails.send({
      from: FROM,
      to: order.customer_email,
      subject: `Order Confirmed — #${orderNumber}`,
      html: buildHtml(order),
    });
  } catch {
    // Email failure must never break the webhook response
  }
}
