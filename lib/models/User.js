import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      match: [/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, 'Password must contain at least one uppercase letter and one special character'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
      set: (v) => (v === 'admin' ? 'admin' : 'user'),
    },
    departmentName: {
      type: String,
      trim: true,
      default: '',
    },
    collegeId: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
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

// Fallback hook to guarantee role is always 'user' or 'admin'
UserSchema.pre('validate', function (next) {
  if (this.role && !['user', 'admin'].includes(this.role)) {
    this.role = 'user';
  }
  next();
});

// Prevent mongoose model overwrite error during Next.js hot reloads
export default mongoose.models.User || mongoose.model('User', UserSchema);
