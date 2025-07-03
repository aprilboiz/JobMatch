import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center">
                  <Skeleton className="w-5 h-5 mr-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Keywords */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <Skeleton className="h-px w-full" />

                {/* Job Type */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-16" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                <Skeleton className="h-px w-full" />

                {/* Salary Range */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                </div>

                <Skeleton className="h-px w-full" />

                {/* Remote Work */}
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>

                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-48" />
            </div>

            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-64 mb-1" />
                          <Skeleton className="h-4 w-40 mb-2" />
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>

                    <Skeleton className="h-4 w-full mb-4" />

                    <div className="mb-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-6 w-16" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-10" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
