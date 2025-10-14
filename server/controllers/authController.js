import { z } from 'zod';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, generateRandomToken, hashToken } from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmail.js';
import { sendWelcomeEmail, sendLoginAlert, sendPasswordChangeConfirmation, sendNewSellerNotificationToAdmin } from '../utils/emailEvents.js';
import { sendResponse, sendError } from '../utils/response.js';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const PASSWORD_ERROR = 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(PASSWORD_REGEX, PASSWORD_ERROR),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'seller']).optional(),
  storeName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).regex(PASSWORD_REGEX, PASSWORD_ERROR)
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, storeName } = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'User already exists with this email');
    }
    
    // Generate email verification token
    const emailToken = generateRandomToken();
    const hashedEmailToken = hashToken(emailToken);
    
    // Create user data
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'customer',
      emailVerificationToken: hashedEmailToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEmailVerified: false // Force email verification for testing
    };
    
    // Add storeName if role is seller
    if (role === 'seller' && storeName) {
      userData.storeName = storeName;
    }
    
    const user = new User(userData);
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, {
        name: user.fullName,
        email: user.email,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email/${emailToken}`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }
    
    // Send admin notification if seller registration
    if (role === 'seller') {
      sendNewSellerNotificationToAdmin(user).catch(err => 
        console.error('Admin seller notification failed:', err)
      );
    }
    
    sendResponse(res, 201, 'Registration successful. Please check your email to verify your account.');
  } catch (error) {
    console.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'ZodError') {
      const errorMessage = error.errors && error.errors[0] ? error.errors[0].message : 'Validation failed';
      return sendError(res, 400, errorMessage);
    }
    
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)[0]?.message || 'Validation failed';
      return sendError(res, 400, errorMessage);
    }
    
    sendError(res, 500, `Registration failed: ${error.message}`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return sendError(res, 423, 'Account temporarily locked due to too many failed login attempts');
    }
    
    // Check if email is verified (skip in development)
    if (!user.isEmailVerified && process.env.NODE_ENV === 'production') {
      return sendError(res, 401, 'Please verify your email before logging in');
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return sendError(res, 401, 'Invalid credentials');
    }
    
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Generate JWT token
    const token = generateToken({ 
      userId: user._id, 
      email: user.email 
    });
    
    // Set token as httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send login alert email (async, don't wait)
    sendLoginAlert(user, {
      device: req.headers['user-agent'] || 'Unknown Device',
      ip: req.ip || req.connection.remoteAddress,
      location: 'Unknown Location'
    }).catch(err => console.error('Login alert email failed:', err));
    
    sendResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        cartItemCount: user.cartItemCount,
        loyaltyPoints: user.loyaltyPoints
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, error.errors[0].message);
    }
    sendError(res, 500, 'Login failed');
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return sendError(res, 400, 'Invalid or expired verification token');
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    // Send welcome email after successful verification
    sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err));
    
    sendResponse(res, 200, 'Email verified successfully');
  } catch (error) {
    sendError(res, 500, 'Email verification failed');
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return sendResponse(res, 200, 'If an account with that email exists, a password reset link has been sent.');
    }
    
    // Generate reset token
    const resetToken = generateRandomToken();
    const hashedResetToken = hashToken(resetToken);
    
    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, {
        name: user.fullName,
        resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }
    
    sendResponse(res, 200, 'If an account with that email exists, a password reset link has been sent.');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, error.errors[0].message);
    }
    sendError(res, 500, 'Password reset request failed');
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const hashedToken = hashToken(token);
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return sendError(res, 400, 'Invalid or expired reset token');
    }
    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    
    // Send password change confirmation
    sendPasswordChangeConfirmation(user).catch(err => console.error('Password change email failed:', err));
    
    sendResponse(res, 200, 'Password reset successful');
  } catch (error) {
    if (error.name === 'ZodError') {
      return sendError(res, 400, error.errors[0].message);
    }
    sendError(res, 500, 'Password reset failed');
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = resendVerificationSchema.parse(req.body);
    
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    
    if (user.isEmailVerified) {
      return sendError(res, 400, 'Email is already verified');
    }
    
    // Generate new verification token
    const emailToken = generateRandomToken();
    const hashedEmailToken = hashToken(emailToken);
    
    user.emailVerificationToken = hashedEmailToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, {
        name: user.fullName,
        email: user.email,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email/${emailToken}`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }
    
    sendResponse(res, 200, 'Verification email sent');
  } catch (error) {
    sendError(res, 500, 'Failed to resend verification email');
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    sendResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    sendError(res, 500, 'Logout failed');
  }
};