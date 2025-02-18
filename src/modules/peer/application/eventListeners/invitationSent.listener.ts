import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { InvitationSentEvent } from 'src/shared/domain/events/peer/invitation-sent.event';
import { TeamRepository } from '../../infrastructure/repositories/team.repository';
import { InvitationAcceptedEvent } from 'src/shared/domain/events/peer/invitation-accepted.event';
import { TeamName } from '../../domain/value-objects/teamName.vo';

@Injectable()
export class InvitationSentListener {
  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly teamRepository: TeamRepository,
  ) {}

  /**
   * Handles the 'invitation.sent' event.
   * Assigns a pending invitation member to the team.
   *
   * @param event - The InvitationSentEvent containing the peerId, teamName, and invitationId.
   */
  @OnEvent('invitation.sent')
  async handleAssignPendingInvitation(event: InvitationSentEvent) {
    console.log("Assigning pending invitation member to team.", event.peerId, event.teamName);
    const peer = await this.peerRepository.findByIdAsync(event.peerId);

    // Check if peer exists
    if (!peer) {
      throw new Error('Peer not found');
    }

    await this.teamRepository.addPendingMemberAsync(peer.ownTeam.id, event.invitationId);
  }

  /**
   * Handles the 'invitation.accepted' event.
   * Removes the pending invitation member from the team.
   * Adds the peer to the team.
   *
   * @param event - The InvitationAcceptedEvent containing the peerId, teamName, and invitationId.
   */
  @OnEvent('invitation.accepted')
  async handleInvitedMember(event: InvitationAcceptedEvent) {
    console.log("Adding invited member to team and vice-versa.", event.accepteeId, event.teamName);
    const team = await this.teamRepository.findByNameAsync(event.teamName);
    const peer = await this.peerRepository.findByIdAsync(event.accepteeId);

    // Check if peer exists
    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    // Remove pending member from team
    team.removePendingMemberInvitation(event.invitationId);

    // Add peer to team
    team.addMember(peer);
    
    await this.teamRepository.saveAsync(team);

    // Assign team to peer's invited teams
    peer.addInvitedTeam(team);

    await this.peerRepository.saveAsync(peer);
  }
}