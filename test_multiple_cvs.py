import os
import sys
sys.path.append('.')
from preprocessing import *

def test_multiple_cvs():
    """Test hệ thống với nhiều CV khác nhau"""
    
    print("🧪 TESTING JOBMATCH WITH MULTIPLE CVS")
    print("=" * 60)
    
    # Load skills database
    skills_by_industry = get_skills_by_industry()
    all_skills = get_all_skills()
    
    # JD file (cố định)
    jd_path = r"D:\code\JobMatch\data\sample.docx"
    
    # Danh sách CV để test
    cv_files = [
        ("Original Resume (Tech)", r"D:\code\JobMatch\data\resume.pdf"),
        ("Marketing CV (Vietnamese)", r"D:\code\JobMatch\data\marketing_cv.txt"),
        ("Finance CV (Vietnamese)", r"D:\code\JobMatch\data\finance_cv.txt"),
        ("Healthcare CV (Vietnamese)", r"D:\code\JobMatch\data\healthcare_cv.txt")
    ]
    
    # Process JD once
    print("📋 Processing Job Description...")
    jd_result = preprocess_file_with_fields(jd_path, all_skills)
    jd_industry, jd_industry_scores = detect_industry(
        normalize_text(extract_text_from_file(jd_path)), 
        skills_by_industry
    )
    
    print(f"🎯 JD Industry: {jd_industry.upper()}")
    print(f"   Required Skills: {jd_result['fields']['skills'][:10]}...")
    print()
    
    # Test each CV
    results = []
    
    for cv_name, cv_path in cv_files:
        print(f"📄 Testing: {cv_name}")
        print("-" * 50)
        
        try:
            # Process CV
            cv_result = preprocess_file_with_fields(cv_path, all_skills)
            cv_industry, cv_industry_scores = detect_industry(
                normalize_text(extract_text_from_file(cv_path)), 
                skills_by_industry
            )
            
            # Calculate score
            score = score_match(cv_result['fields'], jd_result['fields'])
            
            # Industry match
            industry_match = "✅ Match" if cv_industry == jd_industry else "⚠️ Mismatch"
            
            # Skills analysis
            cv_skills = set(cv_result['fields']['skills'])
            jd_skills = set(jd_result['fields']['skills'])
            matching_skills = cv_skills & jd_skills
            missing_skills = jd_skills - cv_skills
            
            print(f"   🎯 CV Industry: {cv_industry.upper()} {industry_match}")
            print(f"   📊 Matching Score: {score}/100")
            print(f"   ✅ Matching Skills: {len(matching_skills)}/{len(jd_skills)}")
            print(f"   ❗ Missing Skills: {len(missing_skills)} → {list(missing_skills)[:5]}...")
            print(f"   🎓 Education: {cv_result['fields']['education']}")
            print(f"   💼 Experience: {cv_result['fields']['experience_years']} years")
            print(f"   🗣️ Languages: {cv_result['fields']['languages']}")
            print()
            
            # Store results for comparison
            results.append({
                'name': cv_name,
                'industry': cv_industry,
                'score': score,
                'industry_match': cv_industry == jd_industry,
                'matching_skills': len(matching_skills),
                'missing_skills': len(missing_skills),
                'experience': cv_result['fields']['experience_years']
            })
            
        except Exception as e:
            print(f"   ❌ Error processing {cv_name}: {str(e)}")
            print()
    
    # Summary comparison
    print("📊 SUMMARY COMPARISON")
    print("=" * 60)
    print(f"{'CV Name':<25} {'Industry':<12} {'Score':<8} {'Match':<8} {'Skills':<8}")
    print("-" * 60)
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    for result in results:
        industry_emoji = "✅" if result['industry_match'] else "⚠️"
        print(f"{result['name']:<25} {result['industry']:<12} {result['score']:<8.1f} {industry_emoji:<8} {result['matching_skills']:<8}")
    
    print()
    print("🏆 RANKING:")
    for i, result in enumerate(results, 1):
        print(f"   {i}. {result['name']} - {result['score']}/100")

if __name__ == "__main__":
    test_multiple_cvs()
