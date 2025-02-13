import { Injectable, NotFoundException } from '@nestjs/common';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { TeamRepository } from '../../infrastructure/repositories/team.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeamCreatedEvent } from 'src/shared/domain/events/peer/team-created.event';
import { Team } from '../../domain/entities/team.entity';
import { TeamName } from '../../domain/value-objects/teamName.vo';
import { TeamType } from '../../domain/value-objects/teamType.vo';
import { Peer } from '../../domain/entities/peer.entity';

@Injectable()
export class TeamService {
  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new team for a peer.
   * If the peer with the given authProviderSub is found, a new team is created and assigned to the peer.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @param teamName - The name of the team.
   * @param teamType - The type of the team.
   * @returns void
   */
  async createTeamAsync(
    authProviderSub: string,
    teamName: string,
    teamType: string,
  ): Promise<void> {
    const peer =
      await this.peerRepository.getByAuthProviderSub(authProviderSub);

    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    const team = await this.teamRepository.saveAsync(
      new Team(
        '',
        new TeamName(teamName),
        new TeamType(teamType),
        new Peer(peer.id,
          peer.firstName,
          peer.lastName,
          peer.email,
          peer.authProviderSub,
          peer.profileUrl,),
      ),
    );

    this.eventEmitter.emit(
      'team.created',
      new TeamCreatedEvent(
        peer.id,
        team.id,
        team.name.getTeamName(),
        team.type.getTeamType(),
      ),
    );
  }

  /**
   * Retrieves the team owned by the linked peer's auth sub.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @returns The team entity owned by the peer.
   */
  async getMyTeamAsync(authProviderSub: string): Promise<Team | null> {
    return this.teamRepository.getTeamByAuthProviderSub(authProviderSub);
  }

  /**
   * Retrieves the collection of teams owned by or invited to the linked peer's auth sub.
   *
   * @param authProviderSub - The auth provider's sub identifier.
   * @returns The collection of team entities.
   */
  async getMyTeamsAsync(authProviderSub: string): Promise<Team[]> {
    const ownTeam = await this.teamRepository.getTeamByAuthProviderSub(authProviderSub);
    const invitedTeams = await this.teamRepository.getInvitedTeamsByAuthProviderSub(authProviderSub);

    const teams: Team[] = [];
    if (ownTeam) {
      teams.push(ownTeam);
    }
    if (invitedTeams && invitedTeams.length > 0) {
      teams.push(...invitedTeams);
    }

    return teams;
  }
}
