import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const generateToken = (payload, expiresIn = '24h') => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};