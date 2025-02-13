import { Schema, Document } from 'mongoose';
import { PeerDocument } from './peer.schema';
import { TeamDocument } from './team.schema';

export const TeamFeedbackSchema = new Schema({
  team: { type: Schema.Types.ObjectId, ref: 'Team', index: true },
  fromMember: { type: Schema.Types.ObjectId, ref: 'Peer' },
  toMember: { type: Schema.Types.ObjectId, ref: 'Peer' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface TeamFeedbackDocument extends Document {
  id: string;
  team: TeamDocument;
  fromMember: PeerDocument;
  toMember: PeerDocument;
  message: string;
  createdAt: Date;
}
