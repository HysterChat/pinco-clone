import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from 'lucide-react';
import { useFormOptions } from '@/hooks/useFormOptions';
import api, { InterviewFormData } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface CreateInterviewFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// Add scrollbar styles
const scrollbarStyles = {
    '.scrollbar-visible': {
        '&::-webkit-scrollbar': {
            width: 'var(--scrollbar-width)',
            backgroundColor: 'var(--scrollbar-track-bg)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--scrollbar-thumb-bg)',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--scrollbar-thumb-bg) var(--scrollbar-track-bg)',
    }
} as const;

const CreateInterviewForm: React.FC<CreateInterviewFormProps> = ({ open, onClose, onSuccess }) => {
    const { formOptions, loading, error } = useFormOptions();
    const [submitting, setSubmitting] = useState(false);
    const [showMoreIndicator, setShowMoreIndicator] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState<InterviewFormData>({
        company_name: '',
        interview_focus: [],
        difficulty_level: '',
        duration: '',
        job_category: '',
        sub_job_category: ''
    });

    const handleChange = (name: string, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset sub_job_category when job_category changes
            ...(name === 'job_category' ? { sub_job_category: '' } : {})
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check required fields
        const requiredFields = {
            'Interview Focus': formData.interview_focus.length === 0,
            'Difficulty Level': !formData.difficulty_level,
            'Duration': !formData.duration,
            'Job Category': !formData.job_category,
            'Sub Job Category': !formData.sub_job_category
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, isEmpty]) => isEmpty)
            .map(([fieldName]) => fieldName);

        if (missingFields.length > 0) {
            toast({
                title: "Required Fields Missing",
                description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            await api.createInterview(formData);
            toast({
                title: "Success",
                description: "Interview created successfully",
            });
            onSuccess?.();
            onClose();
            navigate('/dashboard/interviews');
        } catch (err) {
            console.error('Error creating interview:', err);
            toast({
                title: "Error",
                description: "Failed to create interview. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const checkScroll = () => {
            if (scrollRef.current) {
                const { scrollHeight, clientHeight } = scrollRef.current;
                setShowMoreIndicator(scrollHeight > clientHeight);
            }
        };

        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-[600px] p-0 gap-0 bg-white">
                <div className="flex flex-col h-[85vh]">
                    <DialogHeader className="px-6 py-4 border-b bg-[#f8fafc] flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                Create New Interview
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Set up your interview details to get started
                            </p>
                        </div>
                    </DialogHeader>

                    <ScrollArea
                        className="flex-1 px-6 py-4"
                    >
                        <div
                            className="h-full overflow-auto custom-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#2563eb #e2e8f0'
                            } as React.CSSProperties}
                        >
                            <style>
                                {`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 12px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #e2e8f0;
                                    border-radius: 8px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background-color: #2563eb;
                                    border-radius: 8px;
                                    border: 3px solid #e2e8f0;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background-color: #1d4ed8;
                                }
                                `}
                            </style>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name" className="text-sm font-medium text-gray-900">
                                            Company (Optional)
                                        </Label>
                                        <Input
                                            id="company_name"
                                            placeholder="e.g., Google"
                                            value={formData.company_name}
                                            onChange={(e) => handleChange('company_name', e.target.value)}
                                            className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-900">
                                            Interview Focus
                                        </Label>
                                        <Select
                                            value={formData.interview_focus[0]}
                                            onValueChange={(value) => handleChange('interview_focus', [value])}
                                        >
                                            <SelectTrigger className="w-full border-gray-200">
                                                <SelectValue placeholder="Select focus areas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formOptions?.interview_focus.map((focus) => (
                                                    <SelectItem key={focus} value={focus}>
                                                        {focus}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-900">
                                            Difficulty Level
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formOptions?.difficulty_levels.map((level) => (
                                                <Button
                                                    key={level}
                                                    type="button"
                                                    variant={formData.difficulty_level === level ? "default" : "outline"}
                                                    className={`w-full capitalize ${formData.difficulty_level === level
                                                        ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => handleChange('difficulty_level', level)}
                                                >
                                                    {level}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-900">
                                            Duration
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formOptions?.durations.map((duration) => (
                                                <Button
                                                    key={duration}
                                                    type="button"
                                                    variant={formData.duration === duration ? "default" : "outline"}
                                                    className={`w-full ${formData.duration === duration
                                                        ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => handleChange('duration', duration)}
                                                >
                                                    {duration}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-900">
                                            Job Category
                                        </Label>
                                        <Select
                                            value={formData.job_category}
                                            onValueChange={(value) => handleChange('job_category', value)}
                                        >
                                            <SelectTrigger className="w-full border-gray-200">
                                                <SelectValue placeholder="Select job category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formOptions?.job_categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>


                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-900">
                                            Sub Job Category
                                        </Label>
                                        <Select
                                            value={formData.sub_job_category}
                                            onValueChange={(value) => handleChange('sub_job_category', value)}
                                            disabled={!formData.job_category}
                                        >
                                            <SelectTrigger className="w-full border-gray-200">
                                                <SelectValue placeholder="Select sub job category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formData.job_category &&
                                                    formOptions?.sub_job_categories[formData.job_category]?.map((subCategory) => (
                                                        <SelectItem key={subCategory} value={subCategory}>
                                                            {subCategory}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {showMoreIndicator && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                    </ScrollArea>

                    <div className="px-6 py-4 border-t mt-auto bg-white">
                        <div className="flex justify-between items-center gap-3">
                            {(!formData.interview_focus.length || !formData.difficulty_level || !formData.duration || !formData.job_category || !formData.sub_job_category) && (
                                <p className="text-sm text-orange-600">
                                    Please fill in all required fields below
                                </p>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="px-4 hover:bg-gray-50"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                                    onClick={handleSubmit}
                                    disabled={submitting || !formData.interview_focus.length || !formData.difficulty_level || !formData.duration || !formData.job_category || !formData.sub_job_category}
                                >
                                    {submitting ? 'Creating...' : 'Create Interview'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateInterviewForm;
