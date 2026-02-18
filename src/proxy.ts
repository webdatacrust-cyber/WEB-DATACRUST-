import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@prisma/client";

const LOGIN_ROUTE = "/internal/login";
const DASHBOARD_ROUTE = "/internal/dashboard";
const defaultRequirement: Role = "EMPLOYEE";

const roleHierarchy: Record<Role, number> = {
    EMPLOYEE: 1,
    ADMIN: 2,
};

const roleMatchers: Array<{ pattern: RegExp; minRole: Role }> = [
    {
        pattern: /^\/internal\/admin/i,
        minRole: "ADMIN",
    },
];

export async function proxy(req: NextRequest) {
    if (!req.nextUrl.pathname.startsWith("/internal")) {
        return NextResponse.next();
    }

    const isSetupRoute = req.nextUrl.pathname.startsWith("/internal/setup");

    // Allow the one-time setup page to be reached when explicitly enabled.
    if (
        isSetupRoute &&
        process.env.ALLOW_ADMIN_SETUP &&
        process.env.ALLOW_ADMIN_SETUP.toLowerCase() === "true"
    ) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isLoginRoute = req.nextUrl.pathname.startsWith(LOGIN_ROUTE);

    if (!token) {
        if (isLoginRoute) {
            return NextResponse.next();
        }

        const loginUrl = new URL(LOGIN_ROUTE, req.url);
        loginUrl.searchParams.set(
            "callbackUrl",
            `${req.nextUrl.pathname}${req.nextUrl.search}`
        );
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginRoute) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
    }

    const userRole = token.role as Role | undefined;
    if (!userRole) {
        return NextResponse.redirect(new URL(LOGIN_ROUTE, req.url));
    }

    const matchedRule = roleMatchers.find(({ pattern }) =>
        pattern.test(req.nextUrl.pathname)
    );
    const minimumRole = matchedRule?.minRole ?? defaultRequirement;

    if (!hasSufficientRole(userRole, minimumRole)) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTE, req.url));
    }

    return NextResponse.next();
}

const hasSufficientRole = (currentRole: Role, requiredRole: Role) =>
    roleHierarchy[currentRole] >= roleHierarchy[requiredRole];

export const config = {
    matcher: ["/internal/:path*"],
};
