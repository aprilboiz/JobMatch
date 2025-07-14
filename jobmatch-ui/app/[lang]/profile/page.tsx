import { RouteGuard } from "@/components/route-guard"
import { getDictionary } from '@/lib/i18n'
import ProfileContent from "@/components/profile/profile-content"

interface ProfilePageProps {
    params: Promise<{ lang: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <RouteGuard>
            <ProfileContent locale={lang} dictionary={dictionary} />
        </RouteGuard>
    )
}
