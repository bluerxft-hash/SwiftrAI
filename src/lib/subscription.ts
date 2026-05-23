import { getStripe } from "./stripe";

export async function hasActiveSubscription(
  customerId: string
): Promise<boolean> {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  return subscriptions.data.length > 0;
}

export async function getCustomerFromSession(
  sessionId: string
): Promise<{ customerId: string; email: string } | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer"],
  });

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!customerId) return null;

  const email =
    session.customer_details?.email ??
    (typeof session.customer === "object" && session.customer !== null
      ? ("email" in session.customer
          ? (session.customer.email as string | null)
          : null)
      : null) ??
    "";

  return { customerId, email };
}
