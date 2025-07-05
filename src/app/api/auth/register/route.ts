import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PasswordManager } from "@/lib/utils/password";
import { z } from "zod";
import { RateLimiter } from "@/lib/utils/rate-limiter";
import { AuthError } from "@/lib/errors/auth-error";

const registerLimiter = new RateLimiter({
  points: 5,
  duration: 60, // 5 requests per minute
});

const passwordComplexity = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be at most 100 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
  .regex(/\d/, "Password must contain at least one number (0-9)")
  .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)");

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be at most 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be at most 50 characters"),
  email: z.string().email(),
  password: passwordComplexity,
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await registerLimiter.check(ip);

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verify email has been verified
    const verification = await prisma.verification.findUnique({
      where: { email: validatedData.email },
      select: { usedAt: true }
    });

    if (!verification?.usedAt) {
      throw new AuthError("INVALID_EMAIL", "Email not verified");
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { securitySettings: true }
    });

    if (existingUser && existingUser.securitySettings?.emailVerifiedAt) {
      throw new AuthError("INVALID_EMAIL", "Email already registered");
    }

    // Create user with security settings and transaction
    const user = await prisma.$transaction(async (tx) => {
      const { hash: passwordHash, salt: passwordSalt } = await PasswordManager.hashPassword(
        validatedData.password
      );

      // Create user and security settings in a transaction
      const newUser = await tx.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          profileImage: "", // You might want to add a default profile image
          joinDate: new Date(),
          securitySettings: {
            create: {
              email: validatedData.email,
              password: passwordHash,
              passwordSalt,
              lastPasswordChange: new Date(),
            },
          },
          accountSettings: {
            create: {},
          },
          notificationPreferences: {
            create: {},
          },
        },
        include: {
          securitySettings: true,
        },
      });

      // Mark verification as used
      await tx.verification.update({
        where: { email: validatedData.email },
        data: { usedAt: new Date() }
      });

      return newUser;
    });

    // Remove sensitive data before sending response
    const { securitySettings, ...userWithoutSensitiveData } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutSensitiveData,
      },
      { status: 201 }
    );
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

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}