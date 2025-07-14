import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["en", "vi"];
const defaultLocale = "en";

function getLocale(request: NextRequest): string {
    // 1. Check for locale in cookie
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale)) {
        return cookieLocale;
    }

    // 2. Fallback to Accept-Language header
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    try {
        return match(languages, locales, defaultLocale);
    } catch (error) {
        return defaultLocale;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return;
    }

    // Redirect to the detected locale
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;

    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
    ],
}; 