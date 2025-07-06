"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Building2, DollarSign, Users, Briefcase, Star } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const { user, isAuthenticated } = useAuth()

  // Mock data - in real app this would come from the backend API
  const featuredJobs = [
    {
      id: 1,
      title: "Senior Java Developer",
      company: "TechNova Solutions",
      location: "San Francisco, CA (Hybrid)",
      salary: "$90,000 - $120,000",
      type: "FULL_TIME",
      description: "We are looking for an experienced Java Developer to join our team...",
      postedDate: "2 days ago",
      applicants: 24,
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "TechNova Solutions",
      location: "San Francisco, CA (Hybrid)",
      salary: "$85,000",
      type: "FULL_TIME",
      description: "Join our design team to create intuitive user experiences...",
      postedDate: "1 day ago",
      applicants: 18,
    },
    {
      id: 3,
      title: "Financial Software Developer",
      company: "Quantum Financial",
      location: "New York, NY (Hybrid)",
      salary: "$100,000 - $140,000",
      type: "FULL_TIME",
      description: "Seeking a developer with experience in financial systems...",
      postedDate: "3 days ago",
      applicants: 31,
    },
  ]

  const stats = [
    { label: "Active Jobs", value: "1,250+", icon: Briefcase },
    { label: "Companies", value: "350+", icon: Building2 },
    { label: "Candidates", value: "15,000+", icon: Users },
    { label: "Success Rate", value: "94%", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40">
      {/* Hero Section */}
      <section className="container py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Find Your Dream Job
            <span className="block bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Match Your Future
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with top companies and discover opportunities that match your skills, experience, and career goals.
            Your next career move starts here.
          </p>

          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto mb-16 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Job title or keywords"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Job Type" />
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
                  <Link href="/jobs">Search Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Opportunities</h2>
            <p className="text-xl text-muted-foreground">Discover the latest job openings from top companies</p>
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
                      <span className="text-sm">{job.applicants} applicants</span>
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
                      Apply Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/jobs">View All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of professionals who have found their dream jobs through JobMatch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/register?role=candidate">Find Jobs</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                  asChild
                >
                  <Link href="/register?role=recruiter">Post Jobs</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
