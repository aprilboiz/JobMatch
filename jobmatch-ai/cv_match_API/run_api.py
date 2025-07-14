#!/usr/bin/env python3
"""
Script để chạy CV Job Matching API
"""
import uvicorn
import sys
import os

# Thêm thư mục hiện tại vào path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("🚀 Starting CV Job Matching API...")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("🔥 API Endpoint: http://localhost:8000/match")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
