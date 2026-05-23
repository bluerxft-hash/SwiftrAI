import { NextResponse } from "next/server";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { getCustomerIdFromCookie } from "@/lib/session";

export async function POST() {
  const customerId = await getCustomerIdFromCookie();
  if (!customerId) {
    return NextResponse.redirect(new URL("/dashboard", getAppUrl()));
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppUrl()}/dashboard`,
    });
    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error("Billing portal error:", err);
    return NextResponse.redirect(new URL("/dashboard", getAppUrl()));
  }
}
