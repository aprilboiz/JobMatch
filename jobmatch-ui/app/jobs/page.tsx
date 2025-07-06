"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import { useRouter, useSearchParams } from "next/navigation"
import { Job } from "@/lib/types"
import { debounce } from "@/lib/utils"

interface FilterOptions {
  keyword?: string
  jobType?: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
  jobCategory?: number
  location?: string
  minSalary?: number
  maxSalary?: number
  companyName?: string
  status?: "OPEN" | "CLOSED" | "EXPIRED"
  applicationDeadlineAfter?: string
}

export default function JobsPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "")
  const [location, setLocation] = useState("all")
  const [jobType, setJobType] = useState<string[]>([])
  const [salaryRange, setSalaryRange] = useState([50000])
  const [showFilters, setShowFilters] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [locations, setLocations] = useState<string[]>([])
  const [companies, setCompanies] = useState<string[]>([])
  const [jobTypes, setJobTypes] = useState<string[]>([])
  const [selectedCompany, setSelectedCompany] = useState("all")
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false)
  const router = useRouter()

  // Use refs to prevent recreation of debounced functions
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchRequestRef = useRef<Promise<any> | null>(null)

  // Create a stable debounced function
  const debouncedFetchJobs = useMemo(
    () => debounce(async (filters: any) => {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)

      try {
        // Prevent duplicate requests
        if (searchRequestRef.current) {
          return
        }

        const requestPromise = apiClient.searchJobs(filters)
        searchRequestRef.current = requestPromise

        const res = await requestPromise

        if (res.success) {
          setJobs(res.data.content)
          setTotalPages(res.data.totalPages)
        } else {
          throw new Error(res.message)
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message || "Unknown error")
        }
      } finally {
        setLoading(false)
        searchRequestRef.current = null
      }
    }, 300),
    []
  )

  // Update search term when URL params change
  useEffect(() => {
    const keyword = searchParams.get("keyword")
    if (keyword !== null) {
      setSearchTerm(keyword)
      setPage(0) // Reset to first page when search params change
    }
  }, [searchParams])

  // Load filter options once on mount
  useEffect(() => {
    let mounted = true

    const loadFilterOptions = async () => {
      if (filterOptionsLoaded) return

      try {
        const [locationsResponse, companiesResponse, jobTypesResponse] = await Promise.all([
          apiClient.getAvailableLocations(),
          apiClient.getAvailableCompanyNames(),
          apiClient.getJobTypes()
        ])

        if (mounted) {
          if (locationsResponse.success) {
            setLocations(locationsResponse.data)
          }
          if (companiesResponse.success) {
            setCompanies(companiesResponse.data)
          }
          if (jobTypesResponse.success) {
            setJobTypes(jobTypesResponse.data)
          }
          setFilterOptionsLoaded(true)
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to load filter options:", error)
        }
      }
    }

    loadFilterOptions()

    return () => {
      mounted = false
    }
  }, [filterOptionsLoaded])

  // Create memoized filters
  const currentFilters = useMemo(() => ({
    keyword: searchTerm || undefined,
    location: location === "all" ? undefined : location,
    minSalary: salaryRange[0],
    companyName: selectedCompany === "all" ? undefined : selectedCompany,
    jobType: jobType.length > 0 ? jobType[0] as any : undefined,
    page,
    size: 10,
  }), [searchTerm, location, salaryRange, selectedCompany, jobType, page])

  // Fetch jobs when filters change
  useEffect(() => {
    if (!filterOptionsLoaded) return

    debouncedFetchJobs(currentFilters)
  }, [currentFilters, debouncedFetchJobs, filterOptionsLoaded])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleJobTypeToggle = (type: string) => {
    if (jobType.includes(type)) {
      setJobType(jobType.filter(t => t !== type))
    } else {
      setJobType([type]) // Only allow one job type at a time as per API
    }
    setPage(0) // Reset to first page when filter changes
  }

  const updateSearchParams = (newSearchTerm: string) => {
    const params = new URLSearchParams(window.location.search)
    if (newSearchTerm) {
      params.set("keyword", newSearchTerm)
    } else {
      params.delete("keyword")
    }

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    router.replace(newUrl, { scroll: false })
  }

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
                <CardTitle className="flex items-center text-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {/* Search */}
                <div className="space-y-2">
                  <Label className="text-sm">Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Job title, skills..."
                      value={searchTerm}
                      onChange={(e) => {
                        const newSearchTerm = e.target.value
                        setSearchTerm(newSearchTerm)
                        updateSearchParams(newSearchTerm)
                        setPage(0) // Reset page when search term changes
                      }}
                      className="pl-10 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label className="text-sm">Location</Label>
                  <Select
                    value={location}
                    onValueChange={(value) => {
                      setLocation(value)
                      setPage(0)
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc} className="text-sm">
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label className="text-sm">Company</Label>
                  <Select
                    value={selectedCompany}
                    onValueChange={(value) => {
                      setSelectedCompany(value)
                      setPage(0)
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company} className="text-sm">
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Job Type */}
                <div className="space-y-2">
                  <Label className="text-sm">Job Type</Label>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          className="h-4 w-4"
                          checked={jobType.includes(type)}
                          onCheckedChange={() => handleJobTypeToggle(type)}
                        />
                        <Label htmlFor={type} className="text-sm font-normal">
                          {type.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label className="text-sm">Minimum Salary: ${salaryRange[0].toLocaleString()}</Label>
                  <Slider
                    value={salaryRange}
                    onValueChange={(value) => {
                      setSalaryRange(value)
                      setPage(0)
                    }}
                    max={200000}
                    min={30000}
                    step={5000}
                    className="w-full h-3"
                  />
                </div>
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
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse h-40 bg-muted/40" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group hover:cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-0.5">
                              {job.title}
                            </h3>
                            <p className="text-muted-foreground flex items-center mb-1 text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {job.company.name}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {job.location}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                {job.salary.formattedSalary || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Badge variant={getJobTypeVariant(job.jobType)} className="text-xs px-2 py-0.5">
                            {job.jobType.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-2 line-clamp-1 text-xs">{job.description}</p>

                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-[10px] px-1 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0.5">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                          </span>
                          {job.jobType === "REMOTE" && <Badge variant="secondary" className="text-[10px] px-1 py-0.5">Remote</Badge>}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" className="h-7 px-2 text-xs">Apply Now</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Previous
                  </Button>
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i ? "default" : "outline"}
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    disabled={page === totalPages - 1}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
