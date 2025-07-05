import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user id from email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Fetch payment methods for the current user
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        isDefault: "desc"
      }
    });
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user id from email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the incoming request data
    const data = await request.json();
    console.log('Received payment method data:', data);

    // Validate required fields
    if (!data.type) {
      return NextResponse.json({ error: "Payment method type is required" }, { status: 400 });
    }
    if (!data.name) {
      return NextResponse.json({ error: "Payment method name is required" }, { status: 400 });
    }

    // If this is the first payment method, make it default
    const existingMethods = await prisma.paymentMethod.count({
      where: {
        userId: user.id
      }
    });

    try {
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          ...data,
          userId: user.id,
          isDefault: existingMethods === 0 ? true : data.isDefault ?? false,
          // Ensure expiryDate is properly formatted if provided
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined
        }
      });

      console.log('Successfully created payment method:', paymentMethod);
      return NextResponse.json(paymentMethod);
    } catch (prismaError) {
      console.error('Prisma error creating payment method:', prismaError);
      // Handle specific Prisma validation errors
      if (prismaError instanceof Error) {
        if (prismaError.message.includes('Unique constraint failed')) {
          return NextResponse.json({ 
            error: "A payment method with this information already exists" 
          }, { status: 400 });
        }
        if (prismaError.message.includes('Validation failed')) {
          return NextResponse.json({ 
            error: "Invalid payment method data. Please check your inputs." 
          }, { status: 400 });
        }
      }
      throw prismaError;
    }
  } catch (error) {
    console.error('Error creating payment method:', error);
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message || "Failed to create payment method",
        details: error instanceof Error ? error.stack : undefined
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user id from email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { id, ...data } = await request.json();
    
    // If making a method default, unmark all others as default first
    if (data.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          id: {
            not: id
          }
        },
        data: {
          isDefault: false
        }
      });
    }

    const paymentMethod = await prisma.paymentMethod.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        ...data,
        isDefault: data.isDefault ?? false
      }
    });

    return NextResponse.json(paymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user id from email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const { id } = await request.json();
    
    // First check if the payment method exists and belongs to this user
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: {
        id,
        userId: user.id
      }
    });

    if (!paymentMethod) {
      return NextResponse.json({ 
        error: "Payment method not found or does not belong to you" 
      }, { status: 404 });
    }

    // Delete the payment method
    await prisma.paymentMethod.delete({
      where: {
        id,
        userId: user.id
      }
    });

    return NextResponse.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to delete not found')) {
        return NextResponse.json({ 
          error: "Payment method not found" 
        }, { status: 404 });
      }
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json({ 
          error: "Cannot delete payment method due to database constraints" 
        }, { status: 400 });
      }
      if (error.message.includes('Foreign key constraint failed')) {
        return NextResponse.json({ 
          error: "Cannot delete payment method as it is being used" 
        }, { status: 400 });
      }
    }
    return NextResponse.json({ 
      error: "Failed to delete payment method",
      details: error instanceof Error ? error.message : undefined
    }, { status: 500 });
  }
}