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
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Submit Button */}
              <Skeleton className="h-12 w-full" />
            </div>

            {/* Sign up link */}
            <div className="text-center">
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
