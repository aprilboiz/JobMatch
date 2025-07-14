import { getDictionary } from '@/lib/i18n'
import LoginForm from '@/components/auth/login-form'

interface LoginPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: LoginPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return {
    title: `${dictionary['auth.welcomeBack']} - JobMatch`,
    description: dictionary['auth.signInAccount'],
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <LoginForm locale={lang} dictionary={dictionary} />;
}
