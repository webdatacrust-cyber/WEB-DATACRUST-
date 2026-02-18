import { PageKey } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/internal/seo
 * Get all PageSEO records or a specific one by pageKey
 * Query params: pageKey (optional)
 * Public endpoint - no auth required for GET
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageKey = searchParams.get("pageKey");

        if (pageKey) {
            const pageSEO = await prisma.pageSEO.findUnique({
                where: { pageKey: pageKey as PageKey },
            });

            if (!pageSEO) {
                return NextResponse.json(
                    { error: "PageSEO not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(pageSEO);
        }

        // Get all PageSEO records
        const allPageSEO = await prisma.pageSEO.findMany({
            orderBy: { pageKey: "asc" },
        });

        return NextResponse.json(allPageSEO);
    } catch (error) {
        console.error("Error fetching PageSEO:", error);
        return NextResponse.json(
            { error: "Failed to fetch PageSEO" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/internal/seo
 * Create or update a PageSEO record (ADMIN only)
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            pageKey,
            title,
            description,
            keywords,
            ogTitle,
            ogDescription,
            ogImage,
            noIndex,
        } = body;

        // Validate required fields
        if (!pageKey || !title || !description) {
            return NextResponse.json(
                { error: "pageKey, title, and description are required" },
                { status: 400 }
            );
        }

        // Validate pageKey is valid enum value
        if (!Object.values(PageKey).includes(pageKey)) {
            return NextResponse.json(
                { error: `Invalid pageKey. Must be one of: ${Object.values(PageKey).join(", ")}` },
                { status: 400 }
            );
        }

        // Upsert - create if not exists, update if exists
        const pageSEO = await prisma.pageSEO.upsert({
            where: { pageKey },
            update: {
                title,
                description,
                keywords: keywords || null,
                ogTitle: ogTitle || null,
                ogDescription: ogDescription || null,
                ogImage: ogImage || null,
                noIndex: noIndex ?? false,
            },
            create: {
                pageKey,
                title,
                description,
                keywords: keywords || null,
                ogTitle: ogTitle || null,
                ogDescription: ogDescription || null,
                ogImage: ogImage || null,
                noIndex: noIndex ?? false,
            },
        });

        return NextResponse.json(pageSEO, { status: 201 });
    } catch (error) {
        console.error("Error creating/updating PageSEO:", error);
        return NextResponse.json(
            { error: "Failed to create/update PageSEO" },
            { status: 500 }
        );
    }
}
