import { LastName } from './../../domain/value-objects/lastName.vo';
import { FirstName } from './../../domain/value-objects/firstName.vo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeedbackDocument } from '../schemas/feedback.schema';
import { Feedback } from '../../domain/entities/feedback.entity';
import { Message } from '../../domain/value-objects/message.vo';
import { Peer } from '../../domain/entities/peer.entity';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectModel('Feedback')
    private readonly feedbackModel: Model<FeedbackDocument>,
  ) {}

  async saveAsync(feedback: Feedback): Promise<Feedback> {
    const createdEntity = await this.feedbackModel.create({
      message: feedback.message.getMessage(),
      fromMemberId: feedback.FromMember.id,
      toMemberId: feedback.ToMember.id,
      classificationResult: feedback.classificationResult ? {
        category: feedback.classificationResult.category,
        confidenceScore: feedback.classificationResult.confidenceScore,
      } : undefined,
      createdAt: new Date(),
    });

    // Populate the fromMember and toMember fields
    const populatedEntity = await this.feedbackModel
      .findById(createdEntity._id)
      .populate('fromMemberId')
      .populate('toMemberId')
      .exec();

    return new Feedback(
      populatedEntity.id,
      new Peer(
        populatedEntity.fromMemberId.id,
        new FirstName(populatedEntity.fromMemberId.firstName),
        new LastName(populatedEntity.fromMemberId.lastName),
        new Email(populatedEntity.fromMemberId.email),
        populatedEntity.fromMemberId.authProviderSub,
      ),
      new Peer(
        populatedEntity.toMemberId.id,
        new FirstName(populatedEntity.toMemberId.firstName),
        new LastName(populatedEntity.toMemberId.lastName),
        new Email(populatedEntity.toMemberId.email),
        populatedEntity.toMemberId.authProviderSub,
      ),
      new Message(populatedEntity.message),
      populatedEntity.createdAt,
      populatedEntity.classificationResult ? {
        category: populatedEntity.classificationResult.category,
        confidenceScore: populatedEntity.classificationResult.confidenceScore,
      } : undefined,
    );
  }

  /**
   * Finds a feedback message by its ID.
   *
   * @param id - The ID of the feedback message to find.
   * @returns A promise that resolves with the found feedback message, or null if not found.
   */
  async findByIdAsync(id: string): Promise<Feedback | null> {
    const populatedEntity = await this.feedbackModel
      .findById(id)
      .populate('fromMemberId')
      .populate('toMemberId')
      .exec();

    if (!populatedEntity) {
      return null;
    }

    return new Feedback(
      populatedEntity.id,
      new Peer(
        populatedEntity.fromMemberId.id,
        new FirstName(populatedEntity.fromMemberId.firstName),
        new LastName(populatedEntity.fromMemberId.lastName),
        new Email(populatedEntity.fromMemberId.email),
        populatedEntity.fromMemberId.authProviderSub,
      ),
      new Peer(
        populatedEntity.toMemberId.id,
        new FirstName(populatedEntity.toMemberId.firstName),
        new LastName(populatedEntity.toMemberId.lastName),
        new Email(populatedEntity.toMemberId.email),
        populatedEntity.toMemberId.authProviderSub,
      ),
      new Message(populatedEntity.message),
      populatedEntity.createdAt,
      populatedEntity.classificationResult ? {
        category: populatedEntity.classificationResult.category,
        confidenceScore: populatedEntity.classificationResult.confidenceScore,
      } : undefined,
    );
  }
}
