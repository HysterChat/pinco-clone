import React from 'react';
import { Book, Video, FileText, ArrowRight, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Resources = () => {
    const resources = [
        {
            title: "Interview Preparation Guide",
            description: "A comprehensive guide to ace your technical interviews",
            type: "Guide",
            duration: "15 min read",
            icon: FileText,
            color: "indigo"
        },
        {
            title: "System Design Fundamentals",
            description: "Learn the basics of system design interviews",
            type: "Video Course",
            duration: "2 hours",
            icon: Video,
            color: "purple"
        },
        {
            title: "Data Structures & Algorithms",
            description: "Master the most common DSA interview questions",
            type: "Course",
            duration: "8 hours",
            icon: Book,
            color: "pink"
        },
        {
            title: "Mock Interview Sessions",
            description: "Practice with peers in real-time mock interviews",
            type: "Community",
            duration: "1 hour sessions",
            icon: Users,
            color: "green"
        }
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-pinco-white">Resources</h1>
                <p className="text-pinco-gray mt-1">Learning materials and interview guides</p>
            </div>

            {/* Featured Resource */}
            <div className="bg-gradient-to-r from-pinco-lightblue to-pinco-navy rounded-xl p-8 text-white mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">New to Technical Interviews?</h2>
                        <p className="text-indigo-100 mb-6">Start with our beginner-friendly guide to technical interviews</p>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                            Get Started
                        </Button>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl">
                        <Book className="h-8 w-8 text-white" />
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                {resources.map((resource, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`bg-${resource.color}-100 p-2 rounded-lg`}>
                                    <resource.icon className={`h-5 w-5 text-${resource.color}-600`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{resource.title}</h3>
                                    <p className="text-sm text-slate-600">{resource.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{resource.duration}</span>
                                </div>
                                <span className="text-sm text-slate-600">{resource.type}</span>
                            </div>
                            <Button variant="ghost" className="text-indigo-600 p-0 hover:bg-transparent">
                                View Resource
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Categories */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
                    <Button variant="ghost" className="text-indigo-600">
                        View All
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="justify-start text-slate-600">
                        <Book className="h-4 w-4 mr-2" />
                        Guides
                    </Button>
                    <Button variant="outline" className="justify-start text-slate-600">
                        <Video className="h-4 w-4 mr-2" />
                        Video Courses
                    </Button>
                    <Button variant="outline" className="justify-start text-slate-600">
                        <Users className="h-4 w-4 mr-2" />
                        Community
                    </Button>
                    <Button variant="outline" className="justify-start text-slate-600">
                        <FileText className="h-4 w-4 mr-2" />
                        Practice Sets
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Resources; 