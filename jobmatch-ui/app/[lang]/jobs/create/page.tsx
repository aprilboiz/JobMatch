"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, HelpCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { JobCategory } from "@/lib/types"

// Match the API's JobRequest type
interface JobFormData {
    title: string
    jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE"
    jobCategory: number
    salary: {
        salaryType: "FIXED" | "RANGE" | "NEGOTIABLE" | "COMPETITIVE"
        minSalary?: number
        maxSalary?: number
        currency: "USD" | "VND" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD"
        salaryPeriod: "ANNUAL" | "MONTHLY" | "WEEKLY" | "HOURLY"
    }
    openings: number
    applicationDeadline: string
    description: string
    location: string
    skills: string[]
}



function CreateJobContent() {
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [skillInput, setSkillInput] = useState("")
    const [jobTypes, setJobTypes] = useState<string[]>([])
    const [jobCategories, setJobCategories] = useState<JobCategory[]>([])
    const [formData, setFormData] = useState<JobFormData>({
        title: "",
        jobType: "FULL_TIME",
        jobCategory: 1,
        salary: {
            salaryType: "RANGE",
            minSalary: 30000,
            maxSalary: 50000,
            currency: "USD",
            salaryPeriod: "ANNUAL"
        },
        openings: 1,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        description: "",
        location: "",
        skills: []
    })

    useEffect(() => {
        loadFormOptions()
    }, [])

    const loadFormOptions = async () => {
        try {
            const [jobTypesRes, jobCategoriesRes] = await Promise.all([
                apiClient.getJobTypes(),
                apiClient.getJobCategories()
            ])

            if (jobTypesRes.success && jobCategoriesRes.success) {
                setJobTypes(jobTypesRes.data)
                setJobCategories(jobCategoriesRes.data)

                // Set initial values from the fetched data with proper type casting
                setFormData(prev => ({
                    ...prev,
                    jobType: jobTypesRes.data[0] as JobFormData["jobType"],
                    jobCategory: jobCategoriesRes.data[0]?.code || 1
                }))
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load form options",
            })
        } finally {
            setIsFetching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data: job } = await apiClient.createJob(formData)
            toast({
                title: "Success",
                description: "Job posting has been created successfully",
            })
            router.push(`/jobs/${job.id}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create job posting",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const addSkill = () => {
        if (skillInput.trim() && formData.skills.length < 20) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()]
            })
            setSkillInput("")
        }
    }

    const removeSkill = (index: number) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((_, i) => i !== index)
        })
    }

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
                <div className="container py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-muted rounded w-1/4"></div>
                            <div className="h-64 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
            <div className="container py-8">
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/dashboard">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Create New Job Posting</h1>
                    <p className="text-muted-foreground mb-8">Fill in the details to create a new job opportunity</p>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Senior Software Engineer"
                                            required
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="jobType">Job Type *</Label>
                                        <Select
                                            value={formData.jobType}
                                            onValueChange={(value: any) => setFormData({ ...formData, jobType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jobTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.replace(/_/g, " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location *</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="e.g. San Francisco, CA"
                                            required
                                            maxLength={100}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="openings">Number of Openings *</Label>
                                        <Input
                                            id="openings"
                                            type="number"
                                            min={1}
                                            value={formData.openings}
                                            onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                                        <Input
                                            id="applicationDeadline"
                                            type="date"
                                            value={formData.applicationDeadline}
                                            onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="jobCategory">Job Category *</Label>
                                            <HoverCard>
                                                <HoverCardTrigger>
                                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80">
                                                    <p className="text-sm">
                                                        {jobCategories.find(cat => cat.code === formData.jobCategory)?.description ||
                                                            "Select a category to see its description"}
                                                    </p>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                        <Select
                                            value={formData.jobCategory.toString()}
                                            onValueChange={(value) => setFormData({ ...formData, jobCategory: parseInt(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {jobCategories.map((category) => (
                                                    <SelectItem key={category.code} value={category.code.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Salary Information *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            value={formData.salary.salaryType}
                                            onValueChange={(value: any) =>
                                                setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, salaryType: value }
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FIXED">Fixed</SelectItem>
                                                <SelectItem value="RANGE">Range</SelectItem>
                                                <SelectItem value="NEGOTIABLE">Negotiable</SelectItem>
                                                <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={formData.salary.currency}
                                            onValueChange={(value: any) =>
                                                setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, currency: value }
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="VND">VND</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="JPY">JPY</SelectItem>
                                                <SelectItem value="AUD">AUD</SelectItem>
                                                <SelectItem value="CAD">CAD</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {formData.salary.salaryType === "FIXED" && (
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.salary.minSalary}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        salary: {
                                                            ...formData.salary,
                                                            minSalary: parseInt(e.target.value),
                                                            maxSalary: parseInt(e.target.value)
                                                        }
                                                    })
                                                }
                                                placeholder="Fixed salary amount"
                                            />
                                        )}

                                        {formData.salary.salaryType === "RANGE" && (
                                            <>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={formData.salary.minSalary}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            salary: { ...formData.salary, minSalary: parseInt(e.target.value) }
                                                        })
                                                    }
                                                    placeholder="Minimum salary"
                                                />
                                                <Input
                                                    type="number"
                                                    min={formData.salary.minSalary}
                                                    value={formData.salary.maxSalary}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            salary: { ...formData.salary, maxSalary: parseInt(e.target.value) }
                                                        })
                                                    }
                                                    placeholder="Maximum salary"
                                                />
                                            </>
                                        )}

                                        <Select
                                            value={formData.salary.salaryPeriod}
                                            onValueChange={(value: any) =>
                                                setFormData({
                                                    ...formData,
                                                    salary: { ...formData.salary, salaryPeriod: value }
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ANNUAL">Annual</SelectItem>
                                                <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                <SelectItem value="HOURLY">Hourly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Job Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the role, responsibilities, and what you're looking for..."
                                        rows={6}
                                        required
                                        maxLength={5000}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Required Skills</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            placeholder="Add a required skill..."
                                            maxLength={50}
                                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                                        />
                                        <Button type="button" onClick={addSkill} disabled={formData.skills.length >= 20}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {formData.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.skills.map((skill, index) => (
                                                <div key={index} className="flex items-center bg-muted px-3 py-1 rounded-full">
                                                    <span className="text-sm mr-2">{skill}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-4 w-4 p-0"
                                                        onClick={() => removeSkill(index)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Creating..." : "Create Job"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function CreateJobPage() {
    return (
        <RouteGuard requireAuth={true} allowedRoles={["RECRUITER"]}>
            <CreateJobContent />
        </RouteGuard>
    )
} 