import { getCustomerIdFromCookie } from "./session";
import { hasActiveSubscription } from "./subscription";

export async function isProUser(): Promise<boolean> {
  try {
    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes("your_key_here")) {
      return false;
    }

    const customerId = await getCustomerIdFromCookie();
    if (!customerId) return false;
    return hasActiveSubscription(customerId);
  } catch {
    // Stripe not configured or other error - default to free tier
    return false;
  }
}
