"use client"

import { useState } from "react"
import type { ElementType } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Building2, DollarSign, Users, Briefcase, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { t } from "@/lib/i18n-client"
import type { Dictionary } from "@/lib/types"

const iconMap: { [key: string]: ElementType } = {
    Briefcase,
    Building2,
    Users,
    Star,
}

interface HomeHeroProps {
    featuredJobs: {
        id: number
        title: string
        company: string
        location: string
        salary: string
        type: string
        description: string
        postedDate: string
        applicants: number
    }[]
    stats: { label: string; value: string; icon: string }[]
    dictionary: Dictionary
}

export default function HomeHero({ featuredJobs, stats, dictionary }: HomeHeroProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [location, setLocation] = useState("")
    const [jobType, setJobType] = useState("")
    const { user, isAuthenticated } = useAuth()

    return (
        <>
            {/* Hero Section */}
            <section className="container py-20">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                        {t(dictionary, 'message.homeWelcomeFirst')}
                        <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                            {t(dictionary, 'message.homeWelcomeSecond')}
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                        {t(dictionary, 'message.homeDescription')}
                    </p>

                    {/* Search Bar */}
                    <Card className="max-w-4xl mx-auto mb-16 shadow-lg">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder={t(dictionary, 'message.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder={t(dictionary, 'message.locationPlaceholder')}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="pl-10 h-12"
                                    />
                                </div>
                                <Select value={jobType} onValueChange={setJobType}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder={t(dictionary, 'message.jobTypePlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                        <SelectItem value="REMOTE">Remote</SelectItem>
                                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button className="h-12" size="lg" asChild>
                                    <Link href="/jobs">{t(dictionary, 'button.search')}</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                        {stats.map((stat, index) => {
                            const Icon = iconMap[stat.icon]
                            return (
                                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="p-6 text-center">
                                        {Icon && <Icon className="w-8 h-8 text-primary mx-auto mb-3" />}
                                        <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                                        <div className="text-muted-foreground">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-foreground mb-4">{t(dictionary, 'message.featuredOpportunities')}</h2>
                        <p className="text-xl text-muted-foreground">{t(dictionary, 'message.featuredOpportunitiesDescription')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredJobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-lg transition-all duration-300 group">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary">{job.type.replace("_", " ")}</Badge>
                                        <span className="text-sm text-muted-foreground">{job.postedDate}</span>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{job.title}</CardTitle>
                                    <CardDescription className="flex items-center">
                                        <Building2 className="w-4 h-4 mr-1" />
                                        {job.company}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-muted-foreground">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{job.location}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            <span className="text-sm font-medium">{job.salary}</span>
                                        </div>
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{job.applicants} {t(dictionary, 'message.applicants')}</span>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{job.description}</p>
                                    <Button className="w-full" asChild>
                                        <Link
                                            href={
                                                isAuthenticated
                                                    ? `/jobs/${job.id}/apply`
                                                    : `/login?redirect=${encodeURIComponent(`/jobs/${job.id}/apply`)}`
                                            }
                                        >
                                            {t(dictionary, 'button.apply')}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/jobs">{t(dictionary, 'nav.viewAllJobs')}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
} 