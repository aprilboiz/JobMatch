#!/usr/bin/env python3
"""
Test script cho document processing và file upload API
"""

import requests
import os
import json

API_URL = "http://localhost:8000"

def test_dependencies():
    """Test dependencies endpoint"""
    print("🔧 Testing Dependencies...")
    
    try:
        response = requests.get(f"{API_URL}/dependencies")
        if response.status_code == 200:
            deps = response.json()
            print("✅ Dependencies check successful!")
            print(json.dumps(deps, indent=2))
        else:
            print(f"❌ Dependencies check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Dependencies check error: {e}")

def test_file_upload():
    """Test file upload endpoint"""
    print("\n📁 Testing File Upload...")
    
    # Create sample text file
    sample_text = """
    John Doe
    Software Engineer
    
    EXPERIENCE:
    - 5 years Python development
    - Machine Learning and AI
    - FastAPI and Django
    - Git, Docker, AWS
    
    EDUCATION:
    - Bachelor in Computer Science
    
    SKILLS:
    - Python, JavaScript, SQL
    - Machine Learning, Deep Learning
    - REST APIs, Microservices
    """
    
    sample_file_path = "sample_cv.txt"
    with open(sample_file_path, 'w', encoding='utf-8') as f:
        f.write(sample_text)
    
    try:
        with open(sample_file_path, 'rb') as f:
            files = {'file': (sample_file_path, f, 'text/plain')}
            response = requests.post(f"{API_URL}/upload", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ File upload successful!")
            print(f"  📄 Filename: {result['filename']}")
            print(f"  📊 File size: {result['file_size']} bytes")
            print(f"  🔤 Word count: {result['word_count']}")
            print(f"  📝 Text preview: {result['extracted_text'][:200]}...")
        else:
            print(f"❌ File upload failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ File upload error: {e}")
    
    finally:
        # Clean up
        if os.path.exists(sample_file_path):
            os.remove(sample_file_path)

def test_file_matching():
    """Test file-based matching"""
    print("\n🔍 Testing File-based Matching...")
    
    # Create sample CV and JD files
    cv_text = """
    Alice Johnson
    Data Scientist
    
    EXPERIENCE:
    - 3 years in machine learning and data analysis
    - Proficient in Python, R, SQL
    - Experience with scikit-learn, pandas, numpy
    - Built predictive models for business insights
    
    EDUCATION:
    - Master's in Data Science
    - Bachelor's in Statistics
    
    SKILLS:
    - Machine Learning algorithms
    - Data visualization (matplotlib, seaborn)
    - Statistical analysis
    - Big data processing
    """
    
    jd_text = """
    Data Scientist Position
    
    We are looking for an experienced Data Scientist to join our team.
    
    REQUIREMENTS:
    - 2+ years experience in data science
    - Strong Python programming skills
    - Experience with machine learning libraries
    - Knowledge of statistical analysis
    - Bachelor's degree in relevant field
    
    RESPONSIBILITIES:
    - Develop machine learning models
    - Analyze large datasets
    - Create data visualizations
    - Collaborate with business teams
    """
    
    cv_file_path = "sample_cv.txt"
    jd_file_path = "sample_jd.txt"
    
    with open(cv_file_path, 'w', encoding='utf-8') as f:
        f.write(cv_text)
    
    with open(jd_file_path, 'w', encoding='utf-8') as f:
        f.write(jd_text)
    
    try:
        with open(cv_file_path, 'rb') as cv_f, open(jd_file_path, 'rb') as jd_f:
            files = {
                'cv_file': (cv_file_path, cv_f, 'text/plain'),
                'jd_file': (jd_file_path, jd_f, 'text/plain')
            }
            data = {'method': 'both'}
            
            response = requests.post(f"{API_URL}/match-files", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ File-based matching successful!")
            print(f"  📊 Similarity Score: {result['similarity_score']}%")
            print(f"  🤖 Match Score: {result['match_score']}%")
            print(f"  🔬 Doc2Vec: {result['doc2vec_similarity']}%")
            print(f"  🧠 SBERT: {result['sbert_similarity']}%")
            print(f"  💡 Recommendation: {result['recommendation']}")
            print(f"  🎯 Confidence: {result['confidence_level']}")
            print(f"  🔧 Method: {result['method_used']}")
        else:
            print(f"❌ File-based matching failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ File-based matching error: {e}")
    
    finally:
        # Clean up
        for file_path in [cv_file_path, jd_file_path]:
            if os.path.exists(file_path):
                os.remove(file_path)

def test_mixed_input():
    """Test với file + text input"""
    print("\n🔀 Testing Mixed Input (File + Text)...")
    
    cv_text_content = """
    Bob Smith
    Product Manager
    
    - 4 years product management experience
    - Led cross-functional teams
    - Agile methodology expertise
    - Data-driven decision making
    """
    
    jd_text = """
    Product Manager needed with 3+ years experience.
    Must have agile experience and team leadership skills.
    Data analysis skills preferred.
    """
    
    cv_file_path = "sample_cv.txt"
    with open(cv_file_path, 'w', encoding='utf-8') as f:
        f.write(cv_text_content)
    
    try:
        with open(cv_file_path, 'rb') as cv_f:
            files = {'cv_file': (cv_file_path, cv_f, 'text/plain')}
            data = {
                'jd_text': jd_text,
                'method': 'sbert'  # Test specific method
            }
            
            response = requests.post(f"{API_URL}/match-files", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Mixed input matching successful!")
            print(f"  📊 Similarity Score: {result['similarity_score']}%")
            print(f"  💡 Recommendation: {result['recommendation']}")
            print(f"  🔧 Method: {result['method_used']}")
        else:
            print(f"❌ Mixed input matching failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Mixed input matching error: {e}")
    
    finally:
        # Clean up
        if os.path.exists(cv_file_path):
            os.remove(cv_file_path)

if __name__ == "__main__":
    print("🧪 Testing Document Processing & File Upload API")
    print("=" * 60)
    
    # Test dependencies
    test_dependencies()
    
    # Test file upload
    test_file_upload()
    
    # Test file-based matching
    test_file_matching()
    
    # Test mixed input
    test_mixed_input()
    
    print("\n✅ All tests completed!")
    print("\n📝 Notes:")
    print("  - For PDF/DOCX support, install: pip install PyPDF2 python-docx")
    print("  - For .doc files (Windows only): pip install pywin32")
    print("  - Use /dependencies endpoint to check what's available")
