import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxDocument } from '../schemas/outbox.schema';
import { Outbox } from '../../domain/entities/outbox.entity';

@Injectable()
export class OutboxRepository {
  constructor(
    @InjectModel('Outbox') private readonly outboxModel: Model<OutboxDocument>,
  ) {}

  /**
   * Saves an outbox message to the database.
   *
   * @param outbox - The outbox message to save.
   * @returns A promise that resolves with the saved outbox message.
   */
  async saveAsync(outbox: Outbox): Promise<Outbox> {
    return await this.outboxModel.create(outbox);
  }

  /**
   * Finds all unprocessed outbox messages.
   *
   * @returns A promise that resolves with an array of unprocessed outbox messages.
   */
  async findUnprocessedAsync(): Promise<Outbox[]> {
    return await this.outboxModel.find({ processed: false }).exec();
  }

  /**
   * Finds an outbox message by its ID.
   *
   * @param id - The ID of the outbox message to find.
   * @returns A promise that resolves with the found outbox message, or null if not found.
   */
  async findByIdAsync(id: string): Promise<Outbox | null> {
    return await this.outboxModel.findById(id).exec();
  }
}
