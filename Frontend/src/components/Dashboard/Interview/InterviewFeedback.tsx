import React from 'react';
import { InterviewAnalysisResponse } from '../../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Target, Briefcase, BarChart3, Award, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterviewFeedbackProps {
    feedback: InterviewAnalysisResponse;
    onClose?: () => void;
}

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 60;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const getScoreColor = () => {
        if (score >= 80) return "#22c55e";
        if (score >= 60) return "#eab308";
        return "#ef4444";
    };

    return (
        <div className="relative w-32 h-32 md:w-40 md:h-40">
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke="#e0e7ff"
                    strokeWidth="8"
                    fill="none"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    stroke={getScoreColor()}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-3xl md:text-4xl font-bold" style={{ color: getScoreColor() }}>{score}</span>
                    <span className="text-base md:text-lg text-gray-600">/100</span>
                </div>
            </div>
        </div>
    );
};

const InterviewFeedback: React.FC<InterviewFeedbackProps> = ({ feedback, onClose }) => {
    const getStatusColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const handleBack = () => {
        if (onClose) {
            onClose();
        } else {
            window.history.back();
        }
    };

    const generateFeedbackReport = () => {
        // Create the report content
        let reportContent = `Interview Feedback Report\n`;
        reportContent += `======================\n\n`;

        // Add interview details
        reportContent += `Job Role: ${feedback.metadata.job_role}\n`;
        reportContent += `Difficulty Level: ${feedback.metadata.difficulty_level}\n`;
        reportContent += `Focus Areas: ${feedback.metadata.interview_focus.join(', ')}\n\n`;

        // Add overall scores
        reportContent += `Overall Score: ${feedback.summary.overall_score}/100\n`;
        reportContent += `Current Status: ${feedback.summary.current_status}\n`;
        reportContent += `Timeline to Ready: ${feedback.summary.timeline_to_ready}\n`;
        reportContent += `Confidence Level: ${feedback.summary.confidence_level}\n\n`;

        // Add individual question analysis
        feedback.responses?.forEach((response, index) => {
            reportContent += `Question ${index + 1}: ${response.question}\n`;
            reportContent += `Your Response: ${response.answer}\n\n`;
        });

        // Add comprehensive analysis
        reportContent += `\nComprehensive Analysis\n`;
        reportContent += `=====================\n`;
        reportContent += feedback.analysis;

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-feedback-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (!feedback) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-600">No feedback data available.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Top Navigation */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="mr-4 hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-900">Interview Analysis</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateFeedbackReport}
                                className="flex items-center space-x-2 hover:bg-gray-100"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download Report</span>
                            </Button>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(feedback.summary.overall_score)}`}>
                                {feedback.summary.current_status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Score Overview */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="flex justify-center md:justify-start">
                            <ScoreRing score={feedback.summary.overall_score} />
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Timeline to Ready</h3>
                                <p className="text-lg font-semibold text-gray-900">{feedback.summary.timeline_to_ready}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Confidence Level</h3>
                                <p className="text-lg font-semibold text-gray-900">{feedback.summary.confidence_level}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Your Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Score</p>
                                        <p className="text-lg font-semibold text-indigo-600">{feedback.total_score || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Average Score</p>
                                        <p className="text-lg font-semibold text-indigo-600">{feedback.average_score || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interview Details */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Interview Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Job Role</h3>
                            <p className="text-lg font-semibold text-gray-900">{feedback.metadata.job_role}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Difficulty</h3>
                            <p className="text-lg font-semibold text-gray-900">{feedback.metadata.difficulty_level}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Questions</h3>
                            <p className="text-lg font-semibold text-gray-900">{feedback.metadata.total_questions} Total</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Focus Areas</h3>
                            <div className="flex flex-wrap gap-2">
                                {feedback.metadata.interview_focus.map((focus, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium"
                                    >
                                        {focus}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Content */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Analysis</h2>
                    <div className="prose max-w-none text-gray-700">
                        {/* Overall Score Section */}
                        <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                            <h3 className="text-xl font-bold text-indigo-900 mb-4">
                                Overall Interview Score: {feedback.summary.overall_score}/100
                            </h3>
                        </div>

                        {/* Check if analysis is available */}
                        {!feedback.analysis ? (
                            <div className="text-center py-8">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Analysis Not Available</h3>
                                    <p className="text-yellow-700">
                                        The detailed analysis is currently being processed. Please try refreshing the page or contact support if the issue persists.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Individual Questions Analysis */}
                                {feedback.responses && feedback.responses.map((response, index) => {
                                    // More flexible regex to match different question formats
                                    const questionPatterns = [
                                        new RegExp(`\\*\\*Question ${index + 1}:.*?(?=\\*\\*Question ${index + 2}:|### COMPREHENSIVE ANALYSIS|$)`, 's'),
                                        new RegExp(`Question ${index + 1}:.*?(?=Question ${index + 2}:|### COMPREHENSIVE ANALYSIS|$)`, 's'),
                                        new RegExp(`\\*\\*Q${index + 1}:.*?(?=\\*\\*Q${index + 2}:|### COMPREHENSIVE ANALYSIS|$)`, 's'),
                                        new RegExp(`Q${index + 1}:.*?(?=Q${index + 2}:|### COMPREHENSIVE ANALYSIS|$)`, 's')
                                    ];

                                    let questionAnalysis = '';
                                    for (const pattern of questionPatterns) {
                                        const match = feedback.analysis?.match(pattern);
                                        if (match) {
                                            questionAnalysis = match[0];
                                            break;
                                        }
                                    }

                                    // If no specific question analysis found, try to extract from the full analysis
                                    if (!questionAnalysis && feedback.analysis) {
                                        // Look for any content related to this question number
                                        const generalPattern = new RegExp(`(${index + 1}[^\\n]*\\n.*?)(?=\\n\\n|$)`, 's');
                                        const generalMatch = feedback.analysis.match(generalPattern);
                                        if (generalMatch) {
                                            questionAnalysis = generalMatch[1];
                                        }
                                    }

                                    // Parse scores and feedback with improved regex patterns
                                    const scoreMatch = questionAnalysis.match(/\*\*Score\*\*: (\d+)\/100/);
                                    const contentMatch = questionAnalysis.match(/\*\*Content Quality\*\*: (\d+)\/25 \((.*?)\)/);
                                    const communicationMatch = questionAnalysis.match(/\*\*Communication\*\*: (\d+)\/25 \((.*?)\)/);
                                    const professionalismMatch = questionAnalysis.match(/\*\*Professionalism\*\*: (\d+)\/25 \((.*?)\)/);
                                    const behavioralMatch = questionAnalysis.match(/\*\*Behavioral\*\*: (\d+)\/25 \((.*?)\)/);
                                    const keyIssuesMatch = questionAnalysis.match(/\*\*Key Issues\*\*: (.*?)(?=\*\*Improvements|\*\*HOW TO ANSWER|$)/s);
                                    const improvementsMatch = questionAnalysis.match(/\*\*Improvements\*\*: (.*?)(?=\*\*HOW TO ANSWER|$)/s);

                                    // Extract the "HOW TO ANSWER THIS QUESTION PROPERLY" section
                                    const howToAnswerMatch = questionAnalysis.match(/\*\*HOW TO ANSWER THIS QUESTION PROPERLY\*\*:(.*?)(?=\*\*Question|\n\n|$)/s);
                                    const howToAnswerSection = howToAnswerMatch ? howToAnswerMatch[1] : '';

                                    // Parse the how-to-answer subsections
                                    const structureMatch = howToAnswerSection.match(/\*\*Structure\*\*: (.*?)(?=\*\*Key Points|\*\*Example Response|\*\*Common Mistakes|\*\*Pro Tips|$)/s);
                                    const keyPointsMatch = howToAnswerSection.match(/\*\*Key Points to Include\*\*: (.*?)(?=\*\*Example Response|\*\*Common Mistakes|\*\*Pro Tips|$)/s);
                                    const exampleMatch = howToAnswerSection.match(/\*\*Example Response\*\*: (.*?)(?=\*\*Common Mistakes|\*\*Pro Tips|$)/s);
                                    const mistakesMatch = howToAnswerSection.match(/\*\*Common Mistakes to Avoid\*\*: (.*?)(?=\*\*Pro Tips|$)/s);
                                    const tipsMatch = howToAnswerSection.match(/\*\*Pro Tips\*\*: (.*?)(?=\n\n|$)/s);

                                    return (
                                        <div key={index} className="bg-gray-50 rounded-lg p-6 mb-6">
                                            <h3 className="text-lg font-semibold mb-4">Question {index + 1}</h3>

                                            {/* Question and Response */}
                                            <div className="mb-6 space-y-4">
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="font-medium text-gray-900 mb-2">Question:</div>
                                                    <p className="text-gray-700">{response.question}</p>
                                                </div>

                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <div className="font-medium text-blue-700 mb-2">Your Response:</div>
                                                    <p className="text-blue-900">{response.answer}</p>
                                                </div>
                                            </div>

                                            {/* Scores Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-medium text-gray-500">Overall Score</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{scoreMatch ? scoreMatch[1] : '0'}/100</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-medium text-gray-500">Content Quality</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{contentMatch ? contentMatch[1] : '0'}/25</div>
                                                    <div className="text-sm text-gray-600 mt-1">{contentMatch ? contentMatch[2] : ''}</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-medium text-gray-500">Communication</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{communicationMatch ? communicationMatch[1] : '0'}/25</div>
                                                    <div className="text-sm text-gray-600 mt-1">{communicationMatch ? communicationMatch[2] : ''}</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-medium text-gray-500">Professionalism</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{professionalismMatch ? professionalismMatch[1] : '0'}/25</div>
                                                    <div className="text-sm text-gray-600 mt-1">{professionalismMatch ? professionalismMatch[2] : ''}</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="text-sm font-medium text-gray-500">Behavioral</div>
                                                    <div className="text-2xl font-bold text-indigo-600">{behavioralMatch ? behavioralMatch[1] : '0'}/25</div>
                                                    <div className="text-sm text-gray-600 mt-1">{behavioralMatch ? behavioralMatch[2] : ''}</div>
                                                </div>
                                            </div>

                                            {/* Key Issues */}
                                            {keyIssuesMatch && (
                                                <div className="mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">Key Issues:</h4>
                                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                                        <p className="text-red-700">{keyIssuesMatch[1].trim()}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Improvements */}
                                            {improvementsMatch && (
                                                <div className="mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">Improvements:</h4>
                                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                                        <p className="text-yellow-700">{improvementsMatch[1].trim()}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* How to Answer This Question Properly */}
                                            {howToAnswerSection && (
                                                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                                                    <h4 className="font-semibold text-indigo-900 mb-4 text-lg">How to Answer This Question Properly</h4>

                                                    {/* Structure */}
                                                    {structureMatch && (
                                                        <div className="mb-4">
                                                            <h5 className="font-medium text-indigo-800 mb-2">📋 Structure:</h5>
                                                            <div className="bg-white p-3 rounded border border-indigo-100">
                                                                <p className="text-indigo-700">{structureMatch[1].trim()}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Key Points */}
                                                    {keyPointsMatch && (
                                                        <div className="mb-4">
                                                            <h5 className="font-medium text-indigo-800 mb-2">🎯 Key Points to Include:</h5>
                                                            <div className="bg-white p-3 rounded border border-indigo-100">
                                                                <p className="text-indigo-700">{keyPointsMatch[1].trim()}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Example Response */}
                                                    {exampleMatch && (
                                                        <div className="mb-4">
                                                            <h5 className="font-medium text-indigo-800 mb-2">💡 Example Response:</h5>
                                                            <div className="bg-white p-3 rounded border border-indigo-100">
                                                                <p className="text-indigo-700 italic">{exampleMatch[1].trim()}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Common Mistakes */}
                                                    {mistakesMatch && (
                                                        <div className="mb-4">
                                                            <h5 className="font-medium text-indigo-800 mb-2">⚠️ Common Mistakes to Avoid:</h5>
                                                            <div className="bg-white p-3 rounded border border-indigo-100">
                                                                <p className="text-indigo-700">{mistakesMatch[1].trim()}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Pro Tips */}
                                                    {tipsMatch && (
                                                        <div>
                                                            <h5 className="font-medium text-indigo-800 mb-2">🚀 Pro Tips:</h5>
                                                            <div className="bg-white p-3 rounded border border-indigo-100">
                                                                <p className="text-indigo-700">{tipsMatch[1].trim()}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Fallback message if no detailed analysis found */}
                                            {!questionAnalysis && (
                                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                    <p className="text-yellow-800">
                                                        <strong>Note:</strong> Detailed analysis for this question is not available.
                                                        Please check the comprehensive analysis section below for general feedback.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Debug Section - Show raw analysis */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-4">Analysis Content</h3>
                                        <div className="bg-white p-4 rounded border overflow-auto max-h-96">
                                            <pre className="text-xs whitespace-pre-wrap">{feedback.analysis}</pre>
                                        </div>
                                    </div>
                                )}

                                {/* Comprehensive Analysis */}
                                {feedback.analysis && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-6">Comprehensive Analysis</h3>
                                        <div
                                            className="space-y-6"
                                            dangerouslySetInnerHTML={{
                                                __html: feedback.analysis
                                                    .split('### COMPREHENSIVE ANALYSIS')[1]
                                                    ?.split('### QUESTION-BY-QUESTION IMPROVEMENT GUIDE')[0]
                                                    ?.replace(/\n\n/g, '</p><p>')
                                                    ?.replace(/\n/g, '<br />')
                                                    ?.replace(/#### (.*?):/g, '<h4 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1:</h4>')
                                                    ?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    ?.replace(/- /g, '• ')
                                                    ?.replace(/### (.*?)$/gm, '<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h3>') || 'Analysis content not available'
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Question-by-Question Improvement Guide */}
                                {feedback.analysis && feedback.analysis.includes('### QUESTION-BY-QUESTION IMPROVEMENT GUIDE') && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-6">Question-by-Question Improvement Guide</h3>
                                        <div className="space-y-6">
                                            {feedback.responses && feedback.responses.map((response, index) => {
                                                // Extract the improvement guide for this specific question
                                                const improvementGuideMatch = feedback.analysis.match(
                                                    new RegExp(`Question ${index + 1}:.*?(?=Question ${index + 2}:|$)`, 's')
                                                );

                                                if (!improvementGuideMatch) return null;

                                                const improvementText = improvementGuideMatch[0];

                                                // Parse the improvement sections
                                                const whatYouSaidWellMatch = improvementText.match(/\*\*What you said well\*\*: (.*?)(?=\*\*What needs improvement|$)/s);
                                                const whatNeedsImprovementMatch = improvementText.match(/\*\*What needs improvement\*\*: (.*?)(?=\*\*Better approach|$)/s);
                                                const betterApproachMatch = improvementText.match(/\*\*Better approach\*\*: (.*?)(?=\*\*Sample improved response|$)/s);
                                                const sampleResponseMatch = improvementText.match(/\*\*Sample improved response\*\*: (.*?)(?=\n\n|$)/s);

                                                return (
                                                    <div key={`improvement-${index}`} className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                                                        <h4 className="text-lg font-semibold text-green-900 mb-4">Question {index + 1}: {response.question}</h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* What you said well */}
                                                            {whatYouSaidWellMatch && (
                                                                <div className="bg-white p-4 rounded-lg border border-green-100">
                                                                    <h5 className="font-medium text-green-800 mb-2">✅ What you said well:</h5>
                                                                    <p className="text-green-700">{whatYouSaidWellMatch[1].trim()}</p>
                                                                </div>
                                                            )}

                                                            {/* What needs improvement */}
                                                            {whatNeedsImprovementMatch && (
                                                                <div className="bg-white p-4 rounded-lg border border-green-100">
                                                                    <h5 className="font-medium text-green-800 mb-2">🔧 What needs improvement:</h5>
                                                                    <p className="text-green-700">{whatNeedsImprovementMatch[1].trim()}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Better approach */}
                                                        {betterApproachMatch && (
                                                            <div className="mt-4 bg-white p-4 rounded-lg border border-green-100">
                                                                <h5 className="font-medium text-green-800 mb-2">🎯 Better approach:</h5>
                                                                <p className="text-green-700">{betterApproachMatch[1].trim()}</p>
                                                            </div>
                                                        )}

                                                        {/* Sample improved response */}
                                                        {sampleResponseMatch && (
                                                            <div className="mt-4 bg-white p-4 rounded-lg border border-green-100">
                                                                <h5 className="font-medium text-green-800 mb-2">💡 Sample improved response:</h5>
                                                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                                    <p className="text-gray-700 italic">{sampleResponseMatch[1].trim()}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewFeedback; 





