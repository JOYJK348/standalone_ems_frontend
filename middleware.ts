import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
    const token = request.cookies.get("access_token")?.value;
    const userRole = request.cookies.get("user_role")?.value;

    const { pathname } = request.nextUrl;
    const dashboardPath = getDashboardPath(userRole);

    if (!token && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    if (pathname === "/") {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    return NextResponse.next();
}

function getDashboardPath(userRole?: string) {
    switch (userRole) {
        case "PLATFORM_ADMIN":
            return "/ems/platform-admin/dashboard";
        case "TENANT_ADMIN":
        case "COMPANY_ADMIN":
            return "/ems/tenant-admin/dashboard";
        case "ACADEMIC_COORDINATOR":
            return "/ems/academic-manager/dashboard";
        case "FINANCE_MANAGER":
            return "/ems/dynamic-role/finance-manager/dashboard";
        case "PLACEMENT_OFFICER":
            return "/ems/dynamic-role/placement-officer/dashboard";
        case "HR_MANAGER":
        case "HRMS_ADMIN":
            return "/ems/dynamic-role/hr-manager/dashboard";
        case "ACADEMIC_MANAGER":
        case "BRANCH_ADMIN":
            return "/ems/dynamic-role/dashboard";
        case "STUDENT":
            return "/ems/student/dashboard";
        case "TUTOR":
            return "/ems/tutor/dashboard";
        default:
            return "/ems/academic-manager/dashboard";
    }
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
