import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Briefcase } from "lucide-react"

export default function Loading() {
  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4 min-h-96">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg transform rotate-3">
                <Briefcase className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            {/* Title and Description */}
            <Skeleton className="h-8 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Full Name Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
              </div>

              {/* Submit Button */}
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <Skeleton className="h-4 w-44 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
