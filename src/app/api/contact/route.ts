import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/contact
 * Public endpoint for contact form submissions
 * Validates input and stores in database
 * Includes honeypot spam prevention
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message, companyName } = body;

        // Honeypot spam prevention - if companyName is filled, reject submission
        if (companyName) {
            return NextResponse.json(
                { error: "Invalid submission" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        if (!email || typeof email !== "string" || email.trim().length === 0) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        if (!message || typeof message !== "string" || message.trim().length < 10) {
            return NextResponse.json(
                { error: "Message must be at least 10 characters" },
                { status: 400 }
            );
        }

        // Store submission in database
        await prisma.ContactSubmission.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim(),
            },
        });

        return NextResponse.json(
            { message: "Thank you for your message! We'll get back to you soon." },
            { status: 200 }
        );
    } catch (error) {
        // Log error for internal tracking but don't expose details
        if (process.env.NODE_ENV === "development") {
            console.error("Contact form error:", error);
        }

        return NextResponse.json(
            { error: "Failed to submit contact form" },
            { status: 500 }
        );
    }
}
