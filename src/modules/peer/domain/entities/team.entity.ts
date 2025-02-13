import { TeamName } from '../value-objects/teamName.vo';
import { TeamType } from '../value-objects/teamType.vo';
import { Peer } from './peer.entity';
import { Invitation } from './invitation.entity';

export class Team {
  constructor(
    public readonly id: string,
    public name: TeamName,
    public type: TeamType,
    public owner: Peer,
    public members: Peer[] = [],
    public pendingMembers: Invitation[] = [],
  ) {}

  /*
    * Adds a member to the team.
    *
    * @param peer - The peer to add.
    */
  addMember(peer: Peer) {
    this.members.push(peer);
  }

  /*
    * Removes a pending member invitation from the team.
    *
    * @param invitationId - The invitation ID.
    */
  removePendingMemberInvitation(invitationId: string) {
    const index = this.pendingMembers.findIndex(
      (invitation) => invitation.id === invitationId,
    );
    if (index === -1) {
      throw new Error('The invitation was not found.');
    }
    this.pendingMembers.splice(index, 1);
  }
}
