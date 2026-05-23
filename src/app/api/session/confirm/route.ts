import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/session";
import { getAppUrl } from "@/lib/stripe";
import { upsertCustomer } from "@/lib/store";
import { getCustomerFromSession } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  const appUrl = getAppUrl();

  if (!sessionId) {
    return NextResponse.redirect(new URL("/app", appUrl));
  }

  const customer = await getCustomerFromSession(sessionId);
  if (!customer) {
    return NextResponse.redirect(new URL("/app", appUrl));
  }

  await upsertCustomer(customer.customerId, customer.email);

  const response = NextResponse.redirect(
    new URL("/app/podcast?welcome=1", appUrl)
  );
  response.cookies.set(CUSTOMER_COOKIE, customer.customerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return response;
}
