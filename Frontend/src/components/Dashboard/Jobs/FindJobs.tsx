import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Briefcase } from 'lucide-react';

const FindJobs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [jobType, setJobType] = useState('');

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Job Listings</h1>
                <p className="text-white mt-1">Find your next role from our listings</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input
                        type="text"
                        placeholder="Search jobs by title, description, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white w-full text-black placeholder:text-slate-400"
                    />
                </div>

                {/* Experience Level Filter */}
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="w-[200px] bg-white text-black">
                        <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="entry" className="text-black">Entry Level</SelectItem>
                        <SelectItem value="mid" className="text-black">Mid Level</SelectItem>
                        <SelectItem value="senior" className="text-black">Senior Level</SelectItem>
                        <SelectItem value="lead" className="text-black">Lead</SelectItem>
                    </SelectContent>
                </Select>

                {/* Job Type Filter */}
                <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-[200px] bg-white text-black">
                        <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full-time" className="text-black">Full Time</SelectItem>
                        <SelectItem value="part-time" className="text-black">Part Time</SelectItem>
                        <SelectItem value="contract" className="text-black">Contract</SelectItem>
                        <SelectItem value="internship" className="text-black">Internship</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* No Jobs Found State */}
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-indigo-600" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">No job listings found</h3>
                <p className="text-black">Check back later for new opportunities</p>
            </div>
        </div>
    );
};

export default FindJobs; 






