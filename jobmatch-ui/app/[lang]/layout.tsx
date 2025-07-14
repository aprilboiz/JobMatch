import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getDictionary, t as translate } from '@/lib/i18n';
import Navigation from '@/components/navigation';
import { Footer } from '@/components/footer';
import { AuthProvider } from "@/contexts/auth-context";
import { SWRProvider } from "@/contexts/swr-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  const title = lang === 'vi' ? 'JobMatch - Tìm công việc mơ ước của bạn' : 'JobMatch - Find Your Dream Job';
  const description = lang === 'vi'
    ? 'Kết nối với các công ty hàng đầu và khám phá những cơ hội phù hợp với kỹ năng, kinh nghiệm và mục tiêu nghề nghiệp của bạn.'
    : 'Connect with top companies and discover opportunities that match your skills, experience, and career goals.';
  const keywords = lang === 'vi'
    ? 'việc làm, nghề nghiệp, tuyển dụng, tìm việc, cơ hội việc làm'
    : 'jobs, careers, employment, hiring, recruitment, job search';

  return {
    title,
    description,
    keywords,
    authors: [{ name: "JobMatch Team" }],
    creator: "JobMatch",
    publisher: "JobMatch",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://jobmatch.dev"),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        "en": "/en",
        "vi": "/vi",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://jobmatch.dev/${lang}`,
      siteName: "JobMatch",
      locale: lang === 'vi' ? 'vi_VN' : 'en_US',
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@jobmatch",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'vi' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  // This `t` function is for Server Components like Footer
  const t = (key: string) => translate(dictionary, key);

  return (
    <html lang={lang} suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <SWRProvider>
          <AuthProvider dictionary={dictionary}>
            <div className="min-h-screen flex flex-col">
              <Navigation locale={lang} dictionary={dictionary} />
              <main className="flex-1">{children}</main>
              <Footer locale={lang} t={t} />
            </div>
            <Toaster />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
