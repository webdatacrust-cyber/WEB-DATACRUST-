import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
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

    // Rate limiting: 30 email checks per minute per user
    const rateLimitKey = `email-check:${session.user.id}`;
    if (!checkRateLimit(rateLimitKey, 30, 60)) {
        return NextResponse.json(
            { error: "Too many email checks. Please try again later." },
            { status: 429 }
        );
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json(
            { error: "Email parameter is required" },
            { status: 400 }
        );
    }

    try {
        const existingClient = await prisma.client.findFirst({
            where: { email: email.toLowerCase() },
        });

        if (existingClient) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 409 }
            );
        }

        return NextResponse.json({ available: true }, { status: 200 });
    } catch (error) {
        console.error("Error checking email:", error);
        return NextResponse.json(
            { error: "Failed to check email" },
            { status: 500 }
        );
    }
}
