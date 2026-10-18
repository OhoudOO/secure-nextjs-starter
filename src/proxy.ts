import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { buildCsp, createNonce } from "@/lib/security/csp";

const PROTECTED = ["/dashboard"];

// Runs before every page: adds a nonce-based CSP, and sends signed-out users away from
// protected pages. API routes still check the session themselves (see api/notes).
export default auth((request: NextRequest & { auth: unknown }) => {
  const isProtected = PROTECTED.some((path) => request.nextUrl.pathname.startsWith(path));
  if (isProtected && !request.auth) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }
  const nonce = createNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: [{ source: "/((?!api|_next/static|_next/image|favicon.ico).*)" }],
};
