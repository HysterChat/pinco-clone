import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, AlertCircle, Loader2 } from 'lucide-react';
import api, { Profile, ProfileUpdate, isProfileComplete } from '@/services/api';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Settings = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [form, setForm] = useState<ProfileUpdate>({
        full_name: '',
        phone: '',
        location: '',
        role: '',
        experience_level: '',
        profile_photo: '',
        course_name: '',
        college_name: '',
        branch_name: '',
        roll_number: '',
        year_of_passing: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const requiresCompletion = location.state?.requiresCompletion;

    // Course, College, Branch options
    const courseOptions = [
        "B.Tech",
        "M.Tech",
        "MCA",
        "MBA",
        "BBA",
        "BCOM",
        "BSC",
        "Other"
    ];
    const collegeOptions = [
        "Narsaraopeta Engineering College",
        "Malineni Lakshmaiah Womens Engineering College",
        "Sri Mitapalli College of Engineering",
        "Sri Mitapalli Institute of Engineering for Women",
        "KKR & KSR Institute of Technology and Sciences",
        "SRK Institute of Technology",
        "Vijaya Institute of Technology for Women",
        "Other"
    ];
    const branchOptions = [
        "CSE",
        "ECE",
        "IT",
        "CSE AI & ML",
        "CSE AI & DS",
        "CSE DS",
        "CSE Cyber Security",
        "CSE AI",
        "Civil",
        "EEE",
        "Mech",
        "Computer Applications",
        "Finance",
        "Marketing",
        "HR",
        "Other"
    ];
    const [showCustomCourse, setShowCustomCourse] = useState(false);
    const [showCustomCollege, setShowCustomCollege] = useState(false);
    const [showCustomBranch, setShowCustomBranch] = useState(false);

    // Local state for custom input fields
    const [customCourse, setCustomCourse] = useState("");
    const [customCollege, setCustomCollege] = useState("");
    const [customBranch, setCustomBranch] = useState("");

    // Show custom input only when 'Other' is selected
    useEffect(() => {
        setShowCustomCourse(form.course_name === "Other");
        setShowCustomCollege(form.college_name === "Other");
        setShowCustomBranch(form.branch_name === "Other");
    }, [form.course_name, form.college_name, form.branch_name]);

    // When switching away from 'Other', clear custom input
    useEffect(() => {
        if (form.course_name !== "Other") setCustomCourse("");
        if (form.college_name !== "Other") setCustomCollege("");
        if (form.branch_name !== "Other") setCustomBranch("");
    }, [form.course_name, form.college_name, form.branch_name]);

    // When loading profile, if value is not in options, set custom value and dropdown to 'Other'
    useEffect(() => {
        if (form.course_name && !courseOptions.includes(form.course_name)) {
            setCustomCourse(form.course_name);
            setForm(prev => ({ ...prev, course_name: "Other" }));
        }
        if (form.college_name && !collegeOptions.includes(form.college_name)) {
            setCustomCollege(form.college_name);
            setForm(prev => ({ ...prev, college_name: "Other" }));
        }
        if (form.branch_name && !branchOptions.includes(form.branch_name)) {
            setCustomBranch(form.branch_name);
            setForm(prev => ({ ...prev, branch_name: "Other" }));
        }
        // eslint-disable-next-line
    }, [profile]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsFetching(true);
                setError(null);
                const data = await api.getProfile();
                setProfile(data);
                setForm({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    role: data.role || '',
                    experience_level: data.experience_level || '',
                    profile_photo: data.profile_photo || '',
                    course_name: data.course_name || '',
                    college_name: data.college_name || '',
                    branch_name: data.branch_name || '',
                    roll_number: data.roll_number || '',
                    year_of_passing: data.year_of_passing || '',
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile. Please try again.');
                toast.error('Failed to load profile');
            } finally {
                setIsFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (field: keyof ProfileUpdate, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // On save, use custom value if 'Other' is selected
    const handleSave = async () => {
        const mandatoryFields = ['full_name', 'course_name', 'college_name', 'branch_name', 'roll_number', 'year_of_passing'];
        // Prepare the data to save
        const dataToSave = {
            ...form,
            course_name: form.course_name === "Other" ? customCourse : form.course_name,
            college_name: form.college_name === "Other" ? customCollege : form.college_name,
            branch_name: form.branch_name === "Other" ? customBranch : form.branch_name,
        };
        const missingFields = mandatoryFields.filter(field => !dataToSave[field as keyof ProfileUpdate]);
        if (missingFields.length > 0) {
            toast.error(`Please fill in all mandatory fields: ${missingFields.join(', ')}`);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const updated = await api.updateProfile(dataToSave);
            setProfile(updated);
            toast.success('Profile updated successfully!');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 11 }, (_, i) => (2030 - i).toString());

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-pinco-lightblue" />
                    <p className="text-pinco-gray">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                    className="mt-4"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-pinco-white">Settings</h1>
                <p className="text-pinco-gray mt-1">Manage your account preferences</p>
            </div>

            {/* Profile Completion Alert */}
            {requiresCompletion && (
                <div className="mb-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                        <AlertCircle className="h-6 w-6 text-yellow-500 mt-1" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-500">Complete Your Profile</h3>
                            <p className="text-yellow-400/90 mt-1">
                                Please complete your profile information to unlock all dashboard features. Required fields are marked with an asterisk (*).
                            </p>
                            <ul className="mt-3 space-y-1 text-sm text-yellow-400/80">
                                <li>• Full Name</li>
                                <li>• Course Name</li>
                                <li>• College Name</li>
                                <li>• Branch Name</li>
                                <li>• Roll Number</li>
                                <li>• Year of Passing</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="space-y-8">
                        {/* Profile Photo */}
                        {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h2 className="text-lg font-semibold text-pinco-navy mb-4">Profile Photo</h2>
                            <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-full bg-pinco-lightblue/10 flex items-center justify-center text-2xl font-semibold text-pinco-lightblue">
                                    {profile?.full_name ? profile.full_name[0] : 'U'}
                                </div>
                                <div>
                                    <Button variant="outline" className="mb-2 text-pinco-black">Change Photo</Button>
                                    <p className="text-sm text-pinco-gray">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Personal Information */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h2 className="text-lg font-semibold text-pinco-navy mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-pinco-black">Full Name *</Label>
                                    <Input id="fullName" value={form.full_name} onChange={e => handleInputChange('full_name', e.target.value)} className="text-pinco-black" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-pinco-black">Email</Label>
                                    <Input id="email" type="email" value={profile?.email || ''} readOnly className="bg-pinco-black/10 cursor-not-allowed text-pinco-black" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-pinco-black">Phone</Label>
                                    <Input id="phone" type="tel" value={form.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="Enter your phone number" className="placeholder:text-pinco-black text-pinco-black" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-pinco-black">Location</Label>
                                    <Input id="location" value={form.location} onChange={e => handleInputChange('location', e.target.value)} placeholder="Enter your location" className="placeholder:text-pinco-black text-pinco-black" />
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h2 className="text-lg font-semibold text-pinco-navy mb-4">Academic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Course Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="course_name" className="text-pinco-black">Course Name *</Label>
                                    <Select
                                        value={courseOptions.includes(form.course_name) ? form.course_name : (form.course_name ? "Other" : "")}
                                        onValueChange={value => {
                                            if (value === "Other") {
                                                setShowCustomCourse(true);
                                                handleInputChange('course_name', "Other");
                                            } else {
                                                setShowCustomCourse(false);
                                                handleInputChange('course_name', value);
                                            }
                                        }}
                                        required
                                    >
                                        <SelectTrigger className="text-pinco-black">
                                            <SelectValue placeholder="Select your course name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courseOptions.map(option => (
                                                <SelectItem key={option} value={option} className="text-pinco-black">
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {showCustomCourse && (
                                        <Input
                                            id="custom_course_name"
                                            value={customCourse}
                                            onChange={e => setCustomCourse(e.target.value)}
                                            placeholder="Enter your course name"
                                            className="text-pinco-black mt-2"
                                            required
                                        />
                                    )}
                                </div>
                                {/* College Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="college_name" className="text-pinco-black">College Name *</Label>
                                    <Select
                                        value={collegeOptions.includes(form.college_name) ? form.college_name : (form.college_name ? "Other" : "")}
                                        onValueChange={value => {
                                            if (value === "Other") {
                                                setShowCustomCollege(true);
                                                handleInputChange('college_name', "Other");
                                            } else {
                                                setShowCustomCollege(false);
                                                handleInputChange('college_name', value);
                                            }
                                        }}
                                        required
                                    >
                                        <SelectTrigger className="text-pinco-black">
                                            <SelectValue placeholder="Select your college name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collegeOptions.map(option => (
                                                <SelectItem key={option} value={option} className="text-pinco-black">
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {showCustomCollege && (
                                        <Input
                                            id="custom_college_name"
                                            value={customCollege}
                                            onChange={e => setCustomCollege(e.target.value)}
                                            placeholder="Enter your college name"
                                            className="text-pinco-black mt-2"
                                            required
                                        />
                                    )}
                                </div>
                                {/* Branch Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="branch_name" className="text-pinco-black">Branch Name *</Label>
                                    <Select
                                        value={branchOptions.includes(form.branch_name) ? form.branch_name : (form.branch_name ? "Other" : "")}
                                        onValueChange={value => {
                                            if (value === "Other") {
                                                setShowCustomBranch(true);
                                                handleInputChange('branch_name', "Other");
                                            } else {
                                                setShowCustomBranch(false);
                                                handleInputChange('branch_name', value);
                                            }
                                        }}
                                        required
                                    >
                                        <SelectTrigger className="text-pinco-black">
                                            <SelectValue placeholder="Select your branch name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branchOptions.map(option => (
                                                <SelectItem key={option} value={option} className="text-pinco-black">
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {showCustomBranch && (
                                        <Input
                                            id="custom_branch_name"
                                            value={customBranch}
                                            onChange={e => setCustomBranch(e.target.value)}
                                            placeholder="Enter your branch name"
                                            className="text-pinco-black mt-2"
                                            required
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roll_number" className="text-pinco-black">Roll Number *</Label>
                                    <Input
                                        id="roll_number"
                                        value={form.roll_number}
                                        onChange={e => handleInputChange('roll_number', e.target.value)}
                                        placeholder="Enter your roll number"
                                        className="text-pinco-black"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year_of_passing" className="text-pinco-black">Year of Passing *</Label>
                                    <Select value={form.year_of_passing} onValueChange={value => handleInputChange('year_of_passing', value)} required>
                                        <SelectTrigger className="text-pinco-black">
                                            <SelectValue placeholder="Enter your year of passing" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map(year => (
                                                <SelectItem key={year} value={year} className="text-pinco-black">
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        {/* <div className="bg-white rounded-xl p-6 border border-slate-200">
                            <h2 className="text-lg font-semibold text-pinco-navy mb-4">Professional Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-pinco-black">Current Role</Label>
                                    <Input id="role" value={form.role} onChange={e => handleInputChange('role', e.target.value)} placeholder="e.g. Software Engineer" className="placeholder:text-pinco-black text-pinco-black" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="text-pinco-black">Experience Level</Label>
                                    <Select value={form.experience_level} onValueChange={value => handleInputChange('experience_level', value)}>
                                        <SelectTrigger className="text-pinco-black">
                                            <SelectValue placeholder="Select experience level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entry" className="text-pinco-black">Entry Level</SelectItem>
                                            <SelectItem value="mid" className="text-pinco-black">Mid Level</SelectItem>
                                            <SelectItem value="senior" className="text-pinco-black">Senior Level</SelectItem>
                                            <SelectItem value="lead" className="text-pinco-black">Lead</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Save Changes Button */}
            <div className="mt-8 flex justify-end">
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Settings; 






