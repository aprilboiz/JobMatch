#!/usr/bin/env python3
"""
Text-based Flowchart cho CV Job Matching AI Model
"""

def print_main_flowchart():
    """
    In ra flowchart chính bằng ASCII art
    """
    flowchart = """
    ╔═══════════════════════════════════════════════════════════════╗
    ║                    CV JOB MATCHING AI MODEL                   ║
    ║                         FLOWCHART                             ║
    ╚═══════════════════════════════════════════════════════════════╝
    
    ┌─────────────────────┐
    │     INPUT LAYER     │
    │   • CV Text         │
    │   • Job Description │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ TEXT PREPROCESSING  │
    │   • Lowercase       │
    │   • Remove punct.   │
    │   • Remove numbers  │
    │   • Tokenization    │
    └──────────┬──────────┘
               │
               ▼
          ┌────────────┐
          │   Method   │◄────── User Input: "doc2vec", "sbert", "both"
          │ Selection  │
          └─┬────────┬─┘
            │        │
    ┌───────▼──┐  ┌──▼──────┐
    │ DOC2VEC  │  │ SBERT   │
    │ METHOD   │  │ METHOD  │
    └───────┬──┘  └──┬──────┘
            │        │
            ▼        ▼
    ┌─────────────────────┐
    │   SCORE FUSION      │
    │ • Weighted Average  │
    │ • Conflict Resolver │
    │ • Priority: SBERT   │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ CONFIDENCE ANALYSIS │
    │ • High/Medium/Low   │
    │ • Method Reliability│
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │   FINAL OUTPUT      │
    │ • Similarity Score  │
    │ • Recommendation    │
    │ • Confidence Level  │
    └─────────────────────┘
    """
    print(flowchart)

def print_detailed_architecture():
    """
    In ra architecture chi tiết
    """
    architecture = """
    ╔══════════════════════════════════════════════════════════════════╗
    ║                    DETAILED AI ARCHITECTURE                      ║
    ╚══════════════════════════════════════════════════════════════════╝

    ┌──────────────────────────────────────────────────────────────────┐
    │                        FastAPI Layer                            │
    │    /match    │    /analyze    │    /health    │    /docs         │
    └─────────────────────┬────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Request Processing                           │
    │  ┌─────────────────┐           ┌─────────────────────────────┐  │
    │  │ Input Validation│           │    Model Loading & Caching │  │
    │  │ • CV Text       │           │  • Doc2Vec: ✓ Loaded       │  │
    │  │ • JD Text       │           │  • SBERT: ✓ Loaded         │  │
    │  │ • Method Choice │           │  • LogReg: ⚠ Optional      │  │
    │  └─────────────────┘           └─────────────────────────────┘  │
    └─────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Text Processing Pipeline                     │
    │                                                                 │
    │  Raw Text: "Software Engineer, 5+ years Python experience"     │
    │      ↓                                                          │
    │  Preprocessed: "software engineer years python experience"     │
    │      ↓                                                          │
    │  Tokenized: ["software", "engineer", "years", "python", ...]   │
    └─────────────────────┬───────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   DOC2VEC    │ │ SENTENCE     │ │  LOGISTIC    │
    │   MODEL      │ │ TRANSFORMER  │ │ REGRESSION   │
    │              │ │              │ │              │
    │ Vector: 50D  │ │ Vector: 384D │ │ Binary Pred. │
    │ NYC Jobs     │ │ Pre-trained  │ │ Optional     │
    │ 2020 Data    │ │ Modern       │ │ Enhancement  │
    │              │ │              │ │              │
    │ Score: 44%   │ │ Score: 84%   │ │ Match: 82%   │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           └────────────────┼────────────────┘
                           │
                           ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                  Score Combination Logic                        │
    │                                                                 │
    │  IF both_methods_available:                                     │
    │    IF abs(doc2vec - sbert) > 30%:                              │
    │      final_score = sbert_score  # Prioritize SBERT             │
    │    ELSE:                                                        │
    │      final_score = 0.3 * doc2vec + 0.7 * sbert                │
    │                                                                 │
    │  confidence = calculate_confidence(method_agreement)            │
    │  reliability = generate_explanation(score_difference)          │
    └─────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Final Output Generation                      │
    │                                                                 │
    │  {                                                              │
    │    "similarity_score": 84.38,                                  │
    │    "match_score": 82.45,                                       │
    │    "doc2vec_similarity": 44.15,                                │
    │    "sbert_similarity": 84.38,                                  │
    │    "recommendation": "Excellent! You can submit your CV.",     │
    │    "confidence_level": "medium",                               │
    │    "method_reliability": "Large difference detected..."        │
    │  }                                                              │
    └─────────────────────────────────────────────────────────────────┘
    """
    print(architecture)

