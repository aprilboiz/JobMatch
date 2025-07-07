#!/usr/bin/env python3
"""
Giải thích chi tiết về tiêu chí chấm điểm của CV Job Matching Model
"""

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle

def create_scoring_explanation():
    """
    Tạo visualization giải thích cách chấm điểm
    """
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
    
    # 1. Cosine Similarity Visualization
    ax1.set_title('Cosine Similarity Concept', fontsize=14, fontweight='bold')
    
    # Vẽ 2 vectors
    origin = [0, 0]
    v1 = [3, 4]  # CV vector
    v2 = [4, 2]  # JD vector
    
    ax1.quiver(*origin, *v1, color='blue', scale=1, scale_units='xy', angles='xy', width=0.01, label='CV Vector')
    ax1.quiver(*origin, *v2, color='red', scale=1, scale_units='xy', angles='xy', width=0.01, label='JD Vector')
    
    # Vẽ góc giữa 2 vectors
    theta = np.arccos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
    arc = plt.Circle((0, 0), 0.5, fill=False, color='green', linestyle='--')
    ax1.add_patch(arc)
    ax1.text(0.3, 0.3, f'θ = {np.degrees(theta):.1f}°', fontsize=10, color='green')
    
    # Cosine similarity calculation
    cos_sim = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    ax1.text(2, -1, f'Cosine Similarity = {cos_sim:.3f}\nScore = {cos_sim * 100:.1f}%', 
             fontsize=10, bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.7))
    
    ax1.set_xlim(-1, 5)
    ax1.set_ylim(-2, 5)
    ax1.grid(True, alpha=0.3)
    ax1.legend()
    ax1.set_aspect('equal')
    
    # 2. Score Distribution
    ax2.set_title('Score Distribution & Thresholds', fontsize=14, fontweight='bold')
    
    # Tạo dữ liệu mẫu
    scores = np.random.beta(2, 2, 1000) * 100  # Beta distribution scaled to 0-100
    
    ax2.hist(scores, bins=30, alpha=0.7, color='skyblue', edgecolor='black')
    
    # Vẽ threshold lines
    ax2.axvline(x=50, color='red', linestyle='--', linewidth=2, label='Low Threshold (50%)')
    ax2.axvline(x=70, color='orange', linestyle='--', linewidth=2, label='High Threshold (70%)')
    
    # Tô màu các vùng
    ax2.axvspan(0, 50, alpha=0.2, color='red', label='Low Match')
    ax2.axvspan(50, 70, alpha=0.2, color='yellow', label='Medium Match')
    ax2.axvspan(70, 100, alpha=0.2, color='green', label='High Match')
    
    ax2.set_xlabel('Similarity Score (%)')
    ax2.set_ylabel('Frequency')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. Model Comparison
    ax3.set_title('Doc2Vec vs SentenceTransformer', fontsize=14, fontweight='bold')
    
    # Dữ liệu mẫu so sánh
    categories = ['Speed', 'Accuracy', 'Context\nAwareness', 'Vocabulary\nSize', 'Training\nData']
    doc2vec_scores = [8, 6, 5, 7, 9]
    sbert_scores = [6, 9, 9, 8, 7]
    
    x = np.arange(len(categories))
    width = 0.35
    
    bars1 = ax3.bar(x - width/2, doc2vec_scores, width, label='Doc2Vec', color='lightblue')
    bars2 = ax3.bar(x + width/2, sbert_scores, width, label='SentenceTransformer', color='lightcoral')
    
    ax3.set_xlabel('Criteria')
    ax3.set_ylabel('Score (1-10)')
    ax3.set_xticks(x)
    ax3.set_xticklabels(categories)
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # Add value labels on bars
    for bar in bars1:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                f'{height}', ha='center', va='bottom')
    
    for bar in bars2:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + 0.1,
                f'{height}', ha='center', va='bottom')
    
    # 4. Weighted Scoring Process
    ax4.set_title('Weighted Scoring Process', fontsize=14, fontweight='bold')
    
    # Example calculation
    doc2vec_score = 65.2
    sbert_score = 78.4
    doc2vec_weight = 0.3
    sbert_weight = 0.7
    
    # Visualize the weighting
    weights = [doc2vec_weight, sbert_weight]
    scores = [doc2vec_score, sbert_score]
    labels = ['Doc2Vec (30%)', 'SentenceTransformer (70%)']
    colors = ['lightblue', 'lightcoral']
    
    # Pie chart for weights
    wedges, texts, autotexts = ax4.pie(weights, labels=labels, colors=colors, autopct='%1.1f%%',
                                       startangle=90, textprops={'fontsize': 10})
    
    # Add calculation in text box
    final_score = doc2vec_score * doc2vec_weight + sbert_score * sbert_weight
    calc_text = f"""Example Calculation:
    
Doc2Vec Score: {doc2vec_score}%
SentenceTransformer Score: {sbert_score}%

Weighted Average:
{doc2vec_score} × 0.3 + {sbert_score} × 0.7 = {final_score:.1f}%

Final Recommendation:
{final_score:.1f}% → "Excellent! Submit CV" """
    
    ax4.text(1.3, 0, calc_text, fontsize=10, 
             bbox=dict(boxstyle="round,pad=0.5", facecolor="lightyellow", alpha=0.8),
             verticalalignment='center')
    
    plt.tight_layout()
    plt.savefig('scoring_explanation.png', dpi=300, bbox_inches='tight')
    plt.savefig('scoring_explanation.pdf', bbox_inches='tight')
    plt.show()

