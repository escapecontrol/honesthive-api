import { Injectable, NotFoundException } from '@nestjs/common';
import { PeerRepository } from '../../infrastructure/repositories/peer.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Feedback } from '../../domain/entities/feedback.entity';
import { FeedbackRepository } from '../../infrastructure/repositories/feedback.repository';
import { Message } from '../../domain/value-objects/message.vo';
import { FeedbackGivenEvent } from 'src/shared/domain/events/feedback/feedback-given.event';
import { OutboxRepository } from '../../infrastructure/repositories/outbox.repository';
import { Outbox } from '../../domain/entities/outbox.entity';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly peerRepository: PeerRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async giveFeedbackAsync(
    authProviderSub: string,
    toMemberId: string,
    message: string,
  ): Promise<Feedback> {
    const peer =
      await this.peerRepository.getByAuthProviderSub(authProviderSub);

    if (!peer) {
      throw new NotFoundException('Peer was not found.');
    }

    const toMember = await this.peerRepository.findByIdAsync(toMemberId);

    if (!toMember) {
      throw new NotFoundException('To member was not found.');
    }

    // this is a big assumption right now, we need to handle this better
    // this is assuming that the peer is giving feedback to a member of their own team
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
}
