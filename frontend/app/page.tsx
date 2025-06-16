import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, Search, FileText, Star, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">JobMatch</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Đăng nhập</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Đăng ký</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Kết nối tài năng với cơ hội</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Nền tảng tuyển dụng thông minh sử dụng AI để đánh giá độ phù hợp giữa ứng viên và vị trí công việc
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=candidate">
              <Button size="lg" className="w-full sm:w-auto">
                <Users className="mr-2 h-5 w-5" />
                Tôi là ứng viên
              </Button>
            </Link>
            <Link href="/auth/register?role=recruiter">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Building2 className="mr-2 h-5 w-5" />
                Tôi là nhà tuyển dụng
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-lg text-gray-600">Công nghệ AI giúp tối ưu hóa quá trình tuyển dụng</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Tìm kiếm thông minh</CardTitle>
                <CardDescription>AI phân tích và gợi ý công việc phù hợp với kỹ năng của bạn</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Đánh giá độ phù hợp</CardTitle>
                <CardDescription>Hệ thống tính toán điểm matching giữa CV và JD một cách chính xác</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Quản lý CV dễ dàng</CardTitle>
                <CardDescription>Upload CV dạng PDF, DOCX hoặc tạo CV trực tuyến</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Thống kê chi tiết</CardTitle>
                <CardDescription>Theo dõi hiệu quả tuyển dụng và ứng tuyển</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Giao diện thân thiện</CardTitle>
                <CardDescription>Thiết kế responsive, dễ sử dụng trên mọi thiết bị</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Building2 className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Quản lý công ty</CardTitle>
                <CardDescription>Công cụ quản lý thông tin công ty và JD hiệu quả</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bắt đầu hành trình của bạn ngay hôm nay</h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn ứng viên và nhà tuyển dụng đã tin tưởng JobMatch
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              Đăng ký miễn phí
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Building2 className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-2xl font-bold">JobMatch</span>
          </div>
          <p className="text-center text-gray-400 mt-4">© 2024 JobMatch. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
