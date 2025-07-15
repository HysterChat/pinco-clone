import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyApplications = () => {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Applications</h1>
                    <p className="text-white mt-1">Track your job applications</p>
                </div>
            </div>

            {/* No Applications State */}
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-8 w-8 text-indigo-600" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No applications yet</h3>
                <p className="text-black mb-6">Start applying to jobs to track your applications here</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Browse Job Listings
                </Button>
            </div>

            {/* Applications List - Hidden initially, will be shown when there are applications */}
            <div className="hidden space-y-4">
                {/* Application Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-black">Senior Software Engineer</h3>
                            <p className="text-black">Google • Mountain View, CA</p>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1 text-sm text-black">
                                    <Clock className="h-4 w-4" />
                                    <span>Applied 2 days ago</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Application Viewed</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="text-black">
                            View Details
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyApplications; 





