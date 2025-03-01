import { Injectable , Logger} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OutboxRepository } from '../repositories/outbox.repository';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  constructor(
    private readonly outboxRepository: OutboxRepository,
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
            // Handle the feedback given event
            this.logger.log('Processing feedback given event:', message.payload);
            break;

          case 'invitation.accepted':
            // Handle the invitation accepted event
            this.logger.log('Processing invitation accepted event:', message.payload);
            // Add your processing logic here
            break;
          // Add more cases for other event types
        }

        // Mark the message as processed
        message.processed = true;
        await this.outboxRepository.saveAsync(message);
      } catch (error) {
        this.logger.error('Failed to process outbox message:', error);
      }
    }
  }
}