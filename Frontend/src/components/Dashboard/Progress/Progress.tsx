import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, Award, Brain, Clock } from 'lucide-react';
import API from '@/services/api';

const Progress = () => {
    const [performanceData, setPerformanceData] = useState<{ date: string; score: number }[]>([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await API.getScores();
                // Transform scores array into chart data format
                const chartData = response.scores.map((score, index) => ({
                    date: `Intv ${index + 1}`,
                    score: score
                }));
                setPerformanceData(chartData);
            } catch (error) {
                console.error('Error fetching scores:', error);
                // Use sample data as fallback
                setPerformanceData([
                    { date: 'Interview 1', score: 65 },
                    { date: 'Interview 2', score: 70 },
                    { date: 'Interview 3', score: 75 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, []);

    const skillMetrics = [
        {
            name: "Technical Knowledge",
            score: 85,
            icon: Brain,
            color: "indigo"
        },
        {
            name: "Communication",
            score: 75,
            icon: Target,
            color: "purple"
        },
        {
            name: "Problem Solving",
            score: 80,
            icon: Award,
            color: "pink"
        },
        {
            name: "Time Management",
            score: 70,
            icon: Clock,
            color: "blue"
        }
    ];

    return (
        <div className="p-4 md:p-6 w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-bold text-white-900">Progress Overview</h1>
                <p className="text-sm md:text-base text-white-600 mt-1">Track your interview performance and improvements</p>

            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200 mb-6 md:mb-8 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-slate-900">Performance Trend</h2>
                        <p className="text-xs md:text-sm text-slate-600">Your interview scores over time</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="text-slate-600 flex-1 sm:flex-none">Week</Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 flex-1 sm:flex-none">Month</Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 flex-1 sm:flex-none">Year</Button>
                    </div>
                </div>
                <div className="h-[250px] md:h-[300px] w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p>Loading scores...</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#64748B" tick={{ fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    dot={{ fill: '#6366F1', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Skill Metrics */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                {skillMetrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`bg-${metric.color}-100 p-2 rounded-lg`}>
                                <metric.icon className={`h-4 md:h-5 w-4 md:w-5 text-${metric.color}-600`} />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-slate-600">Last 30 days</span>
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-1">{metric.name}</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                                <div
                                    className={`bg-${metric.color}-600 h-2 rounded-full`}
                                    style={{ width: `${metric.score}%` }}
                                />
                            </div>
                            <span className="text-xs md:text-sm font-medium text-slate-600">{metric.score}%</span>
                        </div>
                    </div>
                ))}
            </div> */}

            {/* Recent Improvements */}
            {/* <div className="bg-white rounded-xl p-4 md:p-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
                    <div>
                        <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent Improvements</h2>
                        <p className="text-xs md:text-sm text-slate-600">Areas where you've shown progress</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
                </div>
                <div className="space-y-3 md:space-y-4">
                    {[
                        {
                            area: "System Design",
                            improvement: "+15%",
                            description: "Better understanding of scalability concepts"
                        },
                        {
                            area: "Algorithm Optimization",
                            improvement: "+12%",
                            description: "Improved time complexity analysis"
                        },
                        {
                            area: "Communication",
                            improvement: "+10%",
                            description: "Clearer explanation of technical concepts"
                        }
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-slate-200">
                            <div>
                                <h3 className="text-sm md:text-base font-medium text-slate-900">{item.area}</h3>
                                <p className="text-xs md:text-sm text-slate-600">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                                <span className="text-xs md:text-sm font-medium text-green-500">{item.improvement}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
};

export default Progress; 