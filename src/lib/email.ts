import nodemailer from 'nodemailer';

interface EmailTemplateData {
  otp: string;
  expiresAt: Date;
}

// Define template names as a type
type TemplateName = 'password-reset-otp' | 'email-verification';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: {
    name: TemplateName;
    data: EmailTemplateData;
  };
}

// Collection of email templates
const templates = {
  'password-reset-otp': (data: EmailTemplateData) => {
    const otp = data.otp;
    const expiresAt = data.expiresAt;
    
    return {
      subject: 'Password Reset OTP',
      text: `Your password reset code is: ${otp}. This code will expire at ${new Date(expiresAt).toLocaleString()}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Code</h2>
          <p>Please use the following code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 18px; font-weight: bold; text-align: center; letter-spacing: 4px;">
            ${otp}
          </div>
          <p>This code will expire at ${new Date(expiresAt).toLocaleString()}.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `
    };
  },
  'email-verification': (data: EmailTemplateData) => {
    const otp = data.otp;
    const expiresAt = data.expiresAt;
    
    return {
      subject: 'Verify your email address',
      text: `Your verification code is: ${otp}. This code will expire at ${new Date(expiresAt).toLocaleString()}.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email address</h2>
          <p>Please use the following code to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 18px; font-weight: bold; text-align: center; letter-spacing: 4px;">
            ${otp}
          </div>
          <p>This code will expire at ${new Date(expiresAt).toLocaleString()}.</p>
        </div>
      `
    };
  }
};

// Create a transporter with debug mode for development
function createTransporter() {
  // For development, use a debugging configuration that shows more details
  const isDevMode = process.env.NODE_ENV === 'development';
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // Use the environment variable
    debug: isDevMode, // Enable extra logging in development
    logger: isDevMode, // Enable logger in development
    tls: {
      // Do not fail on invalid certs in development
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
  
  return transporter;
}

// Send email verification code
export async function sendEmailVerification(email: string, otp: string, expiresAt: Date) {
  const templateData = templates['email-verification']({ otp, expiresAt });
  
  await sendEmail({
    to: email,
    subject: templateData.subject,
    text: templateData.text,
    html: templateData.html
  });
}

export async function sendPasswordResetOtp(email: string, otp: string, expiresAt: Date) {
  const templateData = templates['password-reset-otp']({ otp, expiresAt });
  
  await sendEmail({
    to: email,
    subject: templateData.subject,
    text: templateData.text,
    html: templateData.html
  });
}
// Generic send email function that can handle templates
export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = createTransporter();
    
    // Process template if provided
    if (options.template) {
      const template = templates[options.template.name];
      
      if (!template) {
        throw new Error(`Email template "${options.template.name}" not found`);
      }
      
      const renderedTemplate = template(options.template.data);
      
      // Override with template values if not explicitly provided
      if (!options.subject) options.subject = renderedTemplate.subject;
      if (!options.text) options.text = renderedTemplate.text;
      if (!options.html) options.html = renderedTemplate.html;
    }
    
    // Verify transporter connection
    await transporter.verify();
    
    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email. Please check your email configuration.");
  }
}