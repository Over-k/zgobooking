import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Input validation schema
const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = verifyOtpSchema.parse(body);

    // Find user with matching email
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

    // Verify OTP (in a real application, this would be more complex)
    if (user.securitySettings.passwordResetToken !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (user.securitySettings.passwordResetExpires && user.securitySettings.passwordResetExpires < new Date()) {
      return NextResponse.json(
        { error: "OTP code has expired" },
        { status: 400 }
      );
    }

    // OTP is valid, return success
    return NextResponse.json({
      message: "OTP verified successfully",
      userId: user.id,
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
