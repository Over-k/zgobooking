import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PasswordManager } from "@/lib/utils/password";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();


// Helper functions
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      template: {
        name: "password-reset-otp" as const,
        data: {
          otp,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    // Instead of throwing, we'll return false to handle the error more gracefully
    return false;
  }
};

const verifyOTP = (storedOTP: string | null, inputOTP: string): boolean => {
  if (!storedOTP) return false;
  return storedOTP === inputOTP;
};

const isOTPExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return expiresAt < new Date();
};

// Validation schemas
const resetPasswordSchema = z.object({
  email: z.string().email(),
});


const updatePasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  password: z.string().min(8).max(100),
});

// Request password reset
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = resetPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { securitySettings: true },
    });

    if (!user || !user.securitySettings) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a OTP code",
      }, { status: 200 });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // First save the OTP to the database, so it's saved even if email sending fails
    await prisma.securitySettings.update({
      where: { userId: user.id },
      data: {
        passwordResetToken: otp,
        passwordResetExpires: resetExpires,
      },
    });

    // Send OTP to user's email - handle failure gracefully
    const emailSent = await sendOTPEmail(email, otp);

    // For now, we'll return the token in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: emailSent ? "OTP code sent" : "OTP code saved (email sending failed)",
        otp, // Remove this in production
        emailStatus: emailSent ? "sent" : "failed"
      }, { status: 200 });
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a OTP code",
      emailStatus: emailSent ? "sent" : "failed" // In production, you might want to remove this
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Unable to process your request. Please try again later." },
      { status: 500 }
    );
  }
}

// Update password with OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, password } = updatePasswordSchema.parse(body);

    // Find user with valid OTP
    const user = await prisma.user.findUnique({
      where: { email },
      include: { securitySettings: true },
    });

    if (!user || !user.securitySettings) {
      return NextResponse.json(
        { error: "Invalid email or OTP" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (!verifyOTP(user.securitySettings.passwordResetToken, otp)) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (isOTPExpired(user.securitySettings.passwordResetExpires)) {
      return NextResponse.json(
        { error: "OTP code has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const { hash: passwordHash, salt: passwordSalt } = await PasswordManager.hashPassword(password);

    // Update user's password and clear reset token
    await prisma.securitySettings.update({
      where: { userId: user.id },
      data: {
        password: passwordHash,
        passwordSalt,
        passwordResetToken: null,
        passwordResetExpires: null,
        lastPasswordChange: new Date(),
      },
    });

    return NextResponse.json({
      message: "Password updated successfully",
    }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}