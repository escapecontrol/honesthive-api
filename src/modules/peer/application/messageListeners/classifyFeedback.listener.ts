import { OutboxRepository } from './../../infrastructure/repositories/outbox.repository';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClassifyFeedbackMessage } from 'src/shared/infrastructure/messages/classify-feedback.message';
import { FeedbackService } from '../services/feedback.service';

@Injectable()
export class ClassifyFeedbackListener {
  private readonly logger = new Logger(ClassifyFeedbackListener.name);

  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly outboxRepository: OutboxRepository
  ) {}

  @OnEvent('classify.feedback.message')
  async handleClassifyFeedback(message: ClassifyFeedbackMessage) {
    this.logger.log(`Handling classify feedback.`);

    try {
      const outboxMessage = await this.outboxRepository.findByIdAsync(message.outboxId);

      await this.feedbackService.classifyFeedbackAsync(
        outboxMessage.payload.teamId,
        outboxMessage.payload.message,
      );

      outboxMessage.processed = true;
      await this.outboxRepository.saveAsync(outboxMessage);

    } catch (error) {
      this.logger.error('Failed to classify feedback:', error);
    }
  }
}