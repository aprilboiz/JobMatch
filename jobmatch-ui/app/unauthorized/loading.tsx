import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4 min-h-96">
            <Card className="w-full max-w-lg shadow-lg">
                <CardContent className="p-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>

                    {/* Title */}
                    <Skeleton className="h-8 w-48 mx-auto mb-4" />

                    {/* Description */}
                    <div className="space-y-2 mb-6">
                        <Skeleton className="h-4 w-80 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto" />
                        <Skeleton className="h-4 w-72 mx-auto" />
                    </div>

                    {/* Role info */}
                    <div className="bg-muted p-4 rounded-lg mb-6">
                        <Skeleton className="h-4 w-32 mx-auto mb-2" />
                        <Skeleton className="h-6 w-20 mx-auto" />
                    </div>

                    {/* Button */}
                    <Skeleton className="h-12 w-40 mx-auto" />
                </CardContent>
            </Card>
        </div>
    )
} 