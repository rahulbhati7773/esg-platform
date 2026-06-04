export class EntryServiceError extends Error {
  readonly code: "NOT_FOUND" | "LOCKED" | "INVALID_STATUS_TRANSITION";

  constructor(
    code: EntryServiceError["code"],
    message: string,
  ) {
    super(message);
    this.name = "EntryServiceError";
    this.code = code;
  }
}
