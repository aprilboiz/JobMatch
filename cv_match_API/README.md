# CV Job Matching API

API để matching CV với Job Description sử dụng Doc2Vec và SentenceTransformer.

## 🚀 Tính năng

- **Dual Method Matching**: Hỗ trợ cả Doc2Vec và SentenceTransformer
- **Text Preprocessing**: Xử lý văn bản tương tự như trong notebook gốc
- **Flexible API**: Có thể chọn phương pháp matching (doc2vec, sbert, hoặc both)
- **Smart Recommendations**: Đưa ra gợi ý dựa trên điểm số matching
- **CORS Support**: Hỗ trợ gọi từ frontend
- **Error Handling**: Xử lý lỗi và fallback tốt

## 📋 Yêu cầu

```bash
pip install -r requiments.txt
```

## 🏃‍♂️ Chạy API

```bash
python run_api.py
```

API sẽ chạy tại: `http://localhost:8000`

## 📖 API Documentation

Truy cập: `http://localhost:8000/docs` để xem Swagger UI

## 🧪 Test API

```bash
python test_api.py
```

## 📡 Endpoints

### 1. Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "doc2vec_model": true,
  "sbert_model": true,
  "lr_model": true
}
```

### 2. Match CV với Job Description

```
POST /match
```

**Request Body:**

```json
{
  "jd_text": "Job description text here...",
  "cv_text": "CV text here...",
  "method": "both" // "doc2vec", "sbert", or "both"
}
```

**Response:**

```json
{
  "similarity_score": 75.23,
  "match_score": 82.45,
  "doc2vec_similarity": 73.21,
  "sbert_similarity": 77.25,
  "recommendation": "Excellent! You can submit your CV.",
  "method_used": "doc2vec+sbert"
}
```

## 🔧 Cách hoạt động

1. **Text Preprocessing**: Loại bỏ ký tự đặc biệt, số, chuyển về lowercase
2. **Doc2Vec Matching**: Sử dụng model đã train từ NYC Jobs dataset
3. **SentenceTransformer Matching**: Sử dụng 'all-MiniLM-L6-v2' model
4. **Score Combination**: Kết hợp điểm từ cả hai phương pháp
5. **Recommendation**: Đưa ra gợi ý dựa trên ngưỡng điểm

## 🎯 Ngưỡng điểm

- **< 50%**: "Low chance, need to modify your CV!"
- **50-70%**: "Good chance but you can improve further!"
- **> 70%**: "Excellent! You can submit your CV."

## 🔍 Ví dụ sử dụng

### Python

```python
import requests

response = requests.post("http://localhost:8000/match", json={
    "jd_text": "Looking for Python developer with 3 years experience",
    "cv_text": "Software Engineer with 5 years Python experience",
    "method": "both"
})

print(response.json())
```

### cURL

```bash
curl -X POST "http://localhost:8000/match" \
  -H "Content-Type: application/json" \
  -d '{
    "jd_text": "Looking for Python developer",
    "cv_text": "Python developer with experience",
    "method": "both"
  }'
```

## 🛠️ Troubleshooting

### Model không load được

- Kiểm tra path của model file
- Đảm bảo model file tồn tại
- Kiểm tra quyền truy cập file

### API không khởi động được

- Kiểm tra port 8000 có bị chiếm không
- Cài đặt đầy đủ dependencies
- Kiểm tra Python version (>= 3.7)

### Kết quả matching không chính xác

- Kiểm tra quality của CV và JD input
- Thử các method khác nhau
- Xem xét việc retrain model với data mới

## 📁 Cấu trúc thư mục

```
cv_match_API/
├── main.py              # API chính
├── run_api.py           # Script chạy API
├── test_api.py          # Script test API
├── requiments.txt       # Dependencies
├── README.md           # Hướng dẫn này
└── model/
    └── cv_job_maching.model  # Trained model
```

## 🤝 Contribute

Để cải thiện API, bạn có thể:

1. Thêm các phương pháp matching mới
2. Cải thiện text preprocessing
3. Tối ưu hóa performance
4. Thêm logging và monitoring

## 📝 License

MIT License - Xem file LICENSE để biết chi tiết.
