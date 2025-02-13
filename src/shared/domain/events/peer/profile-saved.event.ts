export class ProfileSavedEvent {
  constructor(
    public readonly peerId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly profileUrl: string,
  ) {}
}