def print_data_flow():
    """
    In ra data flow diagram
    """
    data_flow = """
    ╔══════════════════════════════════════════════════════════════════╗
    ║                        DATA FLOW DIAGRAM                        ║
    ╚══════════════════════════════════════════════════════════════════╝

    Input Data
    ┌─────────────────────────────────────────────────────────────────┐
    │ CV: "John Doe, Software Engineer with 5 years Python exp..."   │
    │ JD: "We need Python Developer with backend experience..."      │
    └─────────────────────┬───────────────────────────────────────────┘
                          │ preprocess_text()
                          ▼
    Preprocessed Data
    ┌─────────────────────────────────────────────────────────────────┐
    │ CV: "john doe software engineer years python exp"              │
    │ JD: "need python developer backend experience"                 │
    └─────────────────────┬───────────────────────────────────────────┘
                          │ split() & tokenize
                          ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Parallel Processing                          │
    │                                                                 │
    │  DOC2VEC PATH              │           SBERT PATH               │
    │  ┌─────────────────────┐   │   ┌─────────────────────────────┐ │
    │  │ infer_vector()      │   │   │ encode()                    │ │
    │  │ CV: [0.1,-0.3,0.7] │   │   │ CV: [0.05,0.12,-0.3,...]   │ │
    │  │ JD: [0.2,-0.1,0.5] │   │   │ JD: [0.07,0.15,-0.2,...]   │ │
    │  │ Shape: (50,)        │   │   │ Shape: (384,)               │ │
    │  └─────────────────────┘   │   └─────────────────────────────┘ │
    │           │                │                │                  │
    │           ▼ cosine_sim     │                ▼ cosine_sim       │
    │  ┌─────────────────────┐   │   ┌─────────────────────────────┐ │
    │  │ Similarity: 44.15%  │   │   │ Similarity: 84.38%          │ │
    │  └─────────────────────┘   │   └─────────────────────────────┘ │
    └─────────────────────────────────────────────────────────────────┘
                          │
                          ▼ Score Fusion
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Combination Logic                            │
    │                                                                 │
    │ difference = |44.15 - 84.38| = 40.23% > 30% threshold          │
    │ → Use SBERT score: 84.38%                                      │
    │ → Confidence: "medium" (large difference detected)             │
    │ → Method: "doc2vec+sbert+sbert_prioritized"                    │
    └─────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼ Generate Recommendation
    ┌─────────────────────────────────────────────────────────────────┐
    │                    Final Processing                             │
    │                                                                 │
    │ IF similarity_score >= 70%: "Excellent! You can submit CV"     │
    │ ELIF similarity_score >= 50%: "Good chance, can improve"       │
    │ ELSE: "Low chance, need to modify CV"                          │
    │                                                                 │
    │ Result: 84.38% → "Excellent! You can submit your CV."         │
    └─────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼ JSON Response
    ┌─────────────────────────────────────────────────────────────────┐
    │ {                                                               │
    │   "similarity_score": 84.38,                                   │
    │   "match_score": null,                                         │
    │   "doc2vec_similarity": 44.15,                                 │
    │   "sbert_similarity": 84.38,                                   │
    │   "recommendation": "Excellent! You can submit your CV.",      │
    │   "method_used": "doc2vec+sbert+sbert_prioritized",            │
    │   "confidence_level": "medium",                                │
    │   "method_reliability": "Large difference detected (40.2%)..." │
    │ }                                                               │
    └─────────────────────────────────────────────────────────────────┘
    """
    print(data_flow)

