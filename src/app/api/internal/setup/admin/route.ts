import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const sanitizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * POST /api/internal/setup/admin
 * Create initial admin account (DISABLED IN PRODUCTION)
 * Only accessible during initial setup (when no users exist)
 */
export async function POST(request: Request) {
  // ⚠️  SECURITY: This endpoint is dangerous and should ONLY be enabled during initial deployment
  // Default: DISABLED. Must be explicitly enabled via environment variable
  const isSetupEnabled = process.env.ALLOW_ADMIN_SETUP === "true" && process.env.NODE_ENV !== "production";

  if (!isSetupEnabled) {
    return NextResponse.json(
      { error: "Admin setup is disabled. This endpoint is only available during initial setup." },
      { status: 403 }
    );
  }

  // Additional security: Verify setup token if setup is enabled
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.SETUP_TOKEN;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: "Invalid or missing setup token." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const normalizedEmail = sanitizeEmail(email);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const userCount = await tx.user.count();

      if (userCount > 0) {
        throw new Error("SETUP_LOCKED");
      }

      const existingUser = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new Error("EMAIL_EXISTS");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      return tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          role: Role.ADMIN,
        },
        select: { id: true, email: true },
      });
    });

    return NextResponse.json(
      {
        message: "Admin account created successfully.",
        userId: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SETUP_LOCKED") {
        return NextResponse.json(
          { error: "Admin setup is no longer available. System is already initialized." },
          { status: 403 }
        );
      }

      if (error.message === "EMAIL_EXISTS") {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }
    }

    console.error("Admin setup failed", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
