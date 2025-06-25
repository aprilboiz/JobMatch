import re
import os
import docx2txt
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from pdfminer.high_level import extract_text

nltk.download('stopwords')


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

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z-\s]', '', text)
    tokens = text.split()
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    stemmer = PorterStemmer()
    stemmed = [stemmer.stem(t) for t in tokens]
    return ' '.join(stemmed)


def extract_fields(text, known_skills):
    fields = {}

    # Học vấn - mở rộng cho nhiều ngành
    edu_patterns = [
        r'(bachelor|master|phd|doctorate|university|college|institute|academy)',
        r'(cử nhân|thạc sĩ|tiến sĩ|đại học|cao đẳng|trung cấp)',
        r'(degree|diploma|certification|license)',
        r'(medical school|law school|business school|engineering)',
        r'(mba|md|jd|phd|bsc|msc|ba|ma)'
    ]
    edu = []
    for pattern in edu_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        edu.extend(matches)
    fields['education'] = list(set([e.lower() for e in edu]))

    # Kỹ năng
    fields['skills'] = [skill for skill in known_skills if re.search(rf'\b{re.escape(skill)}\b', text.lower())]

    # Kinh nghiệm - mở rộng pattern
    exp_patterns = [
        r'(\d+)\+?\s*(?:years?|năm|yr|yrs)\s*(?:of\s*)?(?:experience|exp|kinh nghiệm)',
        r'(?:experience|exp|kinh nghiệm).*?(\d+)\+?\s*(?:years?|năm|yr|yrs)',
        r'(\d+)\+?\s*(?:years?|năm)\s*(?:in|trong|at|tại)',
        r'(\d+)\+?\s*(?:year|năm)\s*(?:working|làm việc|practice|thực hành)'
    ]
    experience_years = 0
    for pattern in exp_patterns:
        exp_match = re.search(pattern, text.lower())
        if exp_match:
            experience_years = max(experience_years, int(exp_match.group(1)))
    fields['experience_years'] = experience_years

    # Chứng chỉ - mở rộng cho nhiều ngành
    cert_patterns = [
        r'(certificate|certification|license|credential|chứng chỉ|bằng cấp)',
        r'(ielts|toeic|toefl|cambridge|comptia|cisco|microsoft|oracle)',
        r'(pmp|cpa|cfa|frm|series \d+|bar exam)',
        r'(aws certified|azure certified|google cloud certified)',
        r'(medical license|nursing license|professional engineer|chartered)',
        r'(iso \d+|six sigma|lean|agile|scrum master)'
    ]
    certs = []
    for pattern in cert_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        certs.extend(matches)
    fields['certifications'] = list(set([c.lower() for c in certs]))

    # Thêm trường mới: Ngôn ngữ
    lang_patterns = [
        r'(english|vietnamese|chinese|japanese|korean|french|german|spanish)',
        r'(tiếng anh|tiếng việt|tiếng trung|tiếng nhật|tiếng hàn)',
        r'(fluent|native|bilingual|proficient|conversational)',
        r'(thành thạo|bản xứ|lưu loát|tốt|khá)'
    ]
    languages = []
    for pattern in lang_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        languages.extend(matches)
    fields['languages'] = list(set([l.lower() for l in languages]))

    # Thêm trường: Vị trí/Chức danh
    position_patterns = [
        r'(manager|director|senior|junior|lead|chief|head)',
        r'(engineer|developer|analyst|consultant|specialist|coordinator)',
        r'(assistant|associate|executive|officer|supervisor)',
        r'(intern|trainee|entry level|experienced|expert)',
        r'(quản lý|giám đốc|trưởng|phó|chuyên viên|nhân viên)'
    ]
    positions = []
    for pattern in position_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        positions.extend(matches)
    fields['positions'] = list(set([p.lower() for p in positions]))

    return fields

