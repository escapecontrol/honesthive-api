import { Schema, Document } from 'mongoose';
import { PeerDocument } from './peer.schema';

export const FeedbackSchema = new Schema({
  fromMemberId: { type: Schema.Types.ObjectId, ref: 'Peer', required: true },
  toMemberId: { type: Schema.Types.ObjectId, ref: 'Peer', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface FeedbackDocument extends Document {
  id: string;
  fromMemberId: PeerDocument;
  toMemberId: PeerDocument;
  message: string;
  createdAt: Date;
}
