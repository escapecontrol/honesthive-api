import { Email } from "../value-objects/email.vo";
import { FirstName } from "../value-objects/firstName.vo";
import { InviteSlug } from "../value-objects/inviteSlug.vo";
import { TeamName } from "../value-objects/teamName.vo";

export class Invitation {
  constructor(
    public readonly id: string,
    public email: Email,
    public slug: InviteSlug,
    public teamName: TeamName,
    public teamMemberName: FirstName,
    public teamOwner: string,
    public expiresAt: Date,
    public acceptedAt?: Date,
  ) {}
}
