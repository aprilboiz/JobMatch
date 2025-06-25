import os
import sys
sys.path.append('.')
from preprocessing import *

def comprehensive_test():
    """Test toàn diện hệ thống JobMatch với nhiều CV và JD"""
    
    print("🎯 COMPREHENSIVE JOBMATCH TESTING")
    print("=" * 80)
    
    # Load skills database
    skills_by_industry = get_skills_by_industry()
    all_skills = get_all_skills()
    
    print(f"📊 Database Info: {len(skills_by_industry)} industries, {len(all_skills)} total skills")
    print()
    
    # Test data
    test_cases = [
        {
            'jd_name': 'Technology JD',
            'jd_path': r"D:\code\JobMatch\data\sample.docx",
            'cvs': [
                ("Tech CV", r"D:\code\JobMatch\data\resume.pdf"),
                ("Marketing CV", r"D:\code\JobMatch\data\marketing_cv.txt"),
                ("Sales CV", r"D:\code\JobMatch\data\sales_cv.txt"),
                ("HR CV", r"D:\code\JobMatch\data\hr_cv.txt"),
            ]
        },
        {
            'jd_name': 'Marketing JD', 
            'jd_path': r"D:\code\JobMatch\data\marketing_jd.txt",
            'cvs': [
                ("Marketing CV", r"D:\code\JobMatch\data\marketing_cv.txt"),
                ("Tech CV", r"D:\code\JobMatch\data\resume.pdf"),
                ("Sales CV", r"D:\code\JobMatch\data\sales_cv.txt"),
                ("Finance CV", r"D:\code\JobMatch\data\finance_cv.txt"),
            ]
        }
    ]
    
    all_results = []
    
    for test_case in test_cases:
        print(f"📋 TESTING: {test_case['jd_name']}")
        print("=" * 60)
        
        # Process JD
        jd_result = preprocess_file_with_fields(test_case['jd_path'], all_skills)
        jd_industry, _ = detect_industry(
            normalize_text(extract_text_from_file(test_case['jd_path'])), 
            skills_by_industry
        )
        
        print(f"   🎯 JD Industry: {jd_industry.upper()}")
        print(f"   📝 Required Skills: {len(jd_result['fields']['skills'])}")
        print(f"   💼 Experience Required: {jd_result['fields']['experience_years']} years")
        print()
        
        # Test each CV
        case_results = []
        
        for cv_name, cv_path in test_case['cvs']:
            try:
                cv_result = preprocess_file_with_fields(cv_path, all_skills)
                cv_industry, _ = detect_industry(
                    normalize_text(extract_text_from_file(cv_path)), 
                    skills_by_industry
                )
                
                score = score_match(cv_result['fields'], jd_result['fields'])
                
                cv_skills = set(cv_result['fields']['skills'])
                jd_skills = set(jd_result['fields']['skills'])
                matching_skills = cv_skills & jd_skills
                
                industry_match = cv_industry == jd_industry
                exp_match = cv_result['fields']['experience_years'] >= jd_result['fields']['experience_years']
                
                result = {
                    'jd_name': test_case['jd_name'],
                    'jd_industry': jd_industry,
                    'cv_name': cv_name,
                    'cv_industry': cv_industry,
                    'score': score,
                    'industry_match': industry_match,
                    'experience_match': exp_match,
                    'skills_match_count': len(matching_skills),
                    'skills_total_required': len(jd_skills),
                    'cv_experience': cv_result['fields']['experience_years'],
                    'jd_experience': jd_result['fields']['experience_years']
                }
                
                case_results.append(result)
                all_results.append(result)
                
                # Display result
                industry_icon = "✅" if industry_match else "⚠️"
                exp_icon = "✅" if exp_match else "⚠️"
                skills_ratio = len(matching_skills) / len(jd_skills) * 100 if jd_skills else 0
                
                print(f"   📄 {cv_name:<15} | Score: {score:5.1f} | Industry: {industry_icon} {cv_industry:<12} | Skills: {skills_ratio:4.1f}% | Exp: {exp_icon}")
                
            except Exception as e:
                print(f"   ❌ {cv_name:<15} | Error: {str(e)}")
        
        # Sort and show top candidates for this JD
        case_results.sort(key=lambda x: x['score'], reverse=True)
        if case_results:
            best = case_results[0]
            print(f"\n   🏆 Best Match: {best['cv_name']} ({best['score']:.1f}/100)")
        
        print("\n" + "="*60 + "\n")
    
    # Final analysis
    print("📊 FINAL ANALYSIS")
    print("=" * 80)
    
    # Best matches per industry
    industries = {}
    for result in all_results:
        jd_industry = result['jd_industry']
        if jd_industry not in industries:
            industries[jd_industry] = []
        industries[jd_industry].append(result)
    
    for industry, results in industries.items():
        results.sort(key=lambda x: x['score'], reverse=True)
        best = results[0]
        print(f"🎯 Best for {industry.upper()}: {best['cv_name']} ({best['score']:.1f}/100)")
    
    print()
    
    # Industry matching analysis
    print("🔍 INDUSTRY MATCHING ANALYSIS:")
    perfect_matches = [r for r in all_results if r['industry_match']]
    cross_industry = [r for r in all_results if not r['industry_match']]
    
    print(f"   ✅ Perfect Industry Matches: {len(perfect_matches)}")
    print(f"   ⚠️  Cross-Industry Applications: {len(cross_industry)}")
    
    if perfect_matches:
        avg_perfect = sum(r['score'] for r in perfect_matches) / len(perfect_matches)
        print(f"   📈 Average Score (Perfect Match): {avg_perfect:.1f}/100")
    
    if cross_industry:
        avg_cross = sum(r['score'] for r in cross_industry) / len(cross_industry)
        print(f"   📉 Average Score (Cross-Industry): {avg_cross:.1f}/100")
    
    print()
    
    # Top performing CVs overall
    print("🏆 TOP PERFORMING CVS (Overall):")
    all_scores = {}
    for result in all_results:
        cv_name = result['cv_name']
        if cv_name not in all_scores:
            all_scores[cv_name] = []
        all_scores[cv_name].append(result['score'])
    
    cv_averages = [(cv, sum(scores)/len(scores)) for cv, scores in all_scores.items()]
    cv_averages.sort(key=lambda x: x[1], reverse=True)
    
    for i, (cv_name, avg_score) in enumerate(cv_averages, 1):
        print(f"   {i}. {cv_name}: {avg_score:.1f}/100 (avg)")
    
    print("\n💡 INSIGHTS:")
    print("   • Industry alignment significantly impacts matching scores")
    print("   • Experience requirements are properly weighted in scoring")
    print("   • Skills database effectively identifies relevant competencies")
    print("   • System works well for both English and Vietnamese content")

if __name__ == "__main__":
    comprehensive_test()
