"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Award, Star, TrendingUp, CheckCircle } from "lucide-react"
import { getScoreMetrics } from "@/lib/candidate-utils"

interface AIAnalysis {
    score: number
    skills: string[]
    experience: string
    recommendations: string[]
}

interface CandidateAIAnalysisProps {
    aiAnalysis: AIAnalysis
}

export function CandidateAIAnalysis({ aiAnalysis }: CandidateAIAnalysisProps) {
    const scoreMetrics = getScoreMetrics(aiAnalysis.score)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    AI Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className={`p-4 rounded-lg ${scoreMetrics.bgColor}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Overall CV Score</span>
                        <span className={`text-2xl font-bold ${scoreMetrics.color}`}>{aiAnalysis.score}%</span>
                    </div>
                    <Progress value={aiAnalysis.score} className="h-3 mb-2" aria-label={`CV score: ${aiAnalysis.score}%`} />
                    <p className="text-xs text-gray-600 text-center">
                        {scoreMetrics.emoji} {scoreMetrics.label}
                    </p>
                </div>

                {/* Experience Summary */}
                {aiAnalysis.experience && (
                    <div>
                        <h4 className="font-medium mb-3 flex items-center">
                            <Award className="w-4 h-4 mr-2" />
                            Experience Summary
                        </h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.experience}</p>
                        </div>
                    </div>
                )}

                {/* Skills */}
                {aiAnalysis.skills && aiAnalysis.skills.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-3 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            Key Skills ({aiAnalysis.skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {aiAnalysis.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            AI Recommendations
                        </h4>
                        <div className="space-y-2">
                            {aiAnalysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-700">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
