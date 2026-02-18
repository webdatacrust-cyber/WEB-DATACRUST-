import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/internal/contacts
 * Admin-only endpoint to fetch all contact submissions
 * Returns submissions sorted by newest first
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const contacts = await prisma.contactSubmission.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ contacts }, { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Error fetching contact submissions:", error);
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
