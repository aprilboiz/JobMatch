'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Trash2, Plus } from "lucide-react";
import { candidateService, CvResponse } from '../../lib/services/candidate';

const CvManager: React.FC = () => {
  const [cvs, setCvs] = useState<CvResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load CVs khi component mount
  useEffect(() => {
    loadCvs();
  }, []);

  const loadCvs = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getAllCvs();
      setCvs(data);
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload CV
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    alert('Chỉ chấp nhận file PDF, DOC, DOCX');
    return;
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File không được vượt quá 5MB');
    return;
  }

  try {
    setUploading(true);
    
    // Gọi service với proper error handling
    const result = await candidateService.uploadCv(file);
    console.log('Upload result:', result);
    
    // Reload danh sách CV
    await loadCvs();
    
    alert('Upload CV thành công!');
  } catch (error: unknown) {
    console.error('Upload error:', error);
    
    // Xử lý các loại lỗi khác nhau
    if (error instanceof Error) {
      alert(`Upload thất bại: ${error.message}`);
    } else {
      alert('Upload CV thất bại! Vui lòng thử lại.');
    }
  } finally {
    setUploading(false);
    // Reset input
    event.target.value = '';
  }
};
  // Download CV
  const handleDownload = async (cv: CvResponse) => {
    try {
      const blob = await candidateService.downloadCv(cv.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Download thất bại!');
    }
  };

  // Delete CV
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa CV này?')) return;

    try {
      await candidateService.deleteCv(id);
      await loadCvs(); // Reload danh sách
      alert('Xóa CV thành công!');
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('Xóa CV thất bại!');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <CardTitle className="flex items-center justify-between">
          <span>Quản lý CV</span>
          <div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="cv-upload"
              disabled={uploading}
            />
            <label htmlFor="cv-upload">
              <Button asChild disabled={uploading}>
                <span className="cursor-pointer">
                  {uploading ? (
                    <>Đang upload...</>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload CV
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </CardTitle>
        <CardDescription>
          Quản lý các file CV của bạn. Hỗ trợ PDF, DOC, DOCX (tối đa 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cvs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có CV nào được upload</p>
            <p className="text-sm text-gray-400">Upload CV đầu tiên để bắt đầu ứng tuyển</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cvs.map((cv) => (
              <div key={cv.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{cv.fileName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Kích thước: {formatFileSize(cv.fileSize)}</span>
                      <span>Upload: {new Date(cv.uploadDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(cv)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cv.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CvManager;
