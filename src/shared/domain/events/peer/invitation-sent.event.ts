export class InvitationSentEvent {
  constructor(
    public readonly peerId: string,
    public readonly invitationId: string,
    public readonly teamName: string,
    public readonly email: string,
    public readonly slug: string,
    public readonly expiresAt: Date,
  ) {}
}
