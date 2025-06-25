import os
import sys
sys.path.append('.')
from preprocessing import *

def test_marketing_matching():
    """Test hệ thống với Marketing JD và các CV khác nhau"""
    
    print("🎯 TESTING MARKETING JD WITH MULTIPLE CVS")
    print("=" * 60)
    
    # Load skills database
    skills_by_industry = get_skills_by_industry()
    all_skills = get_all_skills()
    
    # Marketing JD file
    jd_path = r"D:\code\JobMatch\data\jd_test.txt"
    
    # Danh sách CV để test
    cv_files = [
        ("Marketing CV (Vietnamese)", r"D:\code\JobMatch\data\cv_editor.pdf")
        # ("Original Resume (Tech)", r"D:\code\JobMatch\data\resume.pdf"),
        # ("Finance CV (Vietnamese)", r"D:\code\JobMatch\data\finance_cv.txt"),
        # ("Healthcare CV (Vietnamese)", r"D:\code\JobMatch\data\healthcare_cv.txt")
    ]
    
    # Process JD
    print("📋 Processing Marketing Job Description...")
    jd_result = preprocess_file_with_fields(jd_path, all_skills)
    jd_industry, jd_industry_scores = detect_industry(
        normalize_text(extract_text_from_file(jd_path)), 
        skills_by_industry
    )
    
    print(f"🎯 JD Industry: {jd_industry.upper()}")
    print(f"   Required Skills: {jd_result['fields']['skills'][:10]}...")
    print(f"   Total Required Skills: {len(jd_result['fields']['skills'])}")
    print(f"   Experience Required: {jd_result['fields']['experience_years']} years")
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
            industry_match = "✅ Perfect Match" if cv_industry == jd_industry else "⚠️ Industry Mismatch"
            
            # Skills analysis
            cv_skills = set(cv_result['fields']['skills'])
            jd_skills = set(jd_result['fields']['skills'])
            matching_skills = cv_skills & jd_skills
            missing_skills = jd_skills - cv_skills
            
            # Experience comparison
            exp_match = "✅" if cv_result['fields']['experience_years'] >= jd_result['fields']['experience_years'] else "⚠️"
            
            print(f"   🎯 CV Industry: {cv_industry.upper()} {industry_match}")
            print(f"   📊 Overall Score: {score}/100")
            print(f"   ✅ Skills Match: {len(matching_skills)}/{len(jd_skills)} ({len(matching_skills)/len(jd_skills)*100:.1f}%)")
            print(f"   💼 Experience: {cv_result['fields']['experience_years']} years {exp_match} (Required: {jd_result['fields']['experience_years']})")
            print(f"   🎓 Education Match: {bool(set(cv_result['fields']['education']) & set(jd_result['fields']['education']))}")
            
            if matching_skills:
                print(f"   🔥 Strengths: {list(matching_skills)[:8]}...")
            if missing_skills:
                print(f"   📝 Missing: {list(missing_skills)[:8]}...")
            
            print()
            
            # Store results
            results.append({
                'name': cv_name,
                'industry': cv_industry,
                'score': score,
                'industry_match': cv_industry == jd_industry,
                'skills_match_ratio': len(matching_skills)/len(jd_skills)*100,
                'experience': cv_result['fields']['experience_years'],
                'experience_match': cv_result['fields']['experience_years'] >= jd_result['fields']['experience_years']
            })
            
        except Exception as e:
            print(f"   ❌ Error processing {cv_name}: {str(e)}")
            print()
    
    # Final ranking
    print("🏆 FINAL RANKING FOR MARKETING POSITION")
    print("=" * 60)
    print(f"{'Rank':<5} {'CV Name':<25} {'Score':<8} {'Industry':<10} {'Skills%':<8} {'Exp':<6}")
    print("-" * 65)
    
    # Sort by score
    results.sort(key=lambda x: x['score'], reverse=True)
    
    for i, result in enumerate(results, 1):
        industry_icon = "✅" if result['industry_match'] else "⚠️"
        exp_icon = "✅" if result['experience_match'] else "⚠️"
        
        print(f"{i:<5} {result['name']:<25} {result['score']:<8.1f} {industry_icon} {result['industry']:<9} {result['skills_match_ratio']:<7.1f}% {exp_icon}")
    
    # Recommendations
    print("\n💡 RECOMMENDATIONS:")
    best_candidate = results[0]
    print(f"   🥇 Best Match: {best_candidate['name']} ({best_candidate['score']:.1f}/100)")
    
    if best_candidate['industry_match']:
        print(f"   ✅ Perfect industry alignment for Marketing position")
    else:
        print(f"   ⚠️  Consider industry transition training")
    
    if best_candidate['experience_match']:
        print(f"   ✅ Experience requirement met")
    else:
        print(f"   ⚠️  May need additional experience or senior guidance")

if __name__ == "__main__":
    test_marketing_matching()
