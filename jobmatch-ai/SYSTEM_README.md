# 🚀 CV Job Matching System - Complete Setup

## 📁 Project Structure

```
d:\logs\
├── cv_match_API/                 # Backend API (FastAPI)
│   ├── main.py                   # Main API server
│   ├── document_processor.py     # File processing
│   ├── model/                    # AI models
│   └── requirements.txt          # Python dependencies
│
├── cv-matching-frontend/         # Frontend (Next.js)
│   ├── app/                      # Next.js app directory
│   ├── lib/                      # Utilities and API client
│   ├── package.json              # Node.js dependencies
│   └── README.md                 # Frontend documentation
│
└── launch_system.bat            # Full system launcher
```

## 🎯 Features

### Backend API Features:

- 📄 **Multi-format file support**: PDF, DOCX, DOC, TXT
- 🤖 **Dual AI models**: Doc2Vec + SentenceTransformer
- 📊 **Smart scoring**: Weighted combination with confidence levels
- 🔄 **Flexible input**: File upload or direct text input
- 🛡️ **Error handling**: Robust fallback mechanisms

### Frontend Features:

- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 📁 **Drag & drop**: Easy file upload interface
- 📝 **Text input**: Alternative to file upload
- 📊 **Visual results**: Beautiful score visualization
- 🎯 **Real-time**: Instant matching results
- 📱 **Mobile friendly**: Works on all devices

## 🚀 Quick Start

### Option 1: Full System Launch (Recommended)

```bash
# Double-click or run:
launch_system.bat
```

This will:

1. ✅ Check system requirements
2. 🤖 Start Backend API on `http://localhost:8000`
3. 🌐 Start Frontend on `http://localhost:3000`
4. 📖 Open API documentation

### Option 2: Manual Setup

#### Backend Setup:

```bash
cd cv_match_API
pip install -r requirements.txt
python main.py
```

#### Frontend Setup:

```bash
cd cv-matching-frontend
npm install
npm run dev
```

## 📖 Usage Guide

### 1. **Open the Application**

- Navigate to `http://localhost:3000`
- You'll see the CV Job Matching interface

### 2. **Choose Input Method**

**📁 File Upload Mode:**

- Click "📁 File Upload" tab
- Upload CV file (PDF, DOCX, DOC, TXT)
- Upload Job Description file
- Click "⚡ Get Matching Score"

**📝 Text Input Mode:**

- Click "📝 Text Input" tab
- Paste CV content in left textarea
- Paste Job Description in right textarea
- Click "⚡ Get Matching Score"

### 3. **Interpret Results**

**🎯 Overall Score:**

- 🔴 **0-50%**: Low match - CV needs significant modification
- 🟡 **50-70%**: Good match - some improvements recommended
- 🟢 **70-100%**: Excellent match - ready to submit

**📊 Detailed Scores:**

- **Doc2Vec Score**: Traditional document similarity
- **SBERT Score**: Modern semantic understanding
- **ML Score**: Machine learning prediction (if available)

**🎭 Confidence Levels:**

- 🟢 **High**: Both methods agree closely
- 🟡 **Medium**: Some difference between methods
- 🔴 **Low**: Large discrepancy, review recommended

## 🛠️ API Endpoints

The backend provides these endpoints:

- `GET /` - Welcome message and API info
- `GET /health` - System health check
- `GET /dependencies` - Check file processing capabilities
- `POST /upload` - Extract text from uploaded file
- `POST /match` - Match CV and JD texts
- `POST /match-files` - Match using file uploads
- `POST /analyze` - Detailed matching analysis

📖 **Full API Documentation**: `http://localhost:8000/docs`

## 🔧 Configuration

### Backend Configuration:

- **Model paths**: Update paths in `main.py` if needed
- **CORS settings**: Modify for production deployment
- **File size limits**: Adjust in FastAPI settings

### Frontend Configuration:

- **API URL**: Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- **Styling**: Customize in `tailwind.config.js`
- **Timeout**: Adjust in `lib/api.ts`

## 📊 Technical Details

### AI Models:

1. **Doc2Vec**:

   - Trained on NYC Jobs 2020 dataset
   - 50-dimensional vectors
   - Good for job-specific terminology

2. **SentenceTransformer**:

   - Pre-trained 'all-MiniLM-L6-v2' model
   - 384-dimensional vectors
   - Excellent semantic understanding

3. **Scoring Algorithm**:
   - Weighted combination (30% Doc2Vec + 70% SBERT)
   - Fallback to SBERT if large discrepancy
   - Confidence calculation based on agreement

### File Processing:

- **PDF**: PyPDF2 + PyMuPDF fallback
- **DOCX**: python-docx + docx2txt fallback
- **DOC**: win32com (Windows only)
- **TXT**: Direct reading with UTF-8 encoding

## 🚨 Troubleshooting

### Common Issues:

1. **"Cannot connect to API"**

   - ✅ Ensure backend is running on `http://localhost:8000`
   - ✅ Check firewall settings
   - ✅ Verify no other service is using port 8000

2. **"File upload failed"**

   - ✅ Check file format is supported
   - ✅ Verify file is not corrupted
   - ✅ Try alternative file processing method

3. **"Low matching scores"**

   - ✅ Ensure CV and JD are in same language
   - ✅ Check for typos and formatting issues
   - ✅ Use relevant keywords from job description

4. **"Dependencies missing"**
   - ✅ Run `pip install -r requirements.txt` for backend
   - ✅ Run `npm install` for frontend
   - ✅ Check `http://localhost:8000/dependencies` for file support

### Debug Mode:

- **Backend logs**: Check the API terminal window
- **Frontend logs**: Open browser developer tools
- **Health check**: Visit `http://localhost:8000/health`

## 🔒 Security Notes

- This is a development setup - not production ready
- File uploads are processed locally
- No authentication implemented
- CORS is open for development

## 🎨 Customization

### Styling:

- Modify `app/globals.css` for custom styles
- Update `tailwind.config.js` for theme changes
- Add new components in `app/components/`

### Features:

- Add new endpoints in `main.py`
- Extend file processing in `document_processor.py`
- Create new pages in `app/`

## 📈 Performance

### Optimization Tips:

- Use SSD for faster file processing
- Increase RAM for larger documents
- Consider model quantization for speed
- Implement caching for repeated requests

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is for educational and research purposes.

---

**🎉 Enjoy using the CV Job Matching System!**

For questions or issues, check the troubleshooting section or review the code documentation.
