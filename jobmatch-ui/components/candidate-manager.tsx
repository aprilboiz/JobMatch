"use client"

import { Suspense } from "react"
import { CandidateList, CandidateListSkeleton } from "@/components/candidates/candidate-list"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"

export function CandidateManager({ jobId }: { jobId: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    Candidate Management
                </CardTitle>
                <CardDescription>
                    Review and manage applications for this job.
                </CardDescription>
            </CardHeader>
            <Suspense fallback={<CandidateListSkeleton />}>
                <CandidateList jobId={jobId} />
            </Suspense>
        </Card>
    )
} 