def print_model_comparison():
    """
    So sánh các models
    """
    comparison = """
    ╔══════════════════════════════════════════════════════════════════╗
    ║                        MODEL COMPARISON                         ║
    ╚══════════════════════════════════════════════════════════════════╝

    ┌─────────────────┬──────────────────┬──────────────────────────────┐
    │     FEATURE     │     DOC2VEC      │      SENTENCETRANSFORMER     │
    ├─────────────────┼──────────────────┼──────────────────────────────┤
    │ Training Data   │ NYC Jobs 2020    │ Large multilingual corpus   │
    │ Vector Size     │ 50 dimensions   │ 384 dimensions               │
    │ Algorithm       │ PV-DM/PV-DBOW    │ Transformer architecture     │
    │ Preprocessing   │ Aggressive       │ Minimal (subword tokens)     │
    │ Domain Specific │ ✅ Job-focused   │ ❌ General purpose           │
    │ Modern Text     │ ❌ May struggle  │ ✅ Excellent                │
    │ Speed           │ ⚡ Fast          │ 🐌 Slower                   │
    │ Memory Usage    │ 💾 Low          │ 💾💾 Higher                │
    │ Typical Score   │ 44.15%          │ 84.38%                       │
    │ Reliability     │ 📉 Declining    │ 📈 High                     │
    └─────────────────┴──────────────────┴──────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────┐
    │                      ALGORITHM DETAILS                          │
    │                                                                 │
    │ DOC2VEC WORKFLOW:                                               │
    │ 1. Tokenize text → ["software", "engineer", "python"]          │
    │ 2. Look up words in vocabulary (trained on NYC jobs)           │
    │ 3. Infer document vector using trained weights                 │
    │ 4. Calculate cosine similarity between CV and JD vectors       │
    │                                                                 │
    │ SENTENCETRANSFORMER WORKFLOW:                                   │
    │ 1. Subword tokenization → ["soft", "##ware", "engineer"]       │
    │ 2. Pass through transformer layers (attention mechanism)       │
    │ 3. Mean pooling to get sentence embedding                      │
    │ 4. Calculate cosine similarity between embeddings              │
    │                                                                 │
    │ FUSION STRATEGY:                                                │
    │ • If difference > 30%: Use SBERT (more reliable)               │
    │ • If difference < 30%: Weighted average (0.3×Doc2Vec + 0.7×SBERT) │
    │ • Always prefer SBERT for modern text understanding            │
    └─────────────────────────────────────────────────────────────────┘
    """
    print(comparison)

if __name__ == "__main__":
    print("🎨 CV JOB MATCHING AI MODEL - FLOWCHART DIAGRAMS")
    print("=" * 70)
    
    print("\n1️⃣ MAIN FLOWCHART:")
    print_main_flowchart()
    
    print("\n2️⃣ DETAILED ARCHITECTURE:")
    print_detailed_architecture()
    
    print("\n3️⃣ DATA FLOW:")
    print_data_flow()
    
    print("\n4️⃣ MODEL COMPARISON:")
    print_model_comparison()
    
    print("\n" + "=" * 70)
    print("📊 Summary:")
    print("• Input: CV + Job Description texts")
    print("• Processing: Parallel Doc2Vec + SentenceTransformer")
    print("• Fusion: Intelligent score combination")
    print("• Output: Similarity score + recommendations")
    print("• Confidence: Method reliability assessment")
