'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Star } from "lucide-react";
import { candidateService, ApplicationResponse } from '../../lib/services/candidate';

const ApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getAllApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sửa function getStatusColor - chỉ sử dụng variant có sẵn
  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'đang xem xét':
        return 'secondary';
      case 'interview':
      case 'phỏng vấn':
        return 'default';
      case 'accepted':
      case 'được chấp nhận':
        return 'default'; // Thay 'success' bằng 'default'
      case 'rejected':
      case 'từ chối':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Thêm function để lấy màu text tùy chỉnh
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'được chấp nhận':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'interview':
      case 'phỏng vấn':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'pending':
      case 'đang xem xét':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'rejected':
      case 'từ chối':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Đang tải...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn ứng tuyển của tôi</CardTitle>
        <CardDescription>
          Theo dõi trạng thái các đơn ứng tuyển đã gửi
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có đơn ứng tuyển nào</p>
            <p className="text-sm text-gray-400">Bắt đầu ứng tuyển để theo dõi tiến trình</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {application.companyName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(application.appliedDate).toLocaleDateString('vi-VN')}
                    </div>
                    {application.matchingScore && (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        {application.matchingScore}% phù hợp
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sử dụng Badge với custom style */}
                <Badge 
                  variant={getStatusColor(application.status)}
                  className={getStatusStyle(application.status)}
                >
                  {application.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationsList;
