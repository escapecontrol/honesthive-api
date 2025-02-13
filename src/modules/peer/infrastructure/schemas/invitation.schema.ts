import { Schema, Document } from 'mongoose';
import { PeerDocument } from './peer.schema';

export const InvitationSchema = new Schema({
  email: { type: String, required: true },
  slug: { type: String, required: true },
  teamName: { type: String, required: true },
  teamMemberName: { type: String, required: true },
  teamOwner: {
    type: Schema.Types.ObjectId,
    ref: 'Peer',
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date },
});

export interface InvitationDocument extends Document {
  id: string;
  email: string;
  slug: string;
  teamName: string;
  teamMemberName: string;
  teamOwner: PeerDocument;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}
