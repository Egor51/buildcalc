import { NextResponse } from "next/server";

import { COUNTRY_COOKIE_NAME } from "@/lib/constants/storage";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body?.countryCode === "string" ? body.countryCode : undefined;
  if (!code) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COUNTRY_COOKIE_NAME,
    value: code.toUpperCase(),
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}


