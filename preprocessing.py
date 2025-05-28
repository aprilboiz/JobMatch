import re
import os
import docx2txt
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from pdfminer.high_level import extract_text

nltk.download('stopwords')

# -------------------------------------------------
# 1. Đọc nội dung từ file PDF, DOCX, TXT
# -------------------------------------------------
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
        raise ValueError("Unsupported file type. Supported: .pdf, .docx, .txt")

# -------------------------------------------------
# 2. Làm sạch văn bản
# -------------------------------------------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z-\s]', '', text)
    tokens = text.split()
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    stemmer = PorterStemmer()
    stemmed = [stemmer.stem(t) for t in tokens]
    return ' '.join(stemmed)

# -------------------------------------------------
# 3. Field-based Extraction: education, skills, exp, certs
# -------------------------------------------------
def extract_fields(text, known_skills):
    fields = {}

    # Education
    edu = re.findall(r'(bachelor|master|phd|university|college|cử nhân|đại học|thạc sĩ)', text, re.IGNORECASE)
    fields['education'] = list(set([e.lower() for e in edu]))

    # Skills
    fields['skills'] = [skill for skill in known_skills if re.search(rf'\b{re.escape(skill)}\b', text.lower())]

    # Experience
    exp_match = re.search(r'(\d+)\+?\s*(year|năm)', text.lower())
    fields['experience_years'] = int(exp_match.group(1)) if exp_match else 0

    # Certifications
    certs = re.findall(r'(certificate|certification|chứng chỉ|ielts|toeic)', text, re.IGNORECASE)
    fields['certifications'] = list(set([c.lower() for c in certs]))

    return fields
# -------------------------------------------------
# Sửa lỗi chính tả trong văn bản
# -------------------------------------------------
def normalize_text(text):
    corrections = {
        "reacjs": "reactjs",
        "posgresql": "postgresql",
        "programing": "programming",
        "restful-api": "restful api",
        "RESTful API": "restful api"
    }
    for wrong, correct in corrections.items():
        text = re.sub(rf'\b{wrong}\b', correct, text, flags=re.IGNORECASE)
    return text

# -------------------------------------------------
# 4. Hàm xử lý hoàn chỉnh 1 file
# -------------------------------------------------
def preprocess_file_with_fields(file_path, known_skills):
    raw_text = extract_text_from_file(file_path)
    cleaned_text = clean_text(raw_text)
    fields = extract_fields(raw_text, known_skills)  # dùng text gốc
    return {
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "fields": fields
    }

# -------------------------------------------------
# 5. Dùng thử
# -------------------------------------------------
if __name__ == "__main__":
    known_skills = [
        'python', 'java', 'c++', 'sql', 'javascript', 'html', 'css', 'scss', 'php',
        'react', 'reactjs', 'reacjs', 'oop', 'docker', 'github',
        'mysql', 'postgresql', 'restful api', ' RESTful API'
    ]

    jd_path = r"D:\code\JobMatch\data\sample.docx"
    cv_path = r"D:\code\JobMatch\data\CV_Phan-Tuan-Anh_SE_Intern (1).pdf"

    # Lấy raw_text từ file
    cv_raw_text = extract_text_from_file(cv_path)
    jd_raw_text = extract_text_from_file(jd_path)

    # Chuẩn hóa văn bản sau khi có raw_text
    cv_normalized_text = normalize_text(cv_raw_text)
    jd_normalized_text = normalize_text(jd_raw_text)

    # Lấy thông tin fields dựa trên normalized_text nếu muốn
    cv_fields = extract_fields(cv_normalized_text, known_skills)
    jd_fields = extract_fields(jd_normalized_text, known_skills)

    # Hoặc dùng luôn hàm preprocess_file_with_fields
    cv_result = preprocess_file_with_fields(cv_path, known_skills)
    jd_result = preprocess_file_with_fields(jd_path, known_skills)

    print("== CV Fields ==")
    for field, value in cv_result['fields'].items():
        print(f"{field.capitalize()}: {value}")

    print("\n== JD Fields ==")
    for field, value in jd_result['fields'].items():
        print(f"{field.capitalize()}: {value}")

    # # Gợi ý kỹ năng còn thiếu
    # cv_skills = set(cv_result['fields']['skills'])
    # jd_skills = set(jd_result['fields']['skills'])
    # missing = jd_skills - cv_skills
    # print(f"\n❗ Missing skills in CV: {missing}")
