import { Schema, Document } from 'mongoose';

export const OutboxSchema = new Schema({
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false },
});

export interface OutboxDocument extends Document {
  id: string;
  eventType: string;
  payload: any;
  createdAt: Date;
  processed: boolean;
}
