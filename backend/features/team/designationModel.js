import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['FACULTY', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'COMMITTEE'],
      default: 'COMMITTEE',
    },
    displayOrder: {
      type: Number,
      default: 100,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Designation = mongoose.model('Designation', designationSchema);
export default Designation;
