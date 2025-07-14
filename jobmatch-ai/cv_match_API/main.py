import os
import re
import shutil
import tempfile
from typing import Optional

import joblib
import numpy as np
from document_processor import DocumentProcessor, check_dependencies, extract_text
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from gensim.models.doc2vec import Doc2Vec
from numpy.linalg import norm
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Khởi tạo app
app = FastAPI(
    title="CV Job Matching API",
    description="API để matching CV với Job Description sử dụng Doc2Vec và SentenceTransformer",
    version="1.0.0",
)

# Thêm CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mô hình và encoder
try:
    # Load Doc2Vec model
    doc2vec_model_path = r"model/cv_job_maching.model"
    if os.path.exists(doc2vec_model_path):
        # Try loading as Doc2Vec first
        try:
            doc2vec_model = Doc2Vec.load(doc2vec_model_path)
            print("✅ Doc2Vec model loaded successfully")
        except Exception as e:
            print(f"⚠️ Failed to load Doc2Vec model: {e}")
            print("⚠️ Will use SentenceTransformer only")
            doc2vec_model = None
    else:
        print("⚠️ Doc2Vec model not found, will use SentenceTransformer only")
        doc2vec_model = None

    # Load SentenceTransformer model
    sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
    print("✅ SentenceTransformer model loaded successfully")

    # Load Logistic Regression model (nếu có) - use different path
    lr_model_path = r"model/logistic_regression.model"
    try:
        if os.path.exists(lr_model_path):
            lr_model = joblib.load(lr_model_path)
            print("✅ Logistic Regression model loaded successfully")
        else:
            print("⚠️ Logistic Regression model not found, will use similarity score only")
            lr_model = None
    except Exception as e:
        print(f"⚠️ Logistic Regression model loading failed: {e}")
        lr_model = None

except Exception as e:
    print(f"❌ Error loading models: {e}")
    doc2vec_model = None
    sbert_model = None
    lr_model = None

# Khởi tạo Document Processor
doc_processor = DocumentProcessor()


# Text preprocessing function
def preprocess_text(text: str) -> str:
    """
    Xử lý văn bản đầu vào giống như trong notebook
    """
    # Convert the text to lowercase
    text = text.lower()

    # Remove punctuation from the text
    text = re.sub("[^a-z]", " ", text)

    # Remove numerical values from the text
    text = re.sub(r"\d+", "", text)

    # Remove extra whitespaces
    text = " ".join(text.split())

    return text


# Khai báo input schema
class JD_CV_Input(BaseModel):
    jd_text: str
    cv_text: str
    method: Optional[str] = "both"  # "doc2vec", "sbert", "both"


class MatchingResult(BaseModel):
    similarity_score: float
    match_score: Optional[float] = None
    doc2vec_similarity: Optional[float] = None
    sbert_similarity: Optional[float] = None
    recommendation: str
    method_used: str
    confidence_level: str  # "high", "medium", "low"
    method_reliability: str  # Thông tin về độ tin cậy
    match_skills: Optional[str] = None  # Skills that match between CV and JD
    missing_skills: Optional[str] = None  # Skills missing from CV that are required for JD


class FileUploadResult(BaseModel):
    filename: str
    file_size: int
    file_type: str
    extracted_text: str
    word_count: int
    processing_success: bool
    error_message: Optional[str] = None


