"use client"

import { Suspense } from "react"
import { CandidateList, CandidateListSkeleton } from "@/components/candidates/candidate-list"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { t } from "@/lib/i18n-client"
import { Dictionary } from "@/lib/types"

interface CandidateManagerProps {
    jobId: string
    locale: string
    dictionary: Dictionary
}

export function CandidateManager({ jobId, locale, dictionary }: CandidateManagerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    {t(dictionary, "candidate.management")}
                </CardTitle>
                <CardDescription>
                    {t(dictionary, "candidate.managementDescription")}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<CandidateListSkeleton />}>
                    <CandidateList jobId={jobId} locale={locale} dictionary={dictionary} />
                </Suspense>
            </CardContent>
        </Card>
    )
} 