import { getDictionary } from '@/lib/i18n'
import UnauthorizedContent from '@/components/unauthorized/unauthorized-content'

interface UnauthorizedPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: UnauthorizedPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return {
    title: `${dictionary['unauthorized.title']} - JobMatch`,
    description: dictionary['unauthorized.message'],
  };
}

export default async function UnauthorizedPage({ params }: UnauthorizedPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <UnauthorizedContent locale={lang} dictionary={dictionary} />;
}
