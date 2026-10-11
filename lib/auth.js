import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import connectDB from './db';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_reuse_campus_jwt_key_2026_secure';
const TOKEN_EXPIRY = '7d';

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extracts the authenticated user from the current request (header or cookies).
 * Returns user document or null if unauthenticated.
 */
export async function getAuthUser() {
  try {
    let token = null;

    // Check Authorization header
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback to cookie
    if (!token) {
      const cookieStore = cookies();
      const tokenCookie = cookieStore.get('reuse_token');
      if (tokenCookie) {
        token = tokenCookie.value;
      }
    }

    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) return null;

    // Seamlessly migrate legacy roles ('student', 'department', etc.) to 'user'
    if (user.role && !['user', 'admin'].includes(user.role)) {
      user.role = 'user';
      await User.updateOne({ _id: user._id }, { $set: { role: 'user' } }).catch(() => {});
    }

    return user;
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}
