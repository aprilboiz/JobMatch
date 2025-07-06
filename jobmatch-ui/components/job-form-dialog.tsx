"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Building2,
    MapPin,
    DollarSign,
    Users,
    CheckCircle,
    Briefcase,
    Target,
    Award,
} from "lucide-react"
import type { Job, Company } from "@/lib/types"

interface JobFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    job?: Job | null
    companies: Company[]
    onSubmit: (data: any) => Promise<void>
    isLoading?: boolean
}

interface JobFormData {
    title: string
    companyId: string
    department: string
    description: string
    requirements: string[]
    skills: string[]
    experienceLevel: "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE"
    location: string
    workMode: "ONSITE" | "REMOTE" | "HYBRID"
    salary: string
    salaryMin: string
    salaryMax: string
    currency: string
    type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE" | "INTERNSHIP"
    status: "OPEN" | "CLOSED" | "DRAFT"
    urgency: "LOW" | "MEDIUM" | "HIGH"
    positions: number
    benefits: string[]
    applicationDeadline: string
    startDate: string
}

const COMMON_SKILLS = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "C++",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "Agile",
    "Scrum",
    "Project Management",
    "Leadership",
    "Communication",
    "Problem Solving",
    "Team Work",
    "Critical Thinking",
    "Data Analysis",
    "Machine Learning",
    "AI",
    "DevOps",
    "CI/CD",
    "Testing",
    "QA",
    "UI/UX Design",
    "Figma",
]

const COMMON_BENEFITS = [
    "Health Insurance",
    "Dental Insurance",
    "Vision Insurance",
    "401(k) Matching",
    "Flexible Working Hours",
    "Remote Work",
    "Paid Time Off",
    "Sick Leave",
    "Professional Development",
    "Training Budget",
    "Conference Attendance",
    "Stock Options",
    "Bonus Opportunities",
    "Gym Membership",
    "Free Meals",
    "Transportation Allowance",
    "Childcare Support",
    "Mental Health Support",
]

