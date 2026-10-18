import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOwner } from "@/lib/authz";
import { errorResponse } from "@/lib/errors";
import { findNote } from "@/lib/notes/repository";

// API routes are not covered by the proxy: each one checks the session and record ownership itself.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const { id } = await context.params;
    const note = assertOwner(await findNote(id), userId);
    return NextResponse.json({ id: note.id, body: note.body });
  } catch (error) {
    return errorResponse(error);
  }
}
