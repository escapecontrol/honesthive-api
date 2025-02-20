import { MemberDTO } from "./member";

export class TeamDTO {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly members: MemberDTO[],
    public readonly pendingMembers: MemberDTO[],
  ) {}
}