def normalize_text(text):
    """Chuẩn hóa văn bản cho nhiều ngành nghề"""
    corrections = {
        # Technology
        "reacjs": "reactjs",
        "posgresql": "postgresql", 
        "programing": "programming",
        "restful-api": "restful api",
        "RESTful API": "restful api",
        "devops": "devops",
        "ai": "artificial intelligence",
        "ml": "machine learning",
        
        # Marketing
        "sem": "search engine marketing",
        "seo": "search engine optimization",
        "smm": "social media marketing",
        "roi": "return on investment",
        "ctr": "click through rate",
        "cpa": "cost per acquisition",
        "cpc": "cost per click",
        
        # Finance
        "p&l": "profit and loss",
        "roi": "return on investment",
        "ebitda": "earnings before interest taxes depreciation amortization",
        "capex": "capital expenditure",
        "opex": "operational expenditure",
        
        # HR
        "hr": "human resources",
        "kpi": "key performance indicator",
        "pto": "paid time off",
        "hris": "human resource information system",
        
        # General business
        "b2b": "business to business",
        "b2c": "business to consumer",
        "saas": "software as a service",
        "erp": "enterprise resource planning",
        "crm": "customer relationship management",
        "api": "application programming interface",
        
        # Healthcare
        "icu": "intensive care unit",
        "er": "emergency room",
        "rn": "registered nurse",
        "md": "medical doctor",
        "cna": "certified nursing assistant",
        
        # Legal
        "llp": "limited liability partnership",
        "llc": "limited liability company",
        "ip": "intellectual property",
        "gdpr": "general data protection regulation"
    }
    
    for wrong, correct in corrections.items():
        text = re.sub(rf'\b{wrong}\b', correct, text, flags=re.IGNORECASE)
    return text

def preprocess_file_with_fields(file_path, known_skills):
    raw_text = extract_text_from_file(file_path)
    cleaned_text = clean_text(raw_text)
    fields = extract_fields(raw_text, known_skills)  
    return {
        "raw_text": raw_text,
        "cleaned_text": cleaned_text,
        "fields": fields
    }
def score_match(cv_fields, jd_fields):
    """Tính điểm phù hợp cho đa ngành nghề"""
    score = 0
    total_weight = 0

    weights = {
        'skills': 0.40,           # Giảm xuống để chia cho các trường khác
        'experience': 0.20,
        'education': 0.20,
        'certifications': 0.10,
        'languages': 0.10,        # Thêm trường ngôn ngữ
        'positions': 0.05         # Thêm trường vị trí
    }

    # So sánh kỹ năng
    jd_skills = set(jd_fields.get('skills', []))
    cv_skills = set(cv_fields.get('skills', []))
    if jd_skills:
        match_ratio = len(cv_skills & jd_skills) / len(jd_skills)
        score += match_ratio * weights['skills'] * 100
        total_weight += weights['skills']

    # So sánh kinh nghiệm
    jd_exp = jd_fields.get('experience_years', 0)
    cv_exp = cv_fields.get('experience_years', 0)
    if jd_exp > 0:
        exp_ratio = min(cv_exp / jd_exp, 1.0)
        score += exp_ratio * weights['experience'] * 100
        total_weight += weights['experience']

    # So sánh học vấn
    jd_edu = set(jd_fields.get('education', []))
    cv_edu = set(cv_fields.get('education', []))
    if jd_edu:
        edu_match = bool(cv_edu & jd_edu)
        score += (1.0 if edu_match else 0.0) * weights['education'] * 100
        total_weight += weights['education']

    # So sánh chứng chỉ
    jd_cert = set(jd_fields.get('certifications', []))
    cv_cert = set(cv_fields.get('certifications', []))
    if jd_cert:
        cert_ratio = len(cv_cert & jd_cert) / len(jd_cert) if jd_cert else 0
        score += cert_ratio * weights['certifications'] * 100
        total_weight += weights['certifications']

    # So sánh ngôn ngữ
    jd_lang = set(jd_fields.get('languages', []))
    cv_lang = set(cv_fields.get('languages', []))
    if jd_lang:
        lang_ratio = len(cv_lang & jd_lang) / len(jd_lang) if jd_lang else 0
        score += lang_ratio * weights['languages'] * 100
        total_weight += weights['languages']

    # So sánh vị trí/chức danh
    jd_pos = set(jd_fields.get('positions', []))
    cv_pos = set(cv_fields.get('positions', []))
    if jd_pos:
        pos_ratio = len(cv_pos & jd_pos) / len(jd_pos) if jd_pos else 0
        score += pos_ratio * weights['positions'] * 100
        total_weight += weights['positions']

    if total_weight == 0:
        return 100.0  # Nếu JD không có yêu cầu gì -> mặc định 100 điểm
    
    return round(score / total_weight, 2)


