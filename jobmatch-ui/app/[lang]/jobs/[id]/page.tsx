import { getDictionary } from '@/lib/i18n'
import JobDetailContent from '@/components/jobs/job-detail-content'

interface JobDetailPageProps {
    params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return {
        title: `${dictionary['job.title']} - JobMatch`,
        description: dictionary['job.description'],
    };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { lang, id } = await params;
    const dictionary = await getDictionary(lang);

    return <JobDetailContent locale={lang} dictionary={dictionary} jobId={id} />;
}
