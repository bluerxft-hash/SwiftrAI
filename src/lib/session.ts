import { cookies } from "next/headers";

export const CUSTOMER_COOKIE = "swiftr_customer_id";

export async function getCustomerIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_COOKIE)?.value ?? null;
}
