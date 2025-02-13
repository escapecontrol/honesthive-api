export class TeamFeedback {
  constructor(
    public readonly id: string,
    public readonly Team: TeamFeedbackTeam,
    public readonly FromMember: TeamFeedbackMember,
    public readonly ToMember: TeamFeedbackMember,
    public readonly Message: string,
    public readonly CreatedAt: Date,
  ) {}
}

export class TeamFeedbackTeam {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
  ) {}
}

export class TeamFeedbackMember {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}
}