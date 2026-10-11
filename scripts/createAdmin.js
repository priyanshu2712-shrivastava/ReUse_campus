const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reuse_campus';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'admin' },
    departmentName: { type: String, default: 'Campus Sustainability Office' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  const args = process.argv.slice(2);
  const name = args[0] || 'Campus Administrator';
  const email = (args[1] || 'admin@campus.edu').toLowerCase().trim();
  const password = args[2] || 'Admin@Campus2026';

  console.log(`\n--- Provisioning Administrator ---`);
  console.log(`Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account for ${email} already exists.`);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    departmentName: 'Office of Campus Sustainability & Facilities',
    isActive: true,
  });

  console.log(`\nSuccessfully created administrator:`);
  console.log(`Name:     ${admin.name}`);
  console.log(`Email:    ${admin.email}`);
  console.log(`Role:     ${admin.role}`);
  console.log(`Password: ${password}\n`);

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
