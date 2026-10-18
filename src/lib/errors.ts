import { NextResponse } from "next/server";
import { NotFoundOrForbidden } from "./authz";

// Users get a short, generic message; details stay in the server log, without request bodies.
export function errorResponse(error: unknown): NextResponse {
  if (error instanceof NotFoundOrForbidden) return NextResponse.json({ error: "Not found" }, { status: 404 });
  console.error("Unhandled error:", error instanceof Error ? error.message : "unknown");
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
