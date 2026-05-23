/**
 * One-time helper: creates Swiftr AI Pro product + $5/month price.
 * Run: node scripts/create-stripe-price.mjs
 * Requires STRIPE_SECRET_KEY in .env.local
 */
import Stripe from "stripe";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY in .env.local first.");
  process.exit(1);
}

const stripe = new Stripe(key);

const product = await stripe.products.create({
  name: "Swiftr AI Pro",
  description: "YouTube to notes + podcast link & generator",
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 500,
  currency: "usd",
  recurring: { interval: "month" },
});

console.log("\n✅ Created Stripe product and price\n");
console.log(`STRIPE_PRICE_ID=${price.id}`);
console.log("\nAdd the line above to your .env.local file.\n");
