import { Schema, Document } from 'mongoose';
import { PeerDocument } from './peer.schema';

/**
 * Schema for classification result.
 * Represents the result of classifying a feedback message.
 */
const ClassificationResultSchema = new Schema({
  category: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
}, { _id: false });

/**
 * Schema for feedback.
 * Represents a feedback message exchanged between peers.
 */
export const FeedbackSchema = new Schema({
  fromMemberId: { type: Schema.Types.ObjectId, ref: 'Peer', required: true },
  toMemberId: { type: Schema.Types.ObjectId, ref: 'Peer', required: true },
  message: { type: String, required: true },
  classificationResult: { type: ClassificationResultSchema, required: false },
  createdAt: { type: Date, default: Date.now },
});

/**
 * Interface for feedback document.
 * Represents a feedback document stored in the database.
 */
export interface FeedbackDocument extends Document {
  id: string;
  fromMemberId: PeerDocument;
  toMemberId: PeerDocument;
  message: string;
  classificationResult?: {
    category: string;
    confidenceScore: number;
  };
  createdAt: Date;
}
