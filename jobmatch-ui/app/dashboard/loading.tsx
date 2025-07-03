import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
            <div className="container py-8">
                {/* Header */}
                <div className="mb-8">
                    <Skeleton className="h-8 w-80 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Tabs */}
                <div className="space-y-6">
                    <div className="flex space-x-1 p-1 bg-muted rounded-lg w-fit">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-9 w-24" />
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Skeleton className="h-4 w-20 mb-2" />
                                                <Skeleton className="h-8 w-12" />
                                            </div>
                                            <Skeleton className="w-8 h-8" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Main Content Card */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Skeleton className="w-10 h-10 rounded-lg" />
                                                <div>
                                                    <Skeleton className="h-5 w-48 mb-1" />
                                                    <Skeleton className="h-4 w-32 mb-1" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="w-4 h-4" />
                                                <Skeleton className="h-6 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
} 