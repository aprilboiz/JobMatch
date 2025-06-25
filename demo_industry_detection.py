import os
import sys
sys.path.append('.')
from preprocessing import *

def demo_industry_detection():
    """Demo tính năng tự động nhận diện ngành nghề"""
    
    print("🤖 AI INDUSTRY DETECTION DEMO")
    print("=" * 60)
    
    # Load skills database
    skills_by_industry = get_skills_by_industry()
    all_skills = get_all_skills()
    
    # Test CVs from different industries
    test_cvs = [
        ("Marketing CV", r"D:\code\JobMatch\data\marketing_cv.txt"),
        ("Finance CV", r"D:\code\JobMatch\data\finance_cv.txt"), 
        ("Tech CV", r"D:\code\JobMatch\data\resume.pdf"),
        ("Sales CV", r"D:\code\JobMatch\data\sales_cv.txt"),
        ("HR CV", r"D:\code\JobMatch\data\hr_cv.txt"),
        ("Healthcare CV", r"D:\code\JobMatch\data\healthcare_cv.txt")
    ]
    
    for cv_name, cv_path in test_cvs:
        print(f"📄 Analyzing: {cv_name}")
        print("-" * 40)
        
        try:
            # Extract and normalize text
            raw_text = extract_text_from_file(cv_path)
            normalized_text = normalize_text(raw_text)
            
            # AI Industry Detection
            detected_industry, industry_scores = detect_industry(normalized_text, skills_by_industry)
            
            # Process CV with full skills database
            cv_result = preprocess_file_with_fields(cv_path, all_skills)
            
            print(f"🎯 AI Detection Result: {detected_industry.upper()}")
            print(f"   Confidence Scores:")
            
            # Show top 3 industries with scores
            sorted_scores = sorted(industry_scores.items(), key=lambda x: x[1], reverse=True)
            for i, (industry, score) in enumerate(sorted_scores[:3]):
                confidence = "🔥" if i == 0 else "⚡" if i == 1 else "💡"
                print(f"     {confidence} {industry}: {score} skills matched")
            
            # Focus analysis on detected industry
            if detected_industry in skills_by_industry:
                industry_skills = set(skills_by_industry[detected_industry])
                cv_skills = set(cv_result['fields']['skills'])
                matching_industry_skills = cv_skills & industry_skills
                
                print(f"\n   🔍 {detected_industry.upper()} Skills Focus:")
                print(f"     ✅ Matched: {len(matching_industry_skills)}/{len(industry_skills)} skills")
                if matching_industry_skills:
                    print(f"     📋 Top Skills: {list(matching_industry_skills)[:8]}...")
                
                # Calculate industry-specific expertise percentage
                expertise_percentage = (len(matching_industry_skills) / len(industry_skills)) * 100
                print(f"     📊 Industry Expertise: {expertise_percentage:.1f}%")
                
                # Expertise level assessment
                if expertise_percentage >= 70:
                    level = "🏆 EXPERT"
                elif expertise_percentage >= 50:
                    level = "🥇 ADVANCED"
                elif expertise_percentage >= 30:
                    level = "🥈 INTERMEDIATE"
                elif expertise_percentage >= 15:
                    level = "🥉 BEGINNER"
                else:
                    level = "📚 ENTRY LEVEL"
                
                print(f"     🎖️  Level: {level}")
            
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print()
    
    print("💡 KEY FEATURES DEMONSTRATED:")
    print("   ✅ Automatic industry detection from CV content")
    print("   🎯 Focus analysis on relevant industry skills")
    print("   📊 Industry-specific expertise assessment")
    print("   🏆 Professional level classification")
    print("   🤖 AI works with both English and Vietnamese")

if __name__ == "__main__":
    demo_industry_detection()
