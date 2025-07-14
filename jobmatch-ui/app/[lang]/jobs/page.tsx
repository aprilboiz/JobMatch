import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { JobListings } from "@/components/jobs/job-listings"
import { Skeleton } from "@/components/ui/skeleton"
import { getDictionary, t } from '@/lib/i18n'

function JobsPageSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

interface JobsPageProps {
  params: Promise<{ lang: string }>;
}

export default async function JobsPage({ params }: JobsPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/${lang}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t(dictionary, "button.backToHome")}
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">{t(dictionary, "job.findOpportunity")}</h1>
          <p className="text-xl text-muted-foreground">
            {t(dictionary, "job.discoverOpportunities")}
          </p>
        </div>
        <Suspense fallback={<JobsPageSkeleton />}>
          <JobListings locale={lang} dictionary={dictionary} />
        </Suspense>
      </div>
    </div>
  )
}
