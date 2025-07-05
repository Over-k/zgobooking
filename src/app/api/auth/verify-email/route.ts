import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

// Helper function to generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send OTP email
const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await sendEmail({
      to: email,
      subject: "Email Verification Code",
      template: {
        name: "email-verification",
        data: {
          otp,
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
      },
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification code. Please try again later.");
  }
};

// Input validation schema
const verifyEmailSchema = z.object({
  email: z.string().email(),
});

// Verify OTP schema
const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Send verification code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = verifyEmailSchema.parse(body);

    // Check if user already exists with verified email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { securitySettings: true },
    });

    if (existingUser && existingUser.securitySettings?.emailVerifiedAt) {
      return NextResponse.json(
        { error: "Email already registered and verified" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Send OTP to user's email
    await sendOTPEmail(email, otp);

    // Create or update verification record
    await prisma.verification.upsert({
      where: { email },
      update: {
        code: otp,
        expiresAt,
        createdAt: new Date(),
        usedAt: null, // Reset usedAt if updating
      },
      create: {
        email,
        code: otp,
        expiresAt,
        createdAt: new Date(),
        usedAt: null,
      },
    });

    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

// Verify OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Find verification code
    const verification = await prisma.verification.findUnique({
      where: { email },
      select: {
        code: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (verification.code !== otp) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Check if OTP has already been used
    if (verification.usedAt) {
      return NextResponse.json(
        { error: "Verification code already used" },
        { status: 400 }
      );
    }

    // Mark verification as used and update user status
    await prisma.$transaction(async (tx) => {
      // Mark verification as used
      await tx.verification.update({
        where: { email },
        data: {
          usedAt: new Date(),
        },
      });

      // Update user's email verification status
      const user = await tx.user.findUnique({
        where: { email },
        include: { securitySettings: true },
      });

      if (user) {
        await tx.securitySettings.update({
          where: { email },
          data: {
            emailVerifiedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
