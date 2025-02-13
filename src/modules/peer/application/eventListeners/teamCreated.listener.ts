import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TeamCreatedEvent } from 'src/shared/domain/events/peer/team-created.event';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';

@Injectable()
export class TeamCreatedListener {
  constructor(private readonly peerRepository: PeerRepository) {}

  @OnEvent('team.created')
  async handleAssignOwnTeam(event: TeamCreatedEvent) {
    console.log("Assigning owned team to peer", event.peerId, event.teamId);
    await this.peerRepository.assignOwnTeamAsync(event.peerId, event.teamId);
  }
}