def create_confidence_visualization():
    """
    Tạo visualization về confidence levels
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    # 1. Confidence Level Explanation
    ax1.set_title('Confidence Level Calculation', fontsize=14, fontweight='bold')
    
    # Scenarios
    scenarios = ['Both Agree\n(diff < 10%)', 'Moderate Diff\n(10-30%)', 'Large Diff\n(> 30%)']
    confidence_levels = ['High', 'Medium', 'Medium']
    colors = ['green', 'orange', 'red']
    
    y_pos = np.arange(len(scenarios))
    
    bars = ax1.barh(y_pos, [10, 20, 40], color=colors, alpha=0.7)
    ax1.set_yticks(y_pos)
    ax1.set_yticklabels(scenarios)
    ax1.set_xlabel('Difference Between Methods (%)')
    ax1.set_title('Confidence Based on Method Agreement')
    
    # Add confidence labels
    for i, (bar, conf) in enumerate(zip(bars, confidence_levels)):
        ax1.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                f'Confidence: {conf}', va='center', fontweight='bold')
    
    # 2. Reliability Matrix
    ax2.set_title('Method Reliability Matrix', fontsize=14, fontweight='bold')
    
    # Create reliability matrix
    reliability_data = np.array([
        [0.9, 0.7, 0.6],  # SentenceTransformer
        [0.7, 0.8, 0.5],  # Doc2Vec
        [0.6, 0.6, 0.7]   # Combined
    ])
    
    methods = ['SentenceTransformer', 'Doc2Vec', 'Combined']
    text_types = ['Modern Text', 'Technical Text', 'Formal Text']
    
    im = ax2.imshow(reliability_data, cmap='RdYlGn', aspect='auto')
    
    # Add text annotations
    for i in range(len(methods)):
        for j in range(len(text_types)):
            text = ax2.text(j, i, f'{reliability_data[i, j]:.1f}',
                           ha="center", va="center", color="black", fontweight='bold')
    
    ax2.set_xticks(np.arange(len(text_types)))
    ax2.set_yticks(np.arange(len(methods)))
    ax2.set_xticklabels(text_types)
    ax2.set_yticklabels(methods)
    ax2.set_xlabel('Text Type')
    ax2.set_ylabel('Method')
    
    # Add colorbar
    cbar = plt.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)
    cbar.set_label('Reliability Score', rotation=270, labelpad=15)
    
    plt.tight_layout()
    plt.savefig('confidence_explanation.png', dpi=300, bbox_inches='tight')
    plt.savefig('confidence_explanation.pdf', bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("🎯 Creating Scoring Explanation Visualizations...")
    
    print("📊 1. Main Scoring Process...")
    create_scoring_explanation()
    
    print("🔍 2. Confidence Level Analysis...")
    create_confidence_visualization()
    
    print("✅ Visualizations created successfully!")
    print("📁 Files saved:")
    print("   - scoring_explanation.png/pdf")
    print("   - confidence_explanation.png/pdf")
