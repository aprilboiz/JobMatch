# preprocessing.py

import re
import docx2txt
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
import nltk
import os

from pdfminer.high_level import extract_text

# Chạy lần đầu cần tải stopwords
nltk.download('stopwords')

# -----------------------------
# 1. Hàm đọc nội dung từ file
# -----------------------------
def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    
    if ext == ".pdf":
        return extract_text(file_path)
    
    elif ext == ".docx":
        return docx2txt.process(file_path)
    
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    else:
        raise ValueError("Unsupported file type: only PDF, DOCX, or TXT are allowed.")

# -----------------------------
# 2. Hàm làm sạch văn bản
# -----------------------------
def clean_text(text):
    # Lowercase
    text = text.lower()
    # Loại bỏ ký tự đặc biệt và số
    text = re.sub(r'[^a-z\s]', '', text)
    # Tokenize
    tokens = text.split()
    # Xoá stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    # Stemming
    stemmer = PorterStemmer()
    stemmed = [stemmer.stem(t) for t in tokens]
    return ' '.join(stemmed)

# -----------------------------
# 3. Hàm xử lý toàn bộ pipeline
# -----------------------------
def preprocess_file(file_path):
    raw_text = extract_text_from_file(file_path)
    cleaned_text = clean_text(raw_text)
    return cleaned_text

# -----------------------------
# 4. Dùng thử
# -----------------------------
if __name__ == "__main__":
    # Thay đổi đường dẫn tùy file của bạn
    cv_path = r"D:\code\JobMatch\data\sample.docx"
    jd_path = r"D:\code\JobMatch\data\resume.pdf"

    cv_clean = preprocess_file(cv_path)
    jd_clean = preprocess_file(jd_path)

    print("== Cleaned CV ==")
    print(cv_clean[:500])
    print("\n== Cleaned JD ==")
    print(jd_clean[:500])
