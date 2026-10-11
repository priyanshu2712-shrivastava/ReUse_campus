import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2500, 'Description cannot exceed 2500 characters'],
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
      default: 'books',
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Available quantity must be an integer',
      },
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['new', 'good', 'fair', 'needs_repair'],
      default: 'good',
    },
    location: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
      maxlength: [200, 'Location description cannot exceed 200 characters'],
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: 'Coordinate pickup time after request approval.',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      set: (v) => (v === 'admin' ? 'admin' : 'user'),
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'transferred', 'archived', 'under_repair'],
      default: 'available',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fallback hook to guarantee ownerRole is always 'user' or 'admin'
ResourceSchema.pre('validate', function (next) {
  if (this.ownerRole && !['user', 'admin'].includes(this.ownerRole)) {
    this.ownerRole = 'user';
  }
  next();
});

// Compound text index for search engine
ResourceSchema.index(
  { title: 'text', description: 'text', location: 'text', subCategory: 'text' },
  { weights: { title: 5, subCategory: 3, description: 1, location: 2 } }
);

export default mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
