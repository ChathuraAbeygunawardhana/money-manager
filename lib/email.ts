import nodemailer from 'nodemailer';
import { APP_CONFIG } from './config';

// Check if email is configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Create transporter only if email is configured
const transporter = isEmailConfigured ? nodemailer.createTransport({
  // For development, you can use a service like Gmail or a test service
  // For production, use a proper email service like SendGrid, AWS SES, etc.
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
}) : null;

export async function sendVerificationEmail(email: string, token: string) {
  // If email is not configured, log the verification URL for development
  if (!isEmailConfigured || !transporter) {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:8000'}/auth/verify-email?token=${token}`;
    console.log('📧 Email not configured. Verification URL for', email, ':', verificationUrl);
    return; // Don't throw error, just skip sending email
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:8000'}/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || APP_CONFIG.email.from,
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; text-align: center;">Welcome to ${APP_CONFIG.name}!</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          Thank you for signing up. Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">
          ${verificationUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Log the verification URL as fallback
    console.log('📧 Fallback verification URL for', email, ':', verificationUrl);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  // If email is not configured, log the reset URL for development
  if (!isEmailConfigured || !transporter) {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:8000'}/auth/reset-password?token=${token}`;
    console.log('📧 Email not configured. Password reset URL for', email, ':', resetUrl);
    return; // Don't throw error, just skip sending email
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:8000'}/auth/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || APP_CONFIG.email.from,
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1f2937; text-align: center;">Reset Your Password</h1>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          Hi ${name},
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
          We received a request to reset your password for your ${APP_CONFIG.name} account. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">
          ${resetUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          For security reasons, this reset link can only be used once.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Log the reset URL as fallback
    console.log('📧 Fallback password reset URL for', email, ':', resetUrl);
    throw new Error('Failed to send password reset email');
  }
}