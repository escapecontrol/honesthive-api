import { Schema, Document } from 'mongoose';
import { PeerDocument } from './peer.schema';
import { InvitationDocument } from './invitation.schema';

export const TeamSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'Peer' },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Peer',
    },
  ],
  pendingMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Invitation',
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export interface TeamDocument extends Document {
  id: string;
  name: string;
  type: string;
  owner: PeerDocument;
  members: PeerDocument[];
  pendingMembers: InvitationDocument[];
  createdAt: Date;
}
