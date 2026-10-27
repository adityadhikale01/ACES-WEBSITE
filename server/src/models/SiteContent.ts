import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteContent extends Document {
  key: string;
  data: Record<string, any>;
  updatedBy?: string;
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export const SiteContent = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
