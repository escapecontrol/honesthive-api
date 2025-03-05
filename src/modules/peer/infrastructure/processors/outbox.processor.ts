import { Injectable , Logger} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxRepository } from '../repositories/outbox.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClassifyFeedbackMessage } from 'src/shared/infrastructure/messages/classify-feedback.message';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processOutbox() {
    this.logger.log('OutboxProcessor is checking outbox messages...');
    const unprocessedMessages = await this.outboxRepository.findUnprocessedAsync();

    for (const message of unprocessedMessages) {
      try {
        // Process the message based on its event type
        switch (message.eventType) {
          case 'feedback.given':
            const classifyFeedbackMessageUri = "classify.feedback.message";
            const classifyFeedbackMessage = new ClassifyFeedbackMessage(
              message.id,
            );

            this.eventEmitter.emit(
              classifyFeedbackMessageUri,
              classifyFeedbackMessage,
            );
            break;

          case 'invitation.accepted':
            // Handle the invitation accepted event
            this.logger.log('Processing invitation accepted event:', message.payload);
            // Add your processing logic here
            break;
          // Add more cases for other event types
        }
      } catch (error) {
        this.logger.error('Failed to process outbox message:', error);
      }
    }
  }
}