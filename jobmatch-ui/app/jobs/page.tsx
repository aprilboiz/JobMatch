"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Building2, DollarSign, Clock, Filter, Heart, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [salaryRange, setSalaryRange] = useState([50000])
  const [showFilters, setShowFilters] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.getJobs({ page: 0, limit: 10 })
        setJobs(res.data?.content || [])
      } catch (e: any) {
        setError(e.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "REMOTE", "INTERNSHIP"]
  const locations = ["San Francisco, CA", "New York, NY", "Portland, OR", "Boston, MA", "Chicago, IL", "Remote"]

  const getJobTypeVariant = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "default"
      case "PART_TIME":
        return "secondary"
      case "CONTRACT":
        return "outline"
      case "REMOTE":
        return "secondary"
      case "INTERNSHIP":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-xl text-muted-foreground">
            Discover {loading ? "..." : jobs.length} amazing job opportunities waiting for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Job Type */}
                <div className="space-y-3">
                  <Label>Job Type</Label>
                  <div className="space-y-3">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox id={type} />
                        <Label htmlFor={type} className="text-sm font-normal">
                          {type.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Salary Range */}
                <div className="space-y-3">
                  <Label>Minimum Salary: ${salaryRange[0].toLocaleString()}</Label>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200000}
                    min={30000}
                    step={5000}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Remote Work */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="remote" />
                  <Label htmlFor="remote">Remote Work Available</Label>
                </div>

                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">{loading ? "Loading jobs..." : `${jobs.length} jobs found`}</p>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}

            {loading ? (
              <div className="space-y-4">
                {/* Simple loading skeletons */}
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse h-40 bg-muted/40" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job: any) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group hover:cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors mb-1">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground flex items-center mb-2">
                              <Building2 className="w-4 h-4 mr-1" />
                              {job.companyName || job.company?.name || "Unknown Company"}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {job.location || job.companyLocation || "N/A"}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {typeof job.salary === "object"
                                  ? job.salary.formattedSalary || "N/A"
                                  : job.salary || "N/A"}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="w-5 h-5" />
                          </Button>
                          <Badge variant={getJobTypeVariant(job.jobType || job.type || "FULL_TIME")}>{(job.jobType || job.type || "FULL_TIME").replace("_", " ")}</Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Requirements:</p>
                        <div className="flex flex-wrap gap-2">
                          {(job.requirements || []).map((req: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {job.applicantsCount || job.applicants || 0} applicants
                          </span>
                          {(job.isRemote || job.jobType === "REMOTE") && <Badge variant="secondary">Remote</Badge>}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button>1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
