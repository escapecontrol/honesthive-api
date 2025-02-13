import { Email } from '../value-objects/email.vo';
import { FirstName } from '../value-objects/firstName.vo';
import { LastName } from '../value-objects/lastName.vo';
import { ProfileUrl } from '../value-objects/profileUrl.vo';
import { Team } from './team.entity';

export class Peer {
  constructor(
    public readonly id: string = '',
    public firstName: FirstName,
    public lastName: LastName,
    public email: Email,
    public authProviderSub: string,
    public profileUrl?: ProfileUrl,
    public ownTeam?: Team,
    public invitedTeams: Team[] = [],
  ) {}

  addInvitedTeam(team: Team) {
    this.invitedTeams.push(team);
  }
}
