// Ownership check for every record read or changed through an id from the request.
// Missing records and other users' records return the same error, so ids cannot be probed (IDOR).
export class NotFoundOrForbidden extends Error {
  constructor() {
    super("Not found");
  }
}

export function assertOwner<T extends { ownerId: string }>(record: T | undefined, userId: string): T {
  if (!record || record.ownerId !== userId) throw new NotFoundOrForbidden();
  return record;
}
