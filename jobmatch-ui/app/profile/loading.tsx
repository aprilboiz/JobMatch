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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div>
                                    <Skeleton className="h-6 w-32 mb-1" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <Skeleton key={i} className="h-6 w-20" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Experience */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="border-l-2 border-muted pl-4">
                                        <Skeleton className="h-6 w-48 mb-1" />
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-4 w-24 mb-3" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="border-l-2 border-muted pl-4">
                                        <Skeleton className="h-6 w-48 mb-1" />
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-4 w-24 mb-3" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 