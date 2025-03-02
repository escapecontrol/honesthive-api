import { Schema, Document } from 'mongoose';

export const TeamTypeSchema = new Schema({
  name: { type: String, required: true },
  growthCategories: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

// Add an index on the name field
TeamTypeSchema.index({ name: 1 });

export interface TeamTypeDocument extends Document {
  id: string;
  name: string;
  growthCategories: {
    name: string;
    description: string
  }[];
  createdAt: Date;
}
