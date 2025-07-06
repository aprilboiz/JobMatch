"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Save, Plus, Trash2, Briefcase, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"
import { useToast } from "@/hooks/use-toast"

interface ProfileData {
    fullName: string
    email: string
    phoneNumber: string
    avatarUrl?: string
    bio?: string
    location?: string
    website?: string
    linkedIn?: string
    github?: string
    skills?: string[]
    experience?: Array<{
        id: string
        title: string
        company: string
        location: string
        startDate: string
        endDate?: string
        current: boolean
        description: string
    }>
    education?: Array<{
        id: string
        degree: string
        institution: string
        location: string
        startDate: string
        endDate?: string
        current: boolean
        description?: string
    }>
    certifications?: Array<{
        id: string
        name: string
        issuer: string
        issueDate: string
        expiryDate?: string
        credentialId?: string
        url?: string
    }>
}

interface CompanyData {
    name: string
    description: string
    website?: string
    logo?: string
    location: string
    size: string
    industry: string
    founded?: string
    employees?: string
}

function ProfileContent() {
    const { user, updateProfile } = useAuth()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("personal")
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        avatarUrl: user?.avatarUrl ?? "",
    })
    const [companyData, setCompanyData] = useState({
        name: "",
        description: "",
        location: "",
        size: "",
        industry: "",
        website: "",
        founded: "",
        logo: "",
    })
    const [logoUploading, setLogoUploading] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileData({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                avatarUrl: user.avatarUrl ?? "",
            })
        }
    }, [user])

    const handleSaveProfile = async () => {
        setIsLoading(true)
        try {
            await updateProfile({
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                avatarUrl: profileData.avatarUrl,
            })
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully",
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Company logo upload handler (using JobMatch API doc)
    const handleLogoUpload = async (file: File) => {
        setLogoUploading(true)
        try {
            const formData = new FormData()
            formData.append("logo", file)
            // Replace with actual API endpoint from JobMatch API doc
            const response = await fetch("/api/company/logo", {
                method: "POST",
                body: formData,
                credentials: "include",
            })
            const data = await response.json()
            if (response.ok && data.success && data.data?.logoUrl) {
                setCompanyData((prev) => ({ ...prev, logo: data.data.logoUrl }))
                toast({ title: "Logo uploaded", description: "Company logo updated successfully" })
            } else {
                toast({ variant: "destructive", title: "Error", description: data.message || "Failed to upload logo" })
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to upload logo" })
        } finally {
            setLogoUploading(false)
        }
    }

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">

            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your personal and company information</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 text-center">
                                <div className="relative inline-block mb-4">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} alt={profileData.fullName} />
                                        <AvatarFallback className="text-2xl">
                                            {profileData.fullName
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="sm"
                                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                                        onClick={() => {
                                            const input = document.createElement("input")
                                            input.type = "file"
                                            input.accept = "image/*"
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0]
                                                if (file) {
                                                    toast({
                                                        title: "Feature coming soon",
                                                        description: "Profile picture upload will be available soon",
                                                    })
                                                }
                                            }
                                            input.click()
                                        }}
                                    >
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{profileData.fullName}</h3>
                                <p className="text-muted-foreground text-sm mb-2">{profileData.email}</p>
                                <Badge variant="outline" className="mb-4">
                                    {user.role.roleName === "CANDIDATE" ? "Job Seeker" : "Recruiter"}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Profile Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList className={`grid w-full grid-cols-${user.role.roleName === "RECRUITER" ? 2 : 1}`}>
                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                {user.role.roleName === "RECRUITER" && <TabsTrigger value="company">Company</TabsTrigger>}
                            </TabsList>
                            {/* Personal Tab */}
                            <TabsContent value="personal">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your personal details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name</Label>
                                                <Input
                                                    id="fullName"
                                                    value={profileData.fullName}
                                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={profileData.email} disabled className="bg-muted" />
                                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={profileData.phoneNumber}
                                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={handleSaveProfile} disabled={isLoading}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {isLoading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* Company Tab (Recruiter only) */}
                            {user.role.roleName === "RECRUITER" && (
                                <TabsContent value="company">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Company Information</CardTitle>
                                            <CardDescription>Manage your company profile and details</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex flex-col items-center mb-4">
                                                <Avatar className="w-24 h-24">
                                                    <AvatarImage src={companyData.logo || "/placeholder.svg"} alt={companyData.name} />
                                                    <AvatarFallback className="text-2xl">
                                                        {companyData.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <Button
                                                    size="sm"
                                                    className="mt-2"
                                                    disabled={logoUploading}
                                                    onClick={() => {
                                                        const input = document.createElement("input")
                                                        input.type = "file"
                                                        input.accept = "image/*"
                                                        input.onchange = (e) => {
                                                            const file = (e.target as HTMLInputElement).files?.[0]
                                                            if (file) handleLogoUpload(file)
                                                        }
                                                        input.click()
                                                    }}
                                                >
                                                    {logoUploading ? "Uploading..." : "Change Logo"}
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="companyName">Company Name</Label>
                                                    <Input
                                                        id="companyName"
                                                        value={companyData.name}
                                                        onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                                        placeholder="e.g. TechCorp Inc."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="industry">Industry</Label>
                                                    <Input
                                                        id="industry"
                                                        value={companyData.industry}
                                                        onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                                                        placeholder="e.g. Technology"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="companyLocation">Location</Label>
                                                    <Input
                                                        id="companyLocation"
                                                        value={companyData.location}
                                                        onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                                                        placeholder="e.g. San Francisco, CA"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="companySize">Company Size</Label>
                                                    <Input
                                                        id="companySize"
                                                        value={companyData.size}
                                                        onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                                                        placeholder="e.g. 50-200 employees"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="companyWebsite">Website</Label>
                                                    <Input
                                                        id="companyWebsite"
                                                        value={companyData.website || ""}
                                                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                                                        placeholder="https://company.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="founded">Founded</Label>
                                                    <Input
                                                        id="founded"
                                                        value={companyData.founded || ""}
                                                        onChange={(e) => setCompanyData({ ...companyData, founded: e.target.value })}
                                                        placeholder="e.g. 2010"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="companyDescription">Company Description</Label>
                                                <Textarea
                                                    id="companyDescription"
                                                    value={companyData.description}
                                                    onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                                                    placeholder="Describe your company, mission, and values..."
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => {
                                                        toast({
                                                            title: "Feature coming soon",
                                                            description: "Company profile management will be available soon",
                                                        })
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Company Info
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    return (
        <RouteGuard requireAuth={true}>
            <ProfileContent />
        </RouteGuard>
    )
}
