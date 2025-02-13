export class TeamCreatedEvent {
  constructor(
    public readonly peerId: string,
    public readonly teamId: string,
    public readonly teamName: string,
    public readonly teamType: string,
  ) {}
}
