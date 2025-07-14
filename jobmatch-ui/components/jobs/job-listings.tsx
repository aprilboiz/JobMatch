"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import useSWR from "swr"
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
import { useDebounce } from "@/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"
import { t } from '@/lib/i18n-client'

export const fetchCache = "force-cache"

type Dictionary = {
    [key: string]: string;
};

interface JobListingsProps {
    locale: string;
    dictionary: Dictionary;
}

async function fetchJobs(filters: any) {
    const res = await apiClient.searchJobs(filters)
    if (res.success) {
        return res.data
    }
    throw new Error(res.message || "Failed to fetch jobs")
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

const getJobTypeLabel = (type: string, dictionary: Dictionary) => {
    switch (type) {
        case "FULL_TIME":
            return t(dictionary, "jobType.fullTime")
        case "PART_TIME":
            return t(dictionary, "jobType.partTime")
        case "CONTRACT":
            return t(dictionary, "jobType.contract")
        case "REMOTE":
            return t(dictionary, "jobType.remote")
        case "INTERNSHIP":
            return t(dictionary, "jobType.internship")
        default:
            return type
    }
}

export function JobListings({ locale, dictionary }: JobListingsProps) {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "")
    const [location, setLocation] = useState("all")
    const [jobType, setJobType] = useState<string[]>([])
    const [salaryRange, setSalaryRange] = useState([50000])
    const [page, setPage] = useState(0)
    const [selectedCompany, setSelectedCompany] = useState("all")
    const [sortBy, setSortBy] = useState("newest")

    const [locations, setLocations] = useState<string[]>([])
    const [companies, setCompanies] = useState<string[]>([])
    const [jobTypes, setJobTypes] = useState<string[]>([])
    const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false)

    // Sync search term from URL query params
    useEffect(() => {
        const keyword = searchParams.get("keyword")
        if (keyword !== null && keyword !== searchTerm) {
            setSearchTerm(keyword)
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
                    apiClient.getJobTypes(),
                ])
                if (mounted) {
                    if (locationsResponse.success) setLocations(locationsResponse.data)
                    if (companiesResponse.success) setCompanies(companiesResponse.data)
                    if (jobTypesResponse.success) setJobTypes(jobTypesResponse.data)
                    setFilterOptionsLoaded(true)
                }
            } catch (error) {
                if (mounted) console.error("Failed to load filter options:", error)
            }
        }
        loadFilterOptions()
        return () => {
            mounted = false
        }
    }, [filterOptionsLoaded])

    const sortOptions: { [key: string]: string[] | undefined } = {
        newest: ["createdAt,desc"],
        "salary-high": ["maxSalary,desc"],
        "salary-low": ["minSalary,asc"],
        relevance: undefined,
    }

    // Memoize filters that should be debounced
    const debouncedFilterSource = useMemo(
        () => ({
            keyword: searchTerm || undefined,
            location: location === "all" ? undefined : location,
            minSalary: salaryRange[0],
            companyName: selectedCompany === "all" ? undefined : selectedCompany,
            jobType: jobType.length > 0 ? (jobType[0] as any) : undefined,
            sort: sortOptions[sortBy],
        }),
        [searchTerm, location, salaryRange, selectedCompany, jobType, sortBy]
    )

    const debouncedFilters = useDebounce(debouncedFilterSource, 500)

    // Create final filters, combining debounced (for filtering) and instant (for pagination)
    const currentFilters = useMemo(
        () => ({
            ...debouncedFilters,
            page,
            size: 10,
        }),
        [debouncedFilters, page]
    )

    // Use SWR for data fetching
    const { data: jobData, error } = useSWR(
        filterOptionsLoaded ? ["jobs", currentFilters] : null,
        () => fetchJobs(currentFilters),
        { suspense: true }
    )

    const jobs = jobData?.content || []
    const totalPages = jobData?.totalPages || 0

    // Update URL when search term changes
    const updateSearchParams = useCallback(
        (newSearchTerm: string) => {
            const params = new URLSearchParams(window.location.search)
            if (newSearchTerm) {
                params.set("keyword", newSearchTerm)
            } else {
                params.delete("keyword")
            }
            const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
            router.replace(newUrl, { scroll: false })
        },
        [router]
    )

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== searchParams.get("keyword")) {
                updateSearchParams(searchTerm)
            }
        }, 300) // Debounce URL updates
        return () => clearTimeout(timeoutId)
    }, [searchTerm, searchParams, updateSearchParams])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleJobTypeToggle = (type: string) => {
        setJobType((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [type]))
        setPage(0)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Filter className="w-5 h-5 mr-2" />
                            {t(dictionary, "filter.filters")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-5">
                        <div className="space-y-2">
                            <Label className="text-sm">{t(dictionary, "job.keywords")}</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t(dictionary, "search.keywords")}
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value)
                                        setPage(0)
                                    }}
                                    className="pl-10 h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">{t(dictionary, "job.location")}</Label>
                            <Select
                                value={location}
                                onValueChange={(value) => {
                                    setLocation(value)
                                    setPage(0)
                                }}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={t(dictionary, "filter.selectLocation")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t(dictionary, "filter.allLocations")}</SelectItem>
                                    {locations.map((loc) => (
                                        <SelectItem key={loc} value={loc} className="text-sm">
                                            {loc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">{t(dictionary, "job.company")}</Label>
                            <Select
                                value={selectedCompany}
                                onValueChange={(value) => {
                                    setSelectedCompany(value)
                                    setPage(0)
                                }}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder={t(dictionary, "filter.selectCompany")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t(dictionary, "filter.allCompanies")}</SelectItem>
                                    {companies.map((comp) => (
                                        <SelectItem key={comp} value={comp} className="text-sm">
                                            {comp}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t(dictionary, "filter.jobType")}</Label>
                            <div className="space-y-2">
                                {jobTypes.map((type) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox id={type} checked={jobType.includes(type)} onCheckedChange={() => handleJobTypeToggle(type)} />
                                        <Label htmlFor={type} className="text-sm font-normal">
                                            {getJobTypeLabel(type, dictionary)}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t(dictionary, "filter.salaryRange")}</Label>
                            <Slider
                                min={0}
                                max={200000}
                                step={10000}
                                value={salaryRange}
                                onValueChange={(value) => {
                                    setSalaryRange(value)
                                    setPage(0)
                                }}
                            />
                            <p className="text-xs text-muted-foreground text-center">{t(dictionary, "filter.upTo")} ${salaryRange[0].toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Job Listings */}
            <div className="lg:col-span-3">
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-muted-foreground">{`${jobData?.totalElements || 0} ${t(dictionary, "job.found")}`}</p>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => {
                            setSortBy(value)
                            setPage(0)
                        }}
                    >
                        <SelectTrigger className="w-48 h-9 text-sm">
                            <SelectValue placeholder={t(dictionary, "sort.sortBy")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relevance">{t(dictionary, "sort.relevance")}</SelectItem>
                            <SelectItem value="newest">{t(dictionary, "sort.newest")}</SelectItem>
                            <SelectItem value="salary-high">{t(dictionary, "sort.salaryHighToLow")}</SelectItem>
                            <SelectItem value="salary-low">{t(dictionary, "sort.salaryLowToHigh")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-6">
                    {jobs.map((job: Job) => (
                        <Card key={job.id} className="hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <Link href={`/${locale}/jobs/${job.id}`} className="text-lg font-semibold text-primary hover:underline">
                                                {job.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground mb-2">{job.company.name}</p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {getJobTypeLabel(job.jobType, dictionary)}
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign className="w-3 h-3 mr-1" />
                                                    {job.salary.formattedSalary || `${job.salary.minSalary || 0} - ${job.salary.maxSalary || 0}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="icon">
                                            <Heart className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm">
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="w-4 h-4 mr-1" />
                                            <span>{job.applications?.length || 0} {t(dictionary, "job.applicants")}</span>
                                        </div>
                                        <Badge variant={getJobTypeVariant(job.jobType)}>{getJobTypeLabel(job.jobType, dictionary)}</Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button asChild size="sm">
                                            <Link href={`/${locale}/jobs/${job.id}`}>{t(dictionary, "button.viewDetails")}</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {page > 0 && (
                                <Button variant="outline" onClick={() => handlePageChange(page - 1)}>
                                    {t(dictionary, "button.previous")}
                                </Button>
                            )}
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i}
                                    variant={i === page ? "default" : "outline"}
                                    onClick={() => handlePageChange(i)}
                                    className="w-10 h-10"
                                >
                                    {i + 1}
                                </Button>
                            ))}
                            {page < totalPages - 1 && (
                                <Button variant="outline" onClick={() => handlePageChange(page + 1)}>
                                    {t(dictionary, "button.next")}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function JobsPageSkeleton() {
    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}

export default function JobsPage() {
    return (
        <div className="bg-gradient-to-br from-background via-muted/20 to-muted/40">
            <div className="container py-8">
                <div className="mb-8">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">Find Your Next Opportunity</h1>
                    <p className="text-xl text-muted-foreground">
                        Discover amazing job opportunities waiting for you
                    </p>
                </div>
            </div>
        </div>
    )
} 