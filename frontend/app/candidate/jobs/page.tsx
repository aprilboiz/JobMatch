"use client"

import { useState } from "react"
import CandidateLayout from "@/components/candidate-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Building, Clock, Star, Bookmark, SlidersHorizontal } from "lucide-react"

export default function CandidateJobs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [selectedSalary, setSelectedSalary] = useState("")
  const [selectedExperience, setSelectedExperience] = useState("")

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Vietnam",
      location: "Hà Nội",
      salary: "25-35 triệu",
      experience: "3-5 năm",
      type: "Full-time",
      matchScore: 95,
      postedAt: "2 ngày trước",
      description: "Tìm kiếm Senior Frontend Developer có kinh nghiệm với React, TypeScript...",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      saved: false,
    },
    {
      id: 2,
      title: "React Developer",
      company: "StartupXYZ",
      location: "TP.HCM",
      salary: "20-30 triệu",
      experience: "2-4 năm",
      type: "Full-time",
      matchScore: 92,
      postedAt: "1 tuần trước",
      description: "Cần React Developer để phát triển ứng dụng web hiện đại...",
      skills: ["React", "JavaScript", "CSS", "Redux"],
      saved: true,
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "BigTech Solutions",
      location: "Đà Nẵng",
      salary: "30-40 triệu",
      experience: "4-6 năm",
      type: "Full-time",
      matchScore: 88,
      postedAt: "3 ngày trước",
      description: "Tuyển Full Stack Developer có kinh nghiệm với cả frontend và backend...",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      saved: false,
    },
    {
      id: 4,
      title: "Frontend Developer (Remote)",
      company: "RemoteFirst Co",
      location: "Remote",
      salary: "18-25 triệu",
      experience: "1-3 năm",
      type: "Remote",
      matchScore: 85,
      postedAt: "5 ngày trước",
      description: "Cơ hội làm việc remote cho Frontend Developer...",
      skills: ["Vue.js", "JavaScript", "CSS", "Git"],
      saved: false,
    },
    {
      id: 5,
      title: "Junior React Developer",
      company: "GrowthTech",
      location: "Hà Nội",
      salary: "12-18 triệu",
      experience: "0-2 năm",
      type: "Full-time",
      matchScore: 82,
      postedAt: "1 tuần trước",
      description: "Tuyển Junior React Developer để tham gia team phát triển sản phẩm...",
      skills: ["React", "JavaScript", "HTML", "CSS"],
      saved: true,
    },
    {
      id: 6,
      title: "Lead Frontend Engineer",
      company: "Enterprise Corp",
      location: "TP.HCM",
      salary: "40-60 triệu",
      experience: "5+ năm",
      type: "Full-time",
      matchScore: 78,
      postedAt: "4 ngày trước",
      description: "Tìm kiếm Lead Frontend Engineer để dẫn dắt team phát triển...",
      skills: ["React", "TypeScript", "Leadership", "Architecture"],
      saved: false,
    },
  ]

  const savedJobs = jobs.filter((job) => job.saved)
  const recommendedJobs = jobs.filter((job) => job.matchScore >= 85)

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  const JobCard = ({ job }: { job: (typeof jobs)[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {job.postedAt}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className={`h-4 w-4 mr-1 ${getMatchScoreColor(job.matchScore)}`} />
              <span className={`text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>{job.matchScore}%</span>
            </div>
            <Button variant="ghost" size="sm">
              <Bookmark className={`h-4 w-4 ${job.saved ? "fill-current text-blue-600" : ""}`} />
            </Button>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Mức lương</div>
            <div className="font-semibold text-green-600">{job.salary}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">Kinh nghiệm</div>
            <div className="font-medium">{job.experience}</div>
          </div>
          <div className="space-y-1">
            <Badge variant={job.type === "Remote" ? "default" : "outline"}>{job.type}</Badge>
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button className="flex-1">Ứng tuyển ngay</Button>
          <Button variant="outline">Xem chi tiết</Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <CandidateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tìm việc làm</h1>
          <p className="text-gray-600">Khám phá các cơ hội nghề nghiệp phù hợp với bạn</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo vị trí, công ty, kỹ năng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP.HCM</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSalary} onValueChange={setSelectedSalary}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mức lương" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-15">Dưới 15 triệu</SelectItem>
                    <SelectItem value="15-25">15-25 triệu</SelectItem>
                    <SelectItem value="25-35">25-35 triệu</SelectItem>
                    <SelectItem value="over-35">Trên 35 triệu</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 năm</SelectItem>
                    <SelectItem value="1-3">1-3 năm</SelectItem>
                    <SelectItem value="3-5">3-5 năm</SelectItem>
                    <SelectItem value="5+">5+ năm</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Bộ lọc nâng cao
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả việc làm ({jobs.length})</TabsTrigger>
            <TabsTrigger value="recommended">Phù hợp ({recommendedJobs.length})</TabsTrigger>
            <TabsTrigger value="saved">Đã lưu ({savedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Hiển thị {jobs.length} việc làm</p>
              <Select defaultValue="match">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Độ phù hợp cao nhất</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="salary">Lương cao nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommended" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị {recommendedJobs.length} việc làm phù hợp (≥85% matching)
              </p>
            </div>
            <div className="grid gap-4">
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Hiển thị {savedJobs.length} việc làm đã lưu</p>
            </div>
            {savedJobs.length > 0 ? (
              <div className="grid gap-4">
                {savedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có việc làm nào được lưu</h3>
                  <p className="text-gray-600">Lưu các việc làm yêu thích để xem lại sau</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CandidateLayout>
  )
}
