// Demo data access layer. Replace with the client's database; keep the ownership check in callers.
export interface Note {
  id: string;
  ownerId: string;
  body: string;
}

const notes = new Map<string, Note>([
  ["1", { id: "1", ownerId: "demo-user", body: "First note" }],
]);

export async function findNote(id: string): Promise<Note | undefined> {
  return notes.get(id);
}
