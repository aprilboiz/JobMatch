import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { locale } = await request.json();

        if (!['en', 'vi'].includes(locale)) {
            return NextResponse.json({ error: 'Invalid locale provided.' }, { status: 400 });
        }

        const response = NextResponse.json({ success: true });
        response.cookies.set({
            name: 'NEXT_LOCALE',
            value: locale,
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Failed to switch language.' }, { status: 500 });
    }
} 