export function JobFormDialog({ open, onOpenChange, job, companies, onSubmit, isLoading = false }: JobFormDialogProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<JobFormData>({
        title: "",
        companyId: "",
        department: "",
        description: "",
        requirements: [],
        skills: [],
        experienceLevel: "MID",
        location: "",
        workMode: "ONSITE",
        salary: "",
        salaryMin: "",
        salaryMax: "",
        currency: "USD",
        type: "FULL_TIME",
        status: "DRAFT",
        urgency: "MEDIUM",
        positions: 1,
        benefits: [],
        applicationDeadline: "",
        startDate: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [requirementInput, setRequirementInput] = useState("")
    const [skillInput, setSkillInput] = useState("")
    const [benefitInput, setBenefitInput] = useState("")

    const totalSteps = 4

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || "",
                companyId: job.companyId || "",
                department: job.department || "",
                description: job.description || "",
                requirements: job.requirements || [],
                skills: job.skills || [],
                experienceLevel: job.experienceLevel || "MID",
                location: job.location || "",
                workMode: job.workMode || "ONSITE",
                salary: job.salary || "",
                salaryMin: job.salaryMin || "",
                salaryMax: job.salaryMax || "",
                currency: job.currency || "USD",
                type: job.type || "FULL_TIME",
                status: job.status || "DRAFT",
                urgency: job.urgency || "MEDIUM",
                positions: job.positions || 1,
                benefits: job.benefits || [],
                applicationDeadline: job.applicationDeadline || "",
                startDate: job.startDate || "",
            })
        } else {
            // Reset form for new job
            setFormData({
                title: "",
                companyId: companies[0]?.id || "",
                department: "",
                description: "",
                requirements: [],
                skills: [],
                experienceLevel: "MID",
                location: "",
                workMode: "ONSITE",
                salary: "",
                salaryMin: "",
                salaryMax: "",
                currency: "USD",
                type: "FULL_TIME",
                status: "DRAFT",
                urgency: "MEDIUM",
                positions: 1,
                benefits: [],
                applicationDeadline: "",
                startDate: "",
            })
        }
        setCurrentStep(1)
        setErrors({})
    }, [job, companies, open])

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        switch (step) {
            case 1:
                if (!formData.title.trim()) newErrors.title = "Job title is required"
                if (!formData.companyId) newErrors.companyId = "Company is required"
                if (formData.positions < 1) newErrors.positions = "At least 1 position is required"
                break
            case 2:
                if (!formData.description.trim()) newErrors.description = "Job description is required"
                if (formData.requirements.length === 0) newErrors.requirements = "At least one requirement is needed"
                break
            case 3:
                if (!formData.location.trim()) newErrors.location = "Location is required"
                if (!formData.salary.trim() && (!formData.salaryMin || !formData.salaryMax)) {
                    newErrors.salary = "Salary information is required"
                }
                break
            case 4:
                // Optional validation for final step
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(Math.min(currentStep + 1, totalSteps))
        }
    }

    const handlePrevious = () => {
        setCurrentStep(Math.max(currentStep - 1, 1))
    }

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return

        try {
            const submitData = {
                ...formData,
                salary: formData.salary || `${formData.salaryMin} - ${formData.salaryMax} ${formData.currency}`,
            }
            await onSubmit(submitData)
            onOpenChange(false)
        } catch (error) {
            // Error handling is done in parent component
        }
    }

    const addItem = (type: "requirements" | "skills" | "benefits", input: string, setInput: (value: string) => void) => {
        if (input.trim()) {
            setFormData((prev) => ({
                ...prev,
                [type]: [...prev[type], input.trim()],
            }))
            setInput("")
        }
    }

    const removeItem = (type: "requirements" | "skills" | "benefits", index: number) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }))
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <Building2 className="w-12 h-12 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            <p className="text-sm text-muted-foreground">Let's start with the essential details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Senior Software Engineer"
                                    className={errors.title ? "border-destructive" : ""}
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Select
                                    value={formData.companyId}
                                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                                >
                                    <SelectTrigger className={errors.companyId ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.companyId && <p className="text-sm text-destructive">{errors.companyId}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g. Engineering, Marketing, Sales"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="positions">Number of Positions *</Label>
                                <Input
                                    id="positions"
                                    type="number"
                                    min="1"
                                    value={formData.positions}
                                    onChange={(e) => setFormData({ ...formData, positions: Number.parseInt(e.target.value) || 1 })}
                                    className={errors.positions ? "border-destructive" : ""}
                                />
                                {errors.positions && <p className="text-sm text-destructive">{errors.positions}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="urgency">Priority Level</Label>
                                <Select
                                    value={formData.urgency}
                                    onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low Priority</SelectItem>
                                        <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                        <SelectItem value="HIGH">High Priority</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">Job Details</h3>
                            <p className="text-sm text-muted-foreground">Describe the role and requirements</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                                    rows={6}
                                    className={errors.description ? "border-destructive" : ""}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Requirements *</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={requirementInput}
                                        onChange={(e) => setRequirementInput(e.target.value)}
                                        placeholder="Add a requirement..."
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), addItem("requirements", requirementInput, setRequirementInput))
                                        }
                                    />
                                    <Button type="button" onClick={() => addItem("requirements", requirementInput, setRequirementInput)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                {errors.requirements && <p className="text-sm text-destructive">{errors.requirements}</p>}
                                {formData.requirements.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        {formData.requirements.map((req, index) => (
                                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                                <span className="text-sm">{req}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem("requirements", index)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Required Skills</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        placeholder="Add a skill..."
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addItem("skills", skillInput, setSkillInput))
                                        }
                                    />
                                    <Button type="button" onClick={() => addItem("skills", skillInput, setSkillInput)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {COMMON_SKILLS.slice(0, 10).map((skill) => (
                                        <Badge
                                            key={skill}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                            onClick={() => !formData.skills.includes(skill) && addItem("skills", skill, setSkillInput)}
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                                {formData.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.skills.map((skill, index) => (
                                            <Badge key={index} variant="default" className="flex items-center space-x-1">
                                                <span>{skill}</span>
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem("skills", index)} />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experienceLevel">Experience Level</Label>
                                <Select
                                    value={formData.experienceLevel}
                                    onValueChange={(value: any) => setFormData({ ...formData, experienceLevel: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ENTRY">Entry Level (0-2 years)</SelectItem>
                                        <SelectItem value="MID">Mid Level (2-5 years)</SelectItem>
                                        <SelectItem value="SENIOR">Senior Level (5+ years)</SelectItem>
                                        <SelectItem value="EXECUTIVE">Executive Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <DollarSign className="w-12 h-12 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">Compensation & Location</h3>
                            <p className="text-sm text-muted-foreground">Set the compensation and work details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA or Remote"
                                    className={errors.location ? "border-destructive" : ""}
                                />
                                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="workMode">Work Mode</Label>
                                <Select
                                    value={formData.workMode}
                                    onValueChange={(value: any) => setFormData({ ...formData, workMode: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ONSITE">On-site</SelectItem>
                                        <SelectItem value="REMOTE">Remote</SelectItem>
                                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Job Type</Label>
                                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                        <SelectItem value="REMOTE">Remote</SelectItem>
                                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Salary Information *</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary Range (Text)</Label>
                                    <Input
                                        id="salary"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        placeholder="e.g. $80,000 - $120,000 per year"
                                    />
                                </div>

                                <div className="text-center text-sm text-muted-foreground">OR</div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryMin">Minimum Salary</Label>
                                        <Input
                                            id="salaryMin"
                                            type="number"
                                            value={formData.salaryMin}
                                            onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                            placeholder="80000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salaryMax">Maximum Salary</Label>
                                        <Input
                                            id="salaryMax"
                                            type="number"
                                            value={formData.salaryMax}
                                            onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                            placeholder="120000"
                                        />
                                    </div>
                                </div>
                                {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
                            </CardContent>
                        </Card>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <Award className="w-12 h-12 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-semibold">Additional Details</h3>
                            <p className="text-sm text-muted-foreground">Add benefits and final details</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Benefits & Perks</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        value={benefitInput}
                                        onChange={(e) => setBenefitInput(e.target.value)}
                                        placeholder="Add a benefit..."
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && (e.preventDefault(), addItem("benefits", benefitInput, setBenefitInput))
                                        }
                                    />
                                    <Button type="button" onClick={() => addItem("benefits", benefitInput, setBenefitInput)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {COMMON_BENEFITS.slice(0, 8).map((benefit) => (
                                        <Badge
                                            key={benefit}
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                            onClick={() =>
                                                !formData.benefits.includes(benefit) && addItem("benefits", benefit, setBenefitInput)
                                            }
                                        >
                                            {benefit}
                                        </Badge>
                                    ))}
                                </div>
                                {formData.benefits.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {formData.benefits.map((benefit, index) => (
                                            <Badge key={index} variant="default" className="flex items-center space-x-1">
                                                <span>{benefit}</span>
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeItem("benefits", index)} />
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                                    <Input
                                        id="applicationDeadline"
                                        type="date"
                                        value={formData.applicationDeadline}
                                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Expected Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Job Preview */}
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                        Job Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{formData.title || "Job Title"}</h4>
                                        <Badge variant={formData.urgency === "HIGH" ? "destructive" : "default"}>
                                            {formData.urgency} Priority
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>{companies.find((c) => c.id === formData.companyId)?.name || "Company"}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{formData.location || "Location"}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="w-4 h-4" />
                                            <span>
                                                {formData.salary || `${formData.salaryMin} - ${formData.salaryMax} ${formData.currency}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4" />
                                            <span>
                                                {formData.positions} position{formData.positions > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Briefcase className="w-5 h-5" />
                        <span>{job ? "Edit Job" : "Create New Job"}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {job ? "Update the job posting details" : "Fill in the details to create a new job posting"}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span>
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                    </div>
                    <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
                </div>

                <Separator />

                {/* Form Content */}
                <div className="min-h-[400px]">{renderStep()}</div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>

                    <div className="flex space-x-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i + 1 <= currentStep ? "bg-primary" : "bg-muted"}`} />
                        ))}
                    </div>

                    {currentStep < totalSteps ? (
                        <Button type="button" onClick={handleNext}>
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {job ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {job ? "Update Job" : "Create Job"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
