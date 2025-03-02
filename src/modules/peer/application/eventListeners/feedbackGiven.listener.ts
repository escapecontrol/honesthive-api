import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FeedbackGivenEvent } from 'src/shared/domain/events/feedback/feedback-given.event';
import { TeamFeedbackRepository } from '../../infrastructure/repositories/teamFeedback.repository';
import { TeamFeedback, TeamFeedbackMember, TeamFeedbackTeam } from '../../domain/projections/teamFeedback.projection';
import { TeamRepository } from '../../infrastructure/repositories/team.repository';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';

@Injectable()
export class FeedbackGivenListener {
  private readonly logger = new Logger(FeedbackGivenListener.name);
  constructor(
    private readonly teamFeedbackRepository: TeamFeedbackRepository,
    private readonly teamRepository: TeamRepository,
    private readonly peerRepository: PeerRepository,
  ) {}

  @OnEvent('feedback.given')
  async handleTeamFeedback(event: FeedbackGivenEvent) {
    const team = await this.teamRepository.findByIdAsync(event.teamId);

    this.logger.log("Handle team feedback: assign feedback to team - ", team.name);

    const fromMember = await this.peerRepository.findByIdAsync(event.fromMemberId);
    const toMember = await this.peerRepository.findByIdAsync(event.toMemberId);

    await this.teamFeedbackRepository.saveAsync(
      new TeamFeedback(
        '',
        new TeamFeedbackTeam(
          team.id,
          team.name.getTeamName(),
          team.type.getValue(),
        ),
        new TeamFeedbackMember(
          fromMember.id,
          fromMember.firstName.getFirstName(),
          fromMember.lastName.getLastName(),
        ),
        new TeamFeedbackMember(
          toMember.id,
          toMember.firstName.getFirstName(),
          toMember.lastName.getLastName(),
        ),
        event.message,
        event.createdAt,
      )
    );
  }
}