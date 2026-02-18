import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { generateTempPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Rate limiting: 10 password resets per hour per admin
    const rateLimitKey = `password-reset:${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 10, 3600)) {
      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Hash the password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user password and set mustChangePassword to true
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    // Return temporary password (only time it's shown)
    return NextResponse.json(
      {
        message: "Password reset successfully",
        tempPassword,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
