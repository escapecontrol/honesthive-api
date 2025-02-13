export class FeedbackGivenEvent {
  constructor(
    public readonly feedbackId: string,
    public readonly teamId: string,
    public readonly fromMemberId: string,
    public readonly toMemberId: string,
    public readonly message: string,
    public readonly createdAt: Date,
  ) {}
}