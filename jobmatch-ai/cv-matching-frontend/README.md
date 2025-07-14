# CV Job Matching Frontend

A modern Next.js frontend for the CV Job Matching AI system.

## Features

- 📁 **File Upload**: Support for PDF, DOCX, DOC, TXT files
- 📝 **Text Input**: Direct text input for CV and Job Description
- 🤖 **AI Matching**: Real-time CV-JD matching with multiple algorithms
- 📊 **Visual Results**: Beautiful score visualization with confidence levels
- 🎨 **Modern UI**: Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- CV Matching API running on `http://localhost:8000`

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Usage

### File Upload Mode

1. Click "📁 File Upload" tab
2. Upload your CV file (PDF, DOCX, DOC, TXT)
3. Upload Job Description file
4. Click "⚡ Get Matching Score"

### Text Input Mode

1. Click "📝 Text Input" tab
2. Paste CV content in left textarea
3. Paste Job Description in right textarea
4. Click "⚡ Get Matching Score"

## API Integration

The frontend connects to the CV Matching API at `http://localhost:8000`:

- `POST /upload` - Extract text from uploaded files
- `POST /match` - Get matching score between CV and JD

## Results Display

The application shows:

- **Overall Match Score** - Circular progress indicator
- **Individual Scores** - Doc2Vec, SentenceTransformer, ML scores
- **Recommendation** - AI-generated advice
- **Confidence Level** - High/Medium/Low confidence
- **Method Reliability** - Explanation of scoring method

## Score Interpretation

- **🔴 0-50%**: Low match - CV needs modification
- **🟡 50-70%**: Good match - room for improvement
- **🟢 70-100%**: Excellent match - ready to submit

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Backend**: FastAPI (CV Matching API)

## Project Structure

```
cv-matching-frontend/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page component
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── next.config.js       # Next.js configuration
```

## Environment Variables

Create `.env.local` for custom API URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

### Common Issues

1. **API Connection Error**

   - Ensure CV Matching API is running on `http://localhost:8000`
   - Check CORS settings in API

2. **File Upload Fails**

   - Verify file format is supported (PDF, DOCX, DOC, TXT)
   - Check file size limits

3. **Styling Issues**
   - Run `npm run build` to regenerate Tailwind CSS

### Development Tips

- Use browser dev tools to inspect API calls
- Check console for JavaScript errors
- Verify API endpoints are accessible

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is part of the CV Job Matching AI system.
