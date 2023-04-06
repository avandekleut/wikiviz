export class HttpError extends Error {
  public readonly context: unknown | undefined

  constructor(
    public readonly status: number,
    message?: string,
    context?: unknown,
  ) {
    super(message)
    this.context = context
  }
}