# Endpoint chính
@app.post("/match", response_model=MatchingResult)
def match_cv_jd(data: JD_CV_Input):
    """
    Matching CV với Job Description sử dụng Doc2Vec và/hoặc SentenceTransformer
    """
    try:
        # Preprocess input texts
        cv_processed = preprocess_text(data.cv_text)
        jd_processed = preprocess_text(data.jd_text)

        doc2vec_similarity = None
        sbert_similarity = None
        final_similarity = 0
        method_used = []

        # Method 1: Doc2Vec (từ notebook)
        if data.method in ["doc2vec", "both"] and doc2vec_model is not None:
            try:
                v1 = doc2vec_model.infer_vector(cv_processed.split())
                v2 = doc2vec_model.infer_vector(jd_processed.split())
                doc2vec_similarity = (
                    100 * (np.dot(np.array(v1), np.array(v2))) / (norm(np.array(v1)) * norm(np.array(v2)))
                )
                method_used.append("doc2vec")
            except Exception as e:
                print(f"Doc2Vec error: {e}")
                doc2vec_similarity = None

        # Method 2: SentenceTransformer
        if data.method in ["sbert", "both"] and sbert_model is not None:
            try:
                jd_embedding = sbert_model.encode(data.jd_text)
                cv_embedding = sbert_model.encode(data.cv_text)
                sbert_similarity = cosine_similarity([jd_embedding], [cv_embedding])[0][0] * 100
                method_used.append("sbert")
            except Exception as e:
                print(f"SentenceTransformer error: {e}")
                sbert_similarity = None

        # Determine final similarity score with weighted average
        if doc2vec_similarity is not None and sbert_similarity is not None:
            # Weighted average - SentenceTransformer có trọng số cao hơn vì đáng tin cậy hơn
            doc2vec_weight = 0.3
            sbert_weight = 0.7
            final_similarity = doc2vec_similarity * doc2vec_weight + sbert_similarity * sbert_weight

            # Hoặc chỉ dùng SentenceTransformer nếu chênh lệch quá lớn (>30%)
            if abs(doc2vec_similarity - sbert_similarity) > 30:
                final_similarity = sbert_similarity
                method_used.append("sbert_prioritized")

        elif doc2vec_similarity is not None:
            final_similarity = doc2vec_similarity
        elif sbert_similarity is not None:
            final_similarity = sbert_similarity
        else:
            raise HTTPException(status_code=500, detail="No valid model available")

        # Logistic Regression prediction (nếu có)
        match_score = None
        if lr_model is not None and sbert_similarity is not None:
            try:
                # Sử dụng similarity score normalized (0-1) cho logistic regression
                normalized_similarity = sbert_similarity / 100
                match_score = lr_model.predict_proba([[normalized_similarity]])[0][1] * 100
            except Exception as e:
                print(f"Logistic Regression error: {e}")
                match_score = None

        # Generate recommendation with confidence level
        confidence_level = "medium"
        method_reliability = "balanced"

        if doc2vec_similarity is not None and sbert_similarity is not None:
            diff = abs(doc2vec_similarity - sbert_similarity)
            if diff > 30:
                confidence_level = "medium"
                method_reliability = f"Large difference detected ({diff:.1f}%). SentenceTransformer prioritized."
            elif diff < 10:
                confidence_level = "high"
                method_reliability = "Both methods agree closely."
            else:
                confidence_level = "medium"
                method_reliability = f"Moderate difference ({diff:.1f}%) between methods."
        elif sbert_similarity is not None:
            confidence_level = "high"
            method_reliability = "SentenceTransformer only - reliable for modern text."
        else:
            confidence_level = "low"
            method_reliability = "Doc2Vec only - may need model update."

        # Extract skills analysis
        match_skills, missing_skills = extract_skills_analysis(cv_processed, jd_processed, final_similarity)

        if final_similarity < 50:
            recommendation = "Low chance, need to modify your CV!"
        elif final_similarity >= 50 and final_similarity < 70:
            recommendation = "Good chance but you can improve further!"
        else:
            recommendation = "Excellent! You can submit your CV."

        return MatchingResult(
            similarity_score=round(final_similarity, 2),
            match_score=round(match_score, 2) if match_score is not None else None,
            doc2vec_similarity=round(doc2vec_similarity, 2) if doc2vec_similarity is not None else None,
            sbert_similarity=round(sbert_similarity, 2) if sbert_similarity is not None else None,
            recommendation=recommendation,
            method_used="+".join(method_used) if method_used else "none",
            confidence_level=confidence_level,
            method_reliability=method_reliability,
            match_skills=match_skills,
            missing_skills=missing_skills,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


# Health check endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "doc2vec_model": doc2vec_model is not None,
        "sbert_model": sbert_model is not None,
        "lr_model": lr_model is not None,
    }


# Root endpoint
@app.get("/")
def root():
    """
    Root endpoint với thông tin API
    """
    return {
        "message": "CV Job Matching API",
        "version": "2.0.0",
        "features": {
            "text_matching": "Direct text input matching",
            "file_upload": "PDF, DOCX, DOC, TXT file support",
            "dual_models": "Doc2Vec + SentenceTransformer",
            "confidence_scoring": "Smart confidence assessment",
        },
        "endpoints": {
            "match": "/match - POST: Text-based matching",
            "match-files": "/match-files - POST: File-based matching",
            "upload": "/upload - POST: Upload and extract text",
            "analyze": "/analyze - POST: Detailed analysis",
            "dependencies": "/dependencies - GET: Check file support",
            "health": "/health - GET: Health check",
            "docs": "/docs - GET: API documentation",
        },
    }


