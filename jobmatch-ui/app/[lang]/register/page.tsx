import { getDictionary } from '@/lib/i18n'
import RegisterForm from '@/components/auth/register-form'

interface RegisterPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: RegisterPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return {
    title: `${dictionary['auth.joinJobMatch']} - JobMatch`,
    description: dictionary['auth.createAccount'],
  };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <RegisterForm locale={lang} dictionary={dictionary} />;
}
