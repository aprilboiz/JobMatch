import { Suspense } from "react"
import { RouteGuard } from "@/components/route-guard"
import { getDictionary } from '@/lib/i18n'
import DashboardContent from "@/components/dashboard/dashboard-content"

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <RouteGuard>
      <DashboardContent locale={lang} dictionary={dictionary} />
    </RouteGuard>
  )
}