def load_skills_from_file(file_path="data/skills_database.txt"):
    """Đọc kỹ năng từ file text và trả về dictionary theo ngành nghề"""
    skills_by_industry = {}
    current_industry = None
    
    try:
        # Thử đường dẫn tương đối trước
        if not os.path.exists(file_path):
            # Nếu không tìm thấy, thử đường dẫn tuyệt đối
            base_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_dir, file_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                
                # Bỏ qua comment và dòng trống
                if not line or line.startswith('#'):
                    continue
                
                # Nhận diện ngành nghề (trong dấu [])
                if line.startswith('[') and line.endswith(']'):
                    current_industry = line[1:-1].lower()
                    skills_by_industry[current_industry] = []
                
                # Đọc kỹ năng (không bắt đầu bằng [)
                elif current_industry and not line.startswith('['):
                    # Tách các kỹ năng bằng dấu phẩy và loại bỏ khoảng trắng
                    skills = [skill.strip() for skill in line.split(',')]
                    skills_by_industry[current_industry].extend(skills)
    
    except FileNotFoundError:
        print(f"⚠️  Skills database file not found: {file_path}")
        print("   Using default minimal skills list...")
        # Fallback về danh sách tối thiểu
        return {
            'technology': ['python', 'java', 'javascript', 'sql', 'html', 'css'],
            'general': ['communication', 'teamwork', 'problem solving', 'leadership']
        }
    
    return skills_by_industry

def get_skills_by_industry():
    """Wrapper function để tương thích với code cũ"""
    return load_skills_from_file()

def detect_industry(text, skills_by_industry):
    """Tự động nhận diện ngành nghề dựa trên văn bản"""
    text_lower = text.lower()
    industry_scores = {}
    
    for industry, skills in skills_by_industry.items():
        score = 0
        for skill in skills:
            if re.search(rf'\b{re.escape(skill)}\b', text_lower):
                score += 1
        industry_scores[industry] = score
    
    # Trả về ngành có điểm cao nhất
    if industry_scores:
        best_industry = max(industry_scores, key=industry_scores.get)
        if industry_scores[best_industry] > 0:
            return best_industry, industry_scores
    
    return 'general', industry_scores

def get_all_skills():
    """Lấy tất cả kỹ năng từ mọi ngành nghề"""
    skills_by_industry = get_skills_by_industry()
    all_skills = []
    for skills in skills_by_industry.values():
        all_skills.extend(skills)
    return list(set(all_skills))  # Loại bỏ trùng lặp

def generate_industry_report(cv_fields, jd_fields, cv_industry, jd_industry, skills_by_industry):
    """Tạo báo cáo phân tích chi tiết theo ngành"""
    report = []
    
    report.append("=" * 60)
    report.append("📋 DETAILED INDUSTRY ANALYSIS REPORT")
    report.append("=" * 60)
    
    # Phân tích ngành nghề
    report.append(f"\n🎯 INDUSTRY ANALYSIS:")
    report.append(f"   CV Primary Industry: {cv_industry.upper()}")
    report.append(f"   JD Primary Industry: {jd_industry.upper()}")
    
    if cv_industry == jd_industry:
        report.append("   ✅ Perfect industry match!")
    else:
        report.append("   ⚠️  Industry mismatch detected")
    
    # Phân tích kỹ năng theo từng ngành
    cv_skills = set(cv_fields.get('skills', []))
    jd_skills = set(jd_fields.get('skills', []))
    
    report.append(f"\n📊 SKILLS BREAKDOWN BY INDUSTRY:")
    for industry, industry_skills in skills_by_industry.items():
        cv_industry_skills = cv_skills & set(industry_skills)
        jd_industry_skills = jd_skills & set(industry_skills)
        
        if cv_industry_skills or jd_industry_skills:
            report.append(f"\n   {industry.upper()}:")
            report.append(f"     CV Skills: {len(cv_industry_skills)}")
            if cv_industry_skills:
                report.append(f"       → {list(cv_industry_skills)[:5]}{'...' if len(cv_industry_skills) > 5 else ''}")
            report.append(f"     JD Requirements: {len(jd_industry_skills)}")
            if jd_industry_skills:
                report.append(f"       → {list(jd_industry_skills)[:5]}{'...' if len(jd_industry_skills) > 5 else ''}")
    
    # Gợi ý cải thiện
    report.append(f"\n💡 IMPROVEMENT SUGGESTIONS:")
    
    # Nếu khác ngành
    if cv_industry != jd_industry and jd_industry != 'general':
        target_skills = set(skills_by_industry[jd_industry])
        missing_target_skills = target_skills - cv_skills
        if missing_target_skills:
            report.append(f"   🎯 Consider learning {jd_industry} skills:")
            report.append(f"      → {list(missing_target_skills)[:10]}")
    
    # Kỹ năng thiếu quan trọng
    critical_missing = jd_skills - cv_skills
    if critical_missing:
        report.append(f"   ❗ Critical missing skills:")
        report.append(f"      → {list(critical_missing)}")
    
    # Điểm mạnh
    matching_skills = cv_skills & jd_skills
    if matching_skills:
        report.append(f"   ✅ Your strengths (matching skills):")
        report.append(f"      → {list(matching_skills)[:10]}")
    
    return "\n".join(report)