# Debug endpoint để phân tích chi tiết
@app.post("/analyze")
def analyze_matching(data: JD_CV_Input):
    """
    Phân tích chi tiết quá trình matching để debug
    """
    try:
        # Preprocess input texts
        cv_processed = preprocess_text(data.cv_text)
        jd_processed = preprocess_text(data.jd_text)

        analysis = {
            "original_cv_length": len(data.cv_text),
            "original_jd_length": len(data.jd_text),
            "processed_cv_length": len(cv_processed),
            "processed_jd_length": len(jd_processed),
            "preprocessing_impact": {
                "cv_reduction": round((1 - len(cv_processed) / len(data.cv_text)) * 100, 2),
                "jd_reduction": round((1 - len(jd_processed) / len(data.jd_text)) * 100, 2),
            },
            "cv_sample": cv_processed[:200] + "..." if len(cv_processed) > 200 else cv_processed,
            "jd_sample": jd_processed[:200] + "..." if len(jd_processed) > 200 else jd_processed,
            "model_status": {
                "doc2vec_available": doc2vec_model is not None,
                "sbert_available": sbert_model is not None,
                "lr_available": lr_model is not None,
            },
        }

        # Thử cả hai phương pháp
        if doc2vec_model is not None:
            try:
                v1 = doc2vec_model.infer_vector(cv_processed.split())
                v2 = doc2vec_model.infer_vector(jd_processed.split())
                doc2vec_sim = 100 * (np.dot(np.array(v1), np.array(v2))) / (norm(np.array(v1)) * norm(np.array(v2)))
                analysis["doc2vec_analysis"] = {
                    "similarity": round(doc2vec_sim, 2),
                    "cv_vector_length": len(v1),
                    "jd_vector_length": len(v2),
                    "cv_vector_norm": round(norm(np.array(v1)), 4),
                    "jd_vector_norm": round(norm(np.array(v2)), 4),
                }
            except Exception as e:
                analysis["doc2vec_analysis"] = {"error": str(e)}

        if sbert_model is not None:
            try:
                jd_embedding = sbert_model.encode(data.jd_text)
                cv_embedding = sbert_model.encode(data.cv_text)
                sbert_sim = cosine_similarity([jd_embedding], [cv_embedding])[0][0] * 100
                analysis["sbert_analysis"] = {
                    "similarity": round(sbert_sim, 2),
                    "cv_embedding_shape": jd_embedding.shape,
                    "jd_embedding_shape": cv_embedding.shape,
                    "cv_embedding_norm": round(float(np.linalg.norm(cv_embedding)), 4),
                    "jd_embedding_norm": round(float(np.linalg.norm(jd_embedding)), 4),
                }
            except Exception as e:
                analysis["sbert_analysis"] = {"error": str(e)}

        return analysis

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


