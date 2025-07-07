#!/usr/bin/env python3
"""
Script để test CV Job Matching API
"""
import requests
import json

# API URL
API_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    try:
        response = requests.get(f"{API_URL}/health")
        print("🏥 Health Check:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_match():
    """Test matching endpoint"""
    
    # Sample CV
    cv_text = """
    John Doe
    Marketing Manager
    
    EXPERIENCE:
    - 5 years of experience in digital marketing
    - Expertise in Google Analytics, Google Ads, and social media marketing
    - Led marketing campaigns with 30% increase in ROI
    - Managed marketing team of 5 people
    - Experience with HubSpot, Salesforce CRM
    
    EDUCATION:
    - Bachelor's degree in Marketing
    - MBA in Business Administration
    
    SKILLS:
    - Digital marketing strategy
    - Content marketing
    - SEO/SEM optimization
    - Marketing automation
    - Data analysis
    - Team leadership
    """
    
    # Sample Job Description
    jd_text = """
    Marketing Manager Position
    
    We are seeking a dynamic Marketing Manager to join our team.
    
    Requirements:
    - Bachelor's degree in Marketing or related field
    - 3+ years of marketing experience
    - Experience with Google Analytics and Google Ads
    - Knowledge of HubSpot and CRM systems
    - Strong analytical skills
    - Team leadership experience
    
    Responsibilities:
    - Develop marketing strategies
    - Manage digital marketing campaigns
    - Analyze marketing performance
    - Lead marketing team
    - Collaborate with sales team
    """
    
    # Test data
    test_data = {
        "jd_text": jd_text,
        "cv_text": cv_text,
        "method": "both"
    }
    
    try:
        print("\n🔍 Testing Match Endpoint:")
        response = requests.post(f"{API_URL}/match", json=test_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Match successful!")
            print(f"📊 Similarity Score: {result['similarity_score']}%")
            print(f"🤖 Match Score: {result['match_score']}%")
            print(f"🔬 Doc2Vec Similarity: {result['doc2vec_similarity']}%")
            print(f"🧠 SBERT Similarity: {result['sbert_similarity']}%")
            print(f"💡 Recommendation: {result['recommendation']}")
            print(f"🔧 Method Used: {result['method_used']}")
        else:
            print(f"❌ Match failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Match test failed: {e}")

def test_different_methods():
    """Test different matching methods"""
    
    cv_text = "Software Engineer with 3 years Python experience"
    jd_text = "Looking for Python Developer with backend experience"
    
    methods = ["doc2vec", "sbert", "both"]
    
    for method in methods:
        print(f"\n🧪 Testing method: {method}")
        test_data = {
            "jd_text": jd_text,
            "cv_text": cv_text,
            "method": method
        }
        
        try:
            response = requests.post(f"{API_URL}/match", json=test_data)
            if response.status_code == 200:
                result = response.json()
                print(f"   Similarity: {result['similarity_score']}%")
                print(f"   Recommendation: {result['recommendation']}")
            else:
                print(f"   ❌ Failed: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing CV Job Matching API")
    print("=" * 50)
    
    # Test health check
    if test_health():
        print("\n✅ Health check passed!")
        
        # Test matching
        test_match()
        
        # Test different methods
        test_different_methods()
        
    else:
        print("\n❌ Health check failed! Make sure API is running.")
        print("Run: python run_api.py")
