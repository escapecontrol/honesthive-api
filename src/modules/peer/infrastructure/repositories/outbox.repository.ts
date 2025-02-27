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

  async saveAsync(outbox: Outbox): Promise<Outbox> {
    return await this.outboxModel.create(outbox);
  }

  async findUnprocessedAsync(): Promise<Outbox[]> {
    return await this.outboxModel.find({ processed: false }).exec();
  }
}
