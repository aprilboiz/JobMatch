#!/usr/bin/env python3
"""
Vẽ Flowchart Diagram của CV Job Matching AI Model
Sử dụng matplotlib và graphviz để tạo diagram
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

def create_ai_model_flowchart():
    """
    Tạo flowchart diagram cho CV Job Matching AI Model
    """
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Colors
    input_color = '#E3F2FD'      # Light Blue
    process_color = '#FFF3E0'    # Light Orange  
    model_color = '#E8F5E8'      # Light Green
    decision_color = '#FCE4EC'   # Light Pink
    output_color = '#F3E5F5'     # Light Purple
    
    # Title
    ax.text(5, 11.5, 'CV Job Matching AI Model Architecture', 
            fontsize=18, fontweight='bold', ha='center')
    
    # 1. Input Layer
    input_box = FancyBboxPatch((0.5, 10), 4, 0.8, 
                               boxstyle="round,pad=0.1", 
                               facecolor=input_color, edgecolor='black', linewidth=2)
    ax.add_patch(input_box)
    ax.text(2.5, 10.4, 'INPUT LAYER\n• CV Text\n• Job Description Text', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # 2. Text Preprocessing
    preprocess_box = FancyBboxPatch((0.5, 8.5), 4, 0.8, 
                                    boxstyle="round,pad=0.1", 
                                    facecolor=process_color, edgecolor='black', linewidth=2)
    ax.add_patch(preprocess_box)
    ax.text(2.5, 8.9, 'TEXT PREPROCESSING\n• Lowercase\n• Remove punctuation & numbers\n• Tokenization', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # 3. Method Selection (Decision Diamond)
    # Diamond shape for decision
    diamond_x = [5, 6.5, 5, 3.5]
    diamond_y = [7.5, 7, 6.5, 7]
    diamond = plt.Polygon(list(zip(diamond_x, diamond_y)), 
                         facecolor=decision_color, edgecolor='black', linewidth=2)
    ax.add_patch(diamond)
    ax.text(5, 7, 'Method\nSelection', fontsize=10, ha='center', va='center', fontweight='bold')
    
    # 4. Doc2Vec Path (Left)
    doc2vec_box = FancyBboxPatch((0.5, 5), 3.5, 1.2, 
                                 boxstyle="round,pad=0.1", 
                                 facecolor=model_color, edgecolor='black', linewidth=2)
    ax.add_patch(doc2vec_box)
    ax.text(2.25, 5.6, 'DOC2VEC MODEL\n• Infer document vectors (50D)\n• Cosine similarity\n• Trained on NYC Jobs 2020\n• Score: doc2vec_similarity', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # 5. SentenceTransformer Path (Right)
    sbert_box = FancyBboxPatch((6, 5), 3.5, 1.2, 
                               boxstyle="round,pad=0.1", 
                               facecolor=model_color, edgecolor='black', linewidth=2)
    ax.add_patch(sbert_box)
    ax.text(7.75, 5.6, 'SENTENCETRANSFORMER\n• Encode to embeddings (384D)\n• Cosine similarity\n• Pre-trained model\n• Score: sbert_similarity', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # 6. Score Combination
    combine_box = FancyBboxPatch((3, 3.2), 4, 0.8, 
                                 boxstyle="round,pad=0.1", 
                                 facecolor=process_color, edgecolor='black', linewidth=2)
    ax.add_patch(combine_box)
    ax.text(5, 3.6, 'SCORE COMBINATION\n• Weighted Average (0.3 × Doc2Vec + 0.7 × SBERT)\n• Fallback: Use SBERT if difference > 30%', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # 7. Logistic Regression (Optional)
    lr_box = FancyBboxPatch((7.5, 2), 2, 0.8, 
                            boxstyle="round,pad=0.1", 
                            facecolor=model_color, edgecolor='black', linewidth=2)
    ax.add_patch(lr_box)
    ax.text(8.5, 2.4, 'LOGISTIC REGRESSION\n(Optional)\n• match_score', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # 8. Final Scoring & Recommendation
    final_box = FancyBboxPatch((2.5, 0.5), 5, 1, 
                               boxstyle="round,pad=0.1", 
                               facecolor=output_color, edgecolor='black', linewidth=2)
    ax.add_patch(final_box)
    ax.text(5, 1, 'FINAL OUTPUT\n• similarity_score (final score)\n• confidence_level (high/medium/low)\n• recommendation (action)\n• method_reliability (explanation)', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Arrows
    arrows = [
        # Input to Preprocessing
        ((2.5, 10), (2.5, 9.3)),
        # Preprocessing to Decision
        ((2.5, 8.5), (4, 7.2)),
        # Decision to Doc2Vec
        ((3.5, 7), (2.5, 6.2)),
        # Decision to SBERT  
        ((6.5, 7), (7.5, 6.2)),
        # Doc2Vec to Combination
        ((2.25, 5), (4, 4)),
        # SBERT to Combination
        ((7.75, 5), (6, 4)),
        # Combination to Final
        ((5, 3.2), (5, 1.5)),
        # SBERT to LR
        ((8.5, 5), (8.5, 2.8)),
        # LR to Final
        ((8, 2), (6.5, 1.2))
    ]
    
    for start, end in arrows:
        arrow = ConnectionPatch(start, end, "data", "data",
                              arrowstyle="->", shrinkA=5, shrinkB=5, 
                              mutation_scale=20, fc="black", lw=2)
        ax.add_patch(arrow)
    
    # Add method labels
    ax.text(1.5, 6.5, 'doc2vec', fontsize=8, ha='center', style='italic', color='blue')
    ax.text(8.5, 6.5, 'sbert', fontsize=8, ha='center', style='italic', color='blue')
    ax.text(5.5, 7.5, 'both', fontsize=8, ha='center', style='italic', color='blue')
    
    # Add legend
    legend_elements = [
        mpatches.Patch(color=input_color, label='Input Layer'),
        mpatches.Patch(color=process_color, label='Processing'),
        mpatches.Patch(color=model_color, label='AI Models'),
        mpatches.Patch(color=decision_color, label='Decision Point'),
        mpatches.Patch(color=output_color, label='Output Layer')
    ]
    ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(1, 0.95))
    
    plt.tight_layout()
    plt.savefig('cv_job_matching_flowchart.png', dpi=300, bbox_inches='tight')
    plt.savefig('cv_job_matching_flowchart.pdf', bbox_inches='tight')
    plt.show()

def create_detailed_architecture_diagram():
    """
    Tạo diagram chi tiết về architecture
    """
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Title
    ax.text(7, 9.5, 'Detailed AI Model Architecture', 
            fontsize=16, fontweight='bold', ha='center')
    
    # FastAPI Layer
    api_box = FancyBboxPatch((1, 8), 12, 1, 
                             boxstyle="round,pad=0.1", 
                             facecolor='#E1F5FE', edgecolor='black', linewidth=2)
    ax.add_patch(api_box)
    ax.text(7, 8.5, 'FastAPI Application Layer\n/match, /analyze, /health endpoints', 
            fontsize=12, ha='center', va='center', fontweight='bold')
    
    # Input Processing
    input_box = FancyBboxPatch((1, 6.5), 5, 1, 
                               boxstyle="round,pad=0.1", 
                               facecolor='#FFF3E0', edgecolor='black', linewidth=2)
    ax.add_patch(input_box)
    ax.text(3.5, 7, 'Input Processing\n• Text validation\n• Preprocessing\n• Method selection', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Model Container
    model_box = FancyBboxPatch((8, 6.5), 5, 1, 
                               boxstyle="round,pad=0.1", 
                               facecolor='#E8F5E8', edgecolor='black', linewidth=2)
    ax.add_patch(model_box)
    ax.text(10.5, 7, 'Model Container\n• Doc2Vec (Gensim)\n• SentenceTransformer\n• Logistic Regression', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Doc2Vec Details
    doc2vec_detail = FancyBboxPatch((0.5, 4), 4, 1.5, 
                                    boxstyle="round,pad=0.1", 
                                    facecolor='#E3F2FD', edgecolor='blue', linewidth=2)
    ax.add_patch(doc2vec_detail)
    ax.text(2.5, 4.75, 'Doc2Vec Model\n• Vector size: 50\n• Training data: NYC Jobs 2020\n• Method: PV-DM\n• Epochs: 100\n• Output: Document vectors', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # SentenceTransformer Details
    sbert_detail = FancyBboxPatch((5.5, 4), 4, 1.5, 
                                  boxstyle="round,pad=0.1", 
                                  facecolor='#F3E5F5', edgecolor='purple', linewidth=2)
    ax.add_patch(sbert_detail)
    ax.text(7.5, 4.75, 'SentenceTransformer\n• Model: all-MiniLM-L6-v2\n• Vector size: 384\n• Pre-trained on large corpus\n• Subword tokenization\n• Output: Sentence embeddings', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # Logistic Regression Details
    lr_detail = FancyBboxPatch((10, 4), 3.5, 1.5, 
                               boxstyle="round,pad=0.1", 
                               facecolor='#FCE4EC', edgecolor='red', linewidth=2)
    ax.add_patch(lr_detail)
    ax.text(11.75, 4.75, 'Logistic Regression\n• Input: Similarity score\n• Output: Match probability\n• Optional enhancement\n• Binary classification', 
            fontsize=9, ha='center', va='center', fontweight='bold')
    
    # Score Processing
    score_box = FancyBboxPatch((4, 2), 6, 1, 
                               boxstyle="round,pad=0.1", 
                               facecolor='#FFF8E1', edgecolor='orange', linewidth=2)
    ax.add_patch(score_box)
    ax.text(7, 2.5, 'Score Processing & Combination\n• Weighted averaging • Confidence calculation • Recommendation generation', 
            fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Output Layer
    output_box = FancyBboxPatch((2, 0.3), 10, 1, 
                                boxstyle="round,pad=0.1", 
                                facecolor='#E8F5E8', edgecolor='green', linewidth=2)
    ax.add_patch(output_box)
    ax.text(7, 0.8, 'JSON Response Output\nsimilarity_score | match_score | confidence_level | recommendation | method_reliability', 
            fontsize=11, ha='center', va='center', fontweight='bold')
    
    # Add flow arrows
    flow_arrows = [
        ((7, 8), (7, 7.5)),      # API to Input/Model
        ((6, 7), (8, 7)),        # Input to Model
        ((3.5, 6.5), (2.5, 5.5)), # Input to Doc2Vec
        ((10.5, 6.5), (7.5, 5.5)), # Model to SBERT
        ((10.5, 6.5), (11.75, 5.5)), # Model to LR
        ((7, 4), (7, 3)),        # Models to Score Processing
        ((7, 2), (7, 1.3))       # Score to Output
    ]
    
    for start, end in flow_arrows:
        arrow = ConnectionPatch(start, end, "data", "data",
                              arrowstyle="->", shrinkA=5, shrinkB=5, 
                              mutation_scale=15, fc="gray", lw=1.5)
        ax.add_patch(arrow)
    
    plt.tight_layout()
    plt.savefig('ai_model_architecture.png', dpi=300, bbox_inches='tight')
    plt.savefig('ai_model_architecture.pdf', bbox_inches='tight')
    plt.show()

def create_data_flow_diagram():
    """
    Tạo diagram về data flow
    """
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)
    ax.axis('off')
    
    # Title
    ax.text(6, 7.5, 'Data Flow Through AI Pipeline', 
            fontsize=16, fontweight='bold', ha='center')
    
    # Data examples at each stage
    stages = [
        {
            'pos': (2, 6.5),
            'size': (3.5, 0.8),
            'color': '#E3F2FD',
            'title': 'Raw Input',
            'content': 'CV: "Software Engineer, 5+ years Python"\nJD: "Python Developer needed"'
        },
        {
            'pos': (2, 5),
            'size': (3.5, 0.8),
            'color': '#FFF3E0',
            'title': 'Preprocessed',
            'content': 'CV: "software engineer years python"\nJD: "python developer needed"'
        },
        {
            'pos': (0.5, 3.5),
            'size': (3, 0.8),
            'color': '#E8F5E8',
            'title': 'Doc2Vec Vectors',
            'content': 'CV: [0.1, -0.3, 0.7, ...] (50D)\nJD: [0.2, -0.1, 0.5, ...] (50D)'
        },
        {
            'pos': (4, 3.5),
            'size': (3, 0.8),
            'color': '#F3E5F5',
            'title': 'SBERT Embeddings',
            'content': 'CV: [0.05, 0.12, -0.3, ...] (384D)\nJD: [0.07, 0.15, -0.2, ...] (384D)'
        },
        {
            'pos': (8, 3.5),
            'size': (3, 0.8),
            'color': '#FCE4EC',
            'title': 'Similarity Scores',
            'content': 'Doc2Vec: 44.15%\nSBERT: 84.38%'
        },
        {
            'pos': (4, 2),
            'size': (4, 0.8),
            'color': '#FFF8E1',
            'title': 'Final Score',
            'content': 'Weighted: 84.38% (SBERT prioritized)\nConfidence: Medium'
        },
        {
            'pos': (3, 0.5),
            'size': (6, 0.8),
            'color': '#E8F5E8',
            'title': 'JSON Response',
            'content': '{"similarity_score": 84.38, "recommendation": "Excellent!", "confidence_level": "medium"}'
        }
    ]
    
    for stage in stages:
        box = FancyBboxPatch(stage['pos'], stage['size'][0], stage['size'][1], 
                             boxstyle="round,pad=0.1", 
                             facecolor=stage['color'], edgecolor='black', linewidth=1)
        ax.add_patch(box)
        ax.text(stage['pos'][0] + stage['size'][0]/2, stage['pos'][1] + stage['size'][1]/2, 
                f"{stage['title']}\n{stage['content']}", 
                fontsize=8, ha='center', va='center', fontweight='bold')
    
    # Flow arrows
    data_arrows = [
        ((3.75, 6.5), (3.75, 5.8)),    # Raw to Preprocessed
        ((2, 5), (2, 4.3)),            # Preprocess to Doc2Vec
        ((5.5, 5), (5.5, 4.3)),        # Preprocess to SBERT
        ((3.5, 3.9), (8, 3.9)),        # Doc2Vec to Similarity
        ((7, 3.9), (8, 3.9)),          # SBERT to Similarity
        ((9.5, 3.5), (7, 2.8)),        # Similarity to Final
        ((6, 2), (6, 1.3))             # Final to JSON
    ]
    
    for start, end in data_arrows:
        arrow = ConnectionPatch(start, end, "data", "data",
                              arrowstyle="->", shrinkA=5, shrinkB=5, 
                              mutation_scale=15, fc="blue", lw=2)
        ax.add_patch(arrow)
    
    plt.tight_layout()
    plt.savefig('data_flow_diagram.png', dpi=300, bbox_inches='tight')
    plt.savefig('data_flow_diagram.pdf', bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("🎨 Creating AI Model Flowchart Diagrams...")
    
    print("📊 1. Creating Main Flowchart...")
    create_ai_model_flowchart()
    
    print("🏗️ 2. Creating Architecture Diagram...")  
    create_detailed_architecture_diagram()
    
    print("🔄 3. Creating Data Flow Diagram...")
    create_data_flow_diagram()
    
    print("✅ All diagrams created successfully!")
    print("📁 Files saved:")
    print("   - cv_job_matching_flowchart.png/pdf")
    print("   - ai_model_architecture.png/pdf") 
    print("   - data_flow_diagram.png/pdf")
