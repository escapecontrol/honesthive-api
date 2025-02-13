import { Schema, Document } from 'mongoose';
import { TeamDocument } from './team.schema';

export const PeerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profileUrl: { type: String, required: false },
  authProviderSub: { type: String, required: true, index: true }, // New field for auth provider's sub identifier
  ownTeam: { type: Schema.Types.ObjectId, ref: 'Team' },
  invitedTeams: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export interface PeerDocument extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl: string;
  authProviderSub: string; // New field for auth provider's sub identifier
  ownTeam?: TeamDocument;
  invitedTeams: TeamDocument[];
  createdAt: Date;
}
