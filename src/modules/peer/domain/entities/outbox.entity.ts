export class Outbox {
  constructor(
    public readonly id: string,
    public eventType: string,
    public payload: any,
    public createdAt: Date,
    public processed: boolean,
  ) {}
}
