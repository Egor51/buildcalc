import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const parseAllowedHosts = () =>
  (process.env.ALLOWED_HOSTS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const matchesHost = (hostname: string, rule: string) => {
  if (rule === "*") return true;

  if (rule.startsWith("*.")) {
    const suffix = rule.slice(2);
    return hostname === suffix || hostname.endsWith(`.${suffix}`);
  }

  if (rule.startsWith(".")) {
    const suffix = rule.slice(1);
    return hostname === suffix || hostname.endsWith(`.${suffix}`);
  }

  return hostname === rule;
};

export function middleware(request: NextRequest) {
  const allowedHosts = parseAllowedHosts();
  if (allowedHosts.length === 0) {
    return NextResponse.next();
  }

  const hostname = request.nextUrl.hostname.toLowerCase();
  const isAllowed = allowedHosts.some((rule) => matchesHost(hostname, rule));
  if (isAllowed) {
    return NextResponse.next();
  }

  return new NextResponse("Host not permitted", { status: 403 });
}

export const config = {
  matcher: "/:path*",
};

