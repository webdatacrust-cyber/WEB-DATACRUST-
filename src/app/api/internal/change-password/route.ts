import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Password validation rules
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      error:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 attempts per minute per user
    const rateLimitKey = `password-change:${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 5, 60)) {
      return NextResponse.json(
        { error: "Too many password change attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Prevent using the same password
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear mustChangePassword flag
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