# Endpoint để upload và extract text từ file
@app.post("/upload", response_model=FileUploadResult)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload file (PDF, DOCX, DOC, TXT) và extract text
    """
    # Check file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    supported_formats = doc_processor.get_supported_formats() + [".txt"]

    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, detail=f"Unsupported file format: {file_extension}. Supported: {supported_formats}"
        )

    # Create temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
        # Copy uploaded file to temporary file
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name

    try:
        # Process document
        result = doc_processor.process_document(temp_file_path, clean=True)

        return FileUploadResult(
            filename=file.filename,
            file_size=result.get("file_size", 0),
            file_type=file_extension,
            extracted_text=result["cleaned_text"],
            word_count=result.get("word_count", 0),
            processing_success=result["processing_success"],
            error_message=result.get("error") if not result["processing_success"] else None,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass


# Endpoint để match với file upload
@app.post("/match-files")
async def match_files(
    cv_file: UploadFile = File(None),
    jd_file: UploadFile = File(None),
    cv_text: str = Form(None),
    jd_text: str = Form(None),
    method: str = Form("both"),
):
    """
    Match CV với JD sử dụng file upload hoặc text input
    """
    final_cv_text = ""
    final_jd_text = ""

    # Process CV
    if cv_file:
        # Extract từ file
        if cv_file.filename:
            file_extension = os.path.splitext(cv_file.filename)[1].lower()
        else:
            file_extension = ".txt"  # Default extension if filename is None
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            shutil.copyfileobj(cv_file.file, temp_file)
            temp_file_path = temp_file.name

        try:
            final_cv_text = extract_text(temp_file_path, clean=True)
        finally:
            os.unlink(temp_file_path)
    elif cv_text:
        final_cv_text = cv_text
    else:
        raise HTTPException(status_code=400, detail="Either cv_file or cv_text must be provided")

    # Process JD
    if jd_file:
        # Extract từ file
        if jd_file.filename:
            file_extension = os.path.splitext(jd_file.filename)[1].lower()
        else:
            file_extension = ".txt"  # Default extension if filename is None
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            shutil.copyfileobj(jd_file.file, temp_file)
            temp_file_path = temp_file.name

        try:
            final_jd_text = extract_text(temp_file_path, clean=True)
        finally:
            os.unlink(temp_file_path)
    elif jd_text:
        final_jd_text = jd_text
    else:
        raise HTTPException(status_code=400, detail="Either jd_file or jd_text must be provided")

    # Create input data và gọi match function
    input_data = JD_CV_Input(cv_text=final_cv_text, jd_text=final_jd_text, method=method)

    return match_cv_jd(input_data)


# Endpoint để check dependencies
@app.get("/dependencies")
def check_system_dependencies():
    """
    Check xem system có hỗ trợ các loại file nào
    """
    deps = check_dependencies()
    return {
        "status": "ok",
        "dependencies": deps,
        "recommendations": {
            "pdf": "pip install PyPDF2 PyMuPDF" if not deps["pdf_support"] else "✅ Available",
            "docx": "pip install python-docx" if not deps["docx_support"] else "✅ Available",
            "doc": "Install Microsoft Word (Windows only)" if not deps["doc_support"] else "✅ Available",
        },
    }


def extract_skills_analysis(cv_text: str, jd_text: str, similarity_score: float) -> tuple[str, str]:
    """
    Extract skills analysis from CV and Job Description
    Returns (match_skills, missing_skills)
    """
    try:
        # Convert to lowercase for better matching
        cv_lower = cv_text.lower()
        jd_lower = jd_text.lower()

        # Common technical skills to look for
        common_skills = [
            # Programming languages
            "python",
            "java",
            "javascript",
            "typescript",
            "c++",
            "c#",
            "php",
            "ruby",
            "go",
            "swift",
            "kotlin",
            # Web technologies
            "react",
            "angular",
            "vue",
            "node",
            "express",
            "django",
            "flask",
            "spring",
            "laravel",
            # Databases
            "mysql",
            "postgresql",
            "mongodb",
            "redis",
            "elasticsearch",
            "oracle",
            "sql server",
            # Cloud & DevOps
            "aws",
            "azure",
            "gcp",
            "docker",
            "kubernetes",
            "jenkins",
            "gitlab",
            "github actions",
            # Other technical skills
            "machine learning",
            "artificial intelligence",
            "data science",
            "blockchain",
            "api",
            "rest",
            "graphql",
            # Soft skills
            "leadership",
            "teamwork",
            "communication",
            "problem solving",
            "project management",
            "agile",
            "scrum",
        ]

        # Extract skills mentioned in JD
        jd_skills = [skill for skill in common_skills if skill in jd_lower]

        # Extract skills mentioned in CV
        cv_skills = [skill for skill in common_skills if skill in cv_lower]

        # Find matching skills
        matching_skills = list(set(jd_skills) & set(cv_skills))

        # Find missing skills (in JD but not in CV)
        missing_skills = list(set(jd_skills) - set(cv_skills))

        # Format results
        match_skills_str = ", ".join(matching_skills) if matching_skills else "No specific technical skills matched"
        missing_skills_str = ", ".join(missing_skills) if missing_skills else "No significant skill gaps identified"

        # Enhance based on similarity score
        if similarity_score < 30:
            missing_skills_str = (
                f"Low match detected. Consider developing: {missing_skills_str}"
                if missing_skills
                else "Significant skill development needed"
            )
        elif similarity_score < 50:
            missing_skills_str = (
                f"Moderate gaps in: {missing_skills_str}" if missing_skills else "Some skill enhancement recommended"
            )

        return match_skills_str, missing_skills_str

    except Exception as e:
        print(f"Error in skills analysis: {e}")
        return "Skills analysis unavailable", "Skills analysis unavailable"
