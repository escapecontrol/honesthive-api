import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Feedback } from '../../domain/entities/feedback.entity';
import { FeedbackRepository } from '../../infrastructure/repositories/feedback.repository';
import { Message } from '../../domain/value-objects/message.vo';
import { FeedbackGivenEvent } from 'src/shared/domain/events/feedback/feedback-given.event';
import { OutboxRepository } from '../../infrastructure/repositories/outbox.repository';
import { Outbox } from '../../domain/entities/outbox.entity';
import { EdenAIService } from '../../infrastructure/services/edenAI.service';
import { TeamRepository } from '../../infrastructure/repositories/team.repository';
import { TeamTypeRepository } from '../../infrastructure/repositories/teamType.repository';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly teamRepository: TeamRepository,
    private readonly teamTypeRepository: TeamTypeRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly edenAIService: EdenAIService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Gives feedback from one peer to another.
   *
   * @param authProviderSub - The authentication provider's subject identifier for the peer giving feedback.
   * @param toMemberId - The ID of the member receiving the feedback.
   * @param message - The feedback message.
   * @returns A promise that resolves with the saved feedback.
   * @throws NotFoundException if the peer or the member receiving feedback is not found.
   */
  async giveFeedbackAsync(
    authProviderSub: string,
    toMemberId: string,
    message: string,
  ): Promise<Feedback> {
    const peer = await this.peerRepository.getByAuthProviderSub(authProviderSub);

    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    const toMember = await this.peerRepository.findByIdAsync(toMemberId);

    if (!toMember) {
      throw new NotFoundException('To member was not found.');
    }

    // This is a big assumption right now, we need to handle this better
    // This is assuming that the peer is giving feedback to a member of their own team
    // or the peer is giving feedback to a member of a team that they are invited to
    const team = peer.ownTeam ?? toMember.ownTeam;

    const feedback = new Feedback('', peer, toMember, new Message(message), new Date());
    const savedFeedback = await this.feedbackRepository.saveAsync(feedback);

    const feedbackEventType = 'feedback.given';
    const feedbackEvent = new FeedbackGivenEvent(
      savedFeedback.id,
      team.id,
      peer.id,
      toMember.id,
      message,
      savedFeedback.createdAt,
    );

    await this.outboxRepository.saveAsync(new Outbox(
      '',
      feedbackEventType,
      feedbackEvent,
      new Date(),
      false,
    ));

    this.eventEmitter.emit(
      feedbackEventType,
      feedbackEvent,
    );

    return savedFeedback;
  }

  /**
   * Classifies a feedback message using the EdenAI service.
   *
   * @param teamId - The ID of the team associated with the feedback.
   * @param feedbackId - The ID of the feedback message to classify.
   * @param message - The feedback message to classify.
   * @returns A promise that resolves when the classification is complete.
   */
  async classifyFeedbackAsync(
    teamId: string,
    feedbackId: string,
    message: string
  ): Promise<void> {
    this.logger.log("Handling feedback classification");

    const [team, feedback] = await Promise.all([
      this.teamRepository.findByIdAsync(teamId),
      this.feedbackRepository.findByIdAsync(feedbackId),
    ]);

    const teamType = await this.teamTypeRepository.getTeamTypeByNameAsync(team.type.getValue());
    const categories = teamType.growthCategories.map((category) => category.name);

    if (teamType && categories.length > 0) {
      const classification = await this.edenAIService.classifyMessageAsync(message, categories);
      this.logger.debug(`Classification result: ${JSON.stringify(classification)}`);

      feedback.classify(classification.category, classification.confidenceScore);
      await this.feedbackRepository.saveAsync(feedback);
    }

    this.logger.log("Finished handling feedback classification");
  }
}