if __name__ == "__main__":
    print("🚀 JobMatch - Multi-Industry CV/JD Matching System")
    print("=" * 50)
    
    # Lấy tất cả kỹ năng từ mọi ngành nghề (đọc từ file)
    print("📖 Loading skills database...")
    skills_by_industry = get_skills_by_industry()
    all_skills = get_all_skills()
    
    print(f"✅ Loaded {len(skills_by_industry)} industries with {len(all_skills)} total skills")
    print(f"   Industries: {', '.join(skills_by_industry.keys())}")
    print()


    jd_path = r"D:\code\JobMatch\data\sample.docx"
    cv_path = r"D:\code\JobMatch\data\resume.pdf"

    # Lấy raw_text từ file
    cv_raw_text = extract_text_from_file(cv_path)
    jd_raw_text = extract_text_from_file(jd_path)

    # Chuẩn hóa văn bản sau khi có raw_text
    cv_normalized_text = normalize_text(cv_raw_text)
    jd_normalized_text = normalize_text(jd_raw_text)

    # Tự động nhận diện ngành nghề cho CV và JD
    cv_industry, cv_industry_scores = detect_industry(cv_normalized_text, skills_by_industry)
    jd_industry, jd_industry_scores = detect_industry(jd_normalized_text, skills_by_industry)

    print(f"🎯 CV Industry Detection: {cv_industry}")
    print(f"   Top industries: {dict(sorted(cv_industry_scores.items(), key=lambda x: x[1], reverse=True)[:3])}")
    print(f"🎯 JD Industry Detection: {jd_industry}")
    print(f"   Top industries: {dict(sorted(jd_industry_scores.items(), key=lambda x: x[1], reverse=True)[:3])}")

    # Xử lý với tất cả kỹ năng
    cv_result = preprocess_file_with_fields(cv_path, all_skills)
    jd_result = preprocess_file_with_fields(jd_path, all_skills)

    print("\n== CV Fields ==")
    for field, value in cv_result['fields'].items():
        if field == 'skills' and value:
            print(f"{field.capitalize()}: {value[:10]}{'...' if len(value) > 10 else ''} (Total: {len(value)})")
        else:
            print(f"{field.capitalize()}: {value}")

    print("\n== JD Fields ==")
    for field, value in jd_result['fields'].items():
        if field == 'skills' and value:
            print(f"{field.capitalize()}: {value[:10]}{'...' if len(value) > 10 else ''} (Total: {len(value)})")
        else:
            print(f"{field.capitalize()}: {value}")

    # Phân tích kỹ năng theo ngành
    cv_skills = set(cv_result['fields']['skills'])
    jd_skills = set(jd_result['fields']['skills'])
    
    print(f"\n🔍 Skills Analysis by Industry:")
    for industry, industry_skills in skills_by_industry.items():
        cv_industry_skills = cv_skills & set(industry_skills)
        jd_industry_skills = jd_skills & set(industry_skills)
        if cv_industry_skills or jd_industry_skills:
            print(f"  {industry.upper()}:")
            print(f"    CV: {len(cv_industry_skills)} skills")
            print(f"    JD: {len(jd_industry_skills)} skills")

    # Gợi ý kỹ năng còn thiếu
    missing = jd_skills - cv_skills
    print(f"\n❗ Missing skills in CV: {missing}")
    
    # Gợi ý kỹ năng theo ngành chính của JD
    if jd_industry != 'general':
        jd_industry_skills = set(skills_by_industry[jd_industry])
        missing_industry_skills = (jd_industry_skills & jd_skills) - cv_skills
        if missing_industry_skills:
            print(f"🎯 Critical {jd_industry} skills missing: {missing_industry_skills}")
    
    final_score = score_match(cv_result['fields'], jd_result['fields'])
    print(f"\n📊 Overall Matching Score: {final_score}/100")
    
    # Đánh giá phù hợp ngành nghề
    if cv_industry == jd_industry:
        print(f"✅ Industry Match: Perfect match for {cv_industry}")
    else:
        print(f"⚠️  Industry Mismatch: CV seems to be {cv_industry}, but JD is {jd_industry}")
    
    # Tạo báo cáo chi tiết
    detailed_report = generate_industry_report(
        cv_result['fields'], 
        jd_result['fields'], 
        cv_industry, 
        jd_industry, 
        skills_by_industry
    )
    print(f"\n{detailed_report}")

