import { NextRequest, NextResponse } from "next/server";
import { isProUser } from "@/lib/pro";
import { getCustomerIdFromCookie } from "@/lib/session";
import { getUserLinks, saveUserLinks } from "@/lib/store";

function isValidUrl(value: string): boolean {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const customerId = await getCustomerIdFromCookie();
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const pro = await isProUser();
  if (!pro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const user = await getUserLinks(customerId);
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const customerId = await getCustomerIdFromCookie();
  if (!customerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const pro = await isProUser();
  if (!pro) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const body = await req.json();
  const podcastUrl = (body.podcastUrl ?? "").trim();

  if (!isValidUrl(podcastUrl)) {
    return NextResponse.json(
      { error: "Please enter a valid http(s) podcast URL" },
      { status: 400 }
    );
  }

  const existing = await getUserLinks(customerId);
  const saved = await saveUserLinks({
    customerId,
    email: existing?.email ?? "",
    podcastUrl,
    websiteUrl: existing?.websiteUrl ?? "",
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json(saved);
}
