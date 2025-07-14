"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useTransition } from "react";

export default function LanguageSwitcher() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isPending, startTransition] = useTransition();

    const currentLocale = params.lang as string;

    async function onSelectChange(newLocale: string) {
        // 1. Set the cookie via an API route
        await fetch('/api/language/switch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locale: newLocale }),
        });

        // 2. Refresh the page with the new locale
        startTransition(() => {
            const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
            router.replace(newPath);
            router.refresh();
        });
    }

    return (
        <div className="relative">
            <select
                id="language-switcher"
                value={currentLocale}
                onChange={(e) => onSelectChange(e.target.value)}
                disabled={isPending}
                className="block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
            </select>
        </div>
    );
} 