import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { RateLimiter } from "@/lib/utils/rate-limiter";
import { AuthError } from "@/lib/errors/auth-error";

const checkEmailLimiter = new RateLimiter({
  points: 5,
  duration: 60, // 5 requests per minute
});

const checkEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await checkEmailLimiter.check(ip);

    const body = await request.json();
    
    // Validate input
    const validatedData = checkEmailSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AuthError("USER_ALREADY_EXISTS", "User with this email already exists");
    }

    return NextResponse.json({
      message: "Email is available",
      email: validatedData.email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
