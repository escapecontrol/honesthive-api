export class InvitationAcceptedEvent {
  constructor(
    public readonly accepteeId: string,
    public readonly invitationId: string,
    public readonly teamName: string,
    public readonly inviteeId: string,
    public readonly acceptedAt: Date,
  ) {}
}
