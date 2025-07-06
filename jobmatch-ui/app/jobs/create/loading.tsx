import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>

                {/* Form Card */}
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-96" />
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Basic Information */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-48" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>

                        <Skeleton className="h-px w-full" />

                        {/* Job Details */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-32" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </div>

                        <Skeleton className="h-px w-full" />

                        {/* Salary & Benefits */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-40" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>

                        <Skeleton className="h-px w-full" />

                        {/* Requirements */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-32" />

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-32 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-24 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <Skeleton key={i} className="h-8 w-20" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Skeleton className="h-px w-full" />

                        {/* Application Settings */}
                        <div className="space-y-6">
                            <Skeleton className="h-5 w-48" />

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-4">
                                <Skeleton className="h-4 w-40" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 