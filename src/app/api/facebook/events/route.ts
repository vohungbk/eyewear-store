import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendCAPIEvent } from "@/lib/facebook/capi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      event_name,
      event_id,
      fbp,
      fbc,
      content_ids,
      content_name,
      value,
      currency,
      num_items,
      search_string,
    } = body as Record<string, unknown>;

    if (!event_name || !event_id) {
      return NextResponse.json({ error: "Missing event_name or event_id" }, { status: 400 });
    }

    const headersList = await headers();
    const referer = headersList.get("referer") ?? undefined;
    const userAgent = headersList.get("user-agent") ?? undefined;
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined;

    await sendCAPIEvent({
      eventName: event_name as string,
      eventId: event_id as string,
      eventSourceUrl: referer,
      userData: {
        fbp: fbp as string | undefined,
        fbc: fbc as string | undefined,
        clientIpAddress: ip,
        clientUserAgent: userAgent,
      },
      customData: {
        contentIds: content_ids as string[] | undefined,
        contentName: content_name as string | undefined,
        value: value as number | undefined,
        currency: (currency as string | undefined) ?? "USD",
        numItems: num_items as number | undefined,
        searchString: search_string as string | undefined,
        contentType: "product",
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to process event" }, { status: 500 });
  }
}
