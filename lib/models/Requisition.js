import mongoose from 'mongoose';

const RequisitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item or resource name is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'books',
        'electronics',
        'lab_supplies',
        'furniture',
        'event_supplies',
        'everyday_reusable',
        'other',
      ],
      default: 'electronics',
    },
    quantityNeeded: {
      type: Number,
      required: [true, 'Quantity needed is required'],
      min: [1, 'Must need at least 1 unit'],
      default: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    urgency: {
      type: String,
      enum: ['standard', 'priority', 'urgent'],
      default: 'standard',
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requesterRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      set: (v) => (v === 'admin' ? 'admin' : 'user'),
    },
    departmentName: {
      type: String,
      trim: true,
      default: '',
    },
    locationNeeded: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'fulfilled', 'cancelled'],
      default: 'open',
      index: true,
    },
    matchedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

RequisitionSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Requisition || mongoose.model('Requisition', RequisitionSchema);
