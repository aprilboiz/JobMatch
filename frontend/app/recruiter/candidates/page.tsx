import RecruiterLayout from "@/components/recruiter-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, Download, Eye, Calendar, MapPin, Briefcase, GraduationCap, Phone, Mail } from "lucide-react"

export default function RecruiterCandidates() {
  const candidates = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      position: "Senior Frontend Developer",
      location: "Hà Nội",
      experience: "5 năm",
      education: "Đại học Bách Khoa",
      matchScore: 95,
      appliedAt: "2024-01-15",
      status: "Mới ứng tuyển",
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      salary: "25-35 triệu",
      summary: "Frontend Developer với 5 năm kinh nghiệm, chuyên về React ecosystem và có kinh nghiệm lead team nhỏ.",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      position: "Product Manager",
      location: "TP.HCM",
      experience: "4 năm",
      education: "Đại học Kinh tế",
      matchScore: 92,
      appliedAt: "2024-01-14",
      status: "Đã phỏng vấn",
      skills: ["Product Management", "Agile", "Analytics", "Leadership", "SQL"],
      salary: "30-45 triệu",
      summary: "Product Manager có kinh nghiệm trong việc phát triển sản phẩm B2B và B2C, thành thạo data analysis.",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369852147",
      position: "UX Designer",
      location: "Remote",
      experience: "3 năm",
      education: "Đại học Mỹ thuật",
      matchScore: 88,
      appliedAt: "2024-01-13",
      status: "Chờ phỏng vấn",
      skills: ["UX Design", "Figma", "User Research", "Prototyping", "Design System"],
      salary: "20-30 triệu",
      summary: "UX Designer với portfolio mạnh về mobile app design và có kinh nghiệm user research.",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@email.com",
      phone: "0147258369",
      position: "Backend Developer",
      location: "Đà Nẵng",
      experience: "3 năm",
      education: "Đại học FPT",
      matchScore: 85,
      appliedAt: "2024-01-12",
      status: "Mới ứng tuyển",
      skills: ["Node.js", "Python", "MongoDB", "PostgreSQL", "Docker"],
      salary: "22-32 triệu",
      summary: "Backend Developer có kinh nghiệm xây dựng API và microservices, thành thạo cloud technologies.",
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@email.com",
      phone: "0258147369",
      position: "DevOps Engineer",
      location: "Hà Nội",
      experience: "4 năm",
      education: "Đại học Công nghệ",
      matchScore: 90,
      appliedAt: "2024-01-11",
      status: "Đã từ chối",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      salary: "28-38 triệu",
      summary: "DevOps Engineer có kinh nghiệm triển khai và vận hành hệ thống trên cloud platform.",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Mới ứng tuyển":
        return "default"
      case "Đã phỏng vấn":
        return "secondary"
      case "Chờ phỏng vấn":
        return "outline"
      case "Đã từ chối":
        return "destructive"
      case "Đã tuyển":
        return "default"
      default:
        return "secondary"
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-gray-600"
  }

  const newCandidates = candidates.filter((c) => c.status === "Mới ứng tuyển")
  const interviewCandidates = candidates.filter((c) => ["Đã phỏng vấn", "Chờ phỏng vấn"].includes(c.status))
  const processedCandidates = candidates.filter((c) => ["Đã từ chối", "Đã tuyển"].includes(c.status))

  const CandidateCard = ({ candidate }: { candidate: (typeof candidates)[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-lg font-medium text-white">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-blue-600 font-medium">{candidate.position}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {candidate.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {candidate.experience}
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {candidate.education}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Star className={`h-4 w-4 mr-1 ${getMatchScoreColor(candidate.matchScore)}`} />
              <span className={`text-sm font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                {candidate.matchScore}%
              </span>
            </div>
            <Badge variant={getStatusColor(candidate.status)}>{candidate.status}</Badge>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{candidate.summary}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {candidate.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {candidate.skills.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{candidate.skills.length - 5}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-600">Mức lương mong muốn</div>
            <div className="font-semibold text-green-600">{candidate.salary}</div>
          </div>
          <div>
            <div className="text-gray-600">Ngày ứng tuyển</div>
            <div className="font-medium">{candidate.appliedAt}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {candidate.email}
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {candidate.phone}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Xem CV
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Phỏng vấn
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Tải CV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
          <p className="text-gray-600">Xem và đánh giá các ứng viên đã nộp CV</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Tìm kiếm theo tên, vị trí, kỹ năng..." className="pl-10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Vị trí ứng tuyển" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend Developer</SelectItem>
                    <SelectItem value="backend">Backend Developer</SelectItem>
                    <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                    <SelectItem value="product">Product Manager</SelectItem>
                    <SelectItem value="design">UX Designer</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
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

                <Select>
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

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Độ phù hợp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90+">90%+</SelectItem>
                    <SelectItem value="80-89">80-89%</SelectItem>
                    <SelectItem value="70-79">70-79%</SelectItem>
                    <SelectItem value="under-70">Dưới 70%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
              <div className="text-sm text-gray-600">Tổng ứng viên</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{newCandidates.length}</div>
              <div className="text-sm text-gray-600">Mới ứng tuyển</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{interviewCandidates.length}</div>
              <div className="text-sm text-gray-600">Phỏng vấn</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)}%
              </div>
              <div className="text-sm text-gray-600">Độ phù hợp TB</div>
            </CardContent>
          </Card>
        </div>

        {/* Candidates Tabs */}
        <Tabs defaultValue="new" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">Mới ứng tuyển ({newCandidates.length})</TabsTrigger>
            <TabsTrigger value="interview">Phỏng vấn ({interviewCandidates.length})</TabsTrigger>
            <TabsTrigger value="processed">Đã xử lý ({processedCandidates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Hiển thị {newCandidates.length} ứng viên mới</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất danh sách
                </Button>
                <Select defaultValue="match">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Độ phù hợp cao nhất</SelectItem>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="experience">Kinh nghiệm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newCandidates.length > 0 ? (
              <div className="space-y-4">
                {newCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ứng viên mới</h3>
                  <p className="text-gray-600">Ứng viên mới sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="interview" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị {interviewCandidates.length} ứng viên trong quá trình phỏng vấn
              </p>
            </div>
            {interviewCandidates.length > 0 ? (
              <div className="space-y-4">
                {interviewCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có ứng viên nào trong quá trình phỏng vấn
                  </h3>
                  <p className="text-gray-600">Ứng viên đang phỏng vấn sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Hiển thị {processedCandidates.length} ứng viên đã xử lý</p>
            </div>
            {processedCandidates.length > 0 ? (
              <div className="space-y-4">
                {processedCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ứng viên nào được xử lý</h3>
                  <p className="text-gray-600">Ứng viên đã xử lý sẽ hiển thị ở đây</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RecruiterLayout>
  )
}
