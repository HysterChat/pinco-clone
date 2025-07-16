import axios from 'axios';

// const BASE_URL = 'https://pincoclone.hysterchat.com/api';
const BASE_URL = 'http://localhost:8000/api';


// Create axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL
});

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage
            localStorage.clear();
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth interfaces
export interface LoginData {
    username: string;
    password: string;
}

export interface SignupData {
    fullName: string;
    username: string;
    email: string;
    password: string;
    accountType: 'admin' | 'employer' | 'free_user';
}

export interface ForgotPasswordData {
    email: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: string;
    fullName: string;
    username: string;
    email: string;
    accountType: string;
    created_at: string;
    updated_at: string;
}

export interface InterviewFormData {
    company_name?: string;
    interview_focus: string[];
    difficulty_level: string;
    duration: string;
    job_category: string;
    sub_job_category: string;
}

export interface InterviewResponse {
    status: string;
    data?: any;
    message?: string;
}

export interface FormOptions {
    interview_focus: string[];
    difficulty_levels: string[];
    durations: string[];
    job_categories: string[];
    sub_job_categories: {
        [key: string]: string[];
    };
}

export interface Profile {
    email: string;
    full_name: string;
    phone: string;
    location: string;
    role: string;
    experience_level: string;
    profile_photo: string;
    // Academic fields
    course_name: string;
    college_name: string;
    branch_name: string;
    roll_number: string;
    year_of_passing: string;
    // Status fields
    profile_completed: boolean;
    // Performance fields
    completed_interviews: number;
    hours_practiced: number;
    average_score: number;
    total_score: number;
    scores: number[];  // Array of all interview scores
}

export interface ProfileUpdate {
    full_name: string;
    phone: string;
    location: string;
    role: string;
    experience_level: string;
    profile_photo: string;
    // Academic fields
    course_name: string;
    college_name: string;
    branch_name: string;
    roll_number: string;
    year_of_passing: string;
}

export interface InterviewSessionData {
    duration: string;
    difficulty_level: string;
    company_name?: string;
    interview_focus: string[];
    job_category: string;
    sub_job_category: string;
}

export interface QuestionResponse {
    interview_duration: string;
    time_per_question: string;
    total_questions: number;
    questions: string[];
}

export interface InterviewAnalysisRequest {
    responses: Array<{
        question: string;
        answer: string;
    }>;
    job_category: string;
    sub_job_category: string;
    interview_focus: string[];
    difficulty_level: string;
}

export interface InterviewAnalysisResponse {
    status: string;
    feedback_id: string;
    analysis: string;
    total_score: number;
    average_score: number;
    summary: {
        overall_score: number;
        current_status: string;
        timeline_to_ready: string;
        confidence_level: string;
    };
    metadata: {
        job_role: string;
        difficulty_level: string;
        total_questions: number;
        interview_focus: string[];
    };
    responses: Array<{
        question: string;
        answer: string;
    }>;
}

export interface ReadingTestResponse {
    sentences: string[];
    difficulty_level: string;
}

export interface RepeatSentenceResponse {
    sentences: string[];
    difficulty_level: string;
}

export interface ShortAnswerResponse {
    questions: string[];
    difficulty_level: string;
}

export const isProfileComplete = (profile: Profile | null): boolean => {
    if (!profile) return false;
    return profile.profile_completed;
};

// Payment interfaces
export interface PaymentOrder {
    key_id: string;
    order_id: string;
    amount: number;
    currency: string;
}

export interface PaymentVerification {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    user_id?: string;  // Make user_id optional to maintain backward compatibility
}

export interface SubscriptionStatus {
    is_premium: boolean;
    subscription_status: string;
    subscription_end_date: string | null;
    completed_interviews: number;
    can_take_interview: boolean;
    can_access_versant: boolean;
    remaining_free_interviews: number | null;
}

export interface SaveFeedbackData {
    interview_id: string;
    overall_score: number;
    analysis: string;
    summary: {
        overall_score: number;
        current_status: string;
        timeline_to_ready: string;
        confidence_level: string;
    };
    metadata: {
        job_role: string;
        difficulty_level: string;
        total_questions: number;
        interview_focus: string[];
        job_category?: string;
        sub_job_category?: string;
        duration?: string;
    };
    responses: Array<{
        question: string;
        answer: string;
    }>;
    score?: number;
}

export interface VersantFeedbackRequest {
    sentences: string[];  // Array of transcribed sentences
}

export interface VersantFeedbackResponse {
    status: string;
    areas_for_improvement: string;
    total_score: number;
}

export interface Coupon {
    id: string;
    code: string;
    discount_amount?: number;
    discount_percent?: number;
    valid_from?: string;
    valid_to?: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CouponCreate {
    code: string;
    discount_amount?: number;
    discount_percent?: number;
    valid_from?: string;
    valid_to?: string;
    active?: boolean;
}

export interface CouponUpdate {
    discount_amount?: number;
    discount_percent?: number;
    valid_from?: string;
    valid_to?: string;
    active?: boolean;
}

export interface UserListItem {
    username: string;
    email: string;
    accountType: string;
    is_paid: boolean;
    subscription_status: string;
    subscription_end_date: string | null;
    college_name: string | null;
    branch_name: string | null;
    phone: string | null;
}

// Create the API object with all methods
const API = {
    // Auth endpoints
    login: async (data: LoginData): Promise<AuthResponse> => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', data.username);
            formData.append('password', data.password);

            const response = await axiosInstance.post(`/auth/login`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    signup: async (data: SignupData): Promise<UserResponse> => {
        try {
            const response = await axiosInstance.post(`/auth/register`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post(`/auth/logout`);
            localStorage.clear();
            window.location.href = '/login';
        } catch (error) {
            // Even if logout fails, clear local storage and redirect
            localStorage.clear();
            window.location.href = '/login';
        }
    },

    getCurrentUser: async (): Promise<UserResponse> => {
        try {
            const response = await axiosInstance.get(`/users/me`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
        try {
            await axiosInstance.post(`/auth/forgot-password`, data);
        } catch (error) {
            throw error;
        }
    },

    // Create new interview
    createInterview: async (formData: InterviewFormData): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.post(`/interview-form`, formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get a specific interview by ID
    getInterview: async (id: string): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.get(`/interview-form/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all interviews
    getAllInterviews: async (): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.get(`/interview-forms`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update an interview
    updateInterview: async (id: string, formData: InterviewFormData): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.put(`/interview-form/${id}`, formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete an interview
    deleteInterview: async (id: string): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.delete(`/interview-form/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Search interviews with filters
    searchInterviews: async (params: {
        query?: string;
        job_category?: string;
        difficulty_level?: string;
        duration?: string;
    }): Promise<InterviewResponse> => {
        try {
            const response = await axiosInstance.get(`/interview-forms/search`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get form options for dropdowns
    getFormOptions: async (): Promise<FormOptions> => {
        try {
            const response = await axiosInstance.get(`/form-options`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProfile: async (): Promise<Profile> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axiosInstance.get(`/profile/me`);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    updateProfile: async (data: ProfileUpdate): Promise<Profile> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axiosInstance.put(`/profile/me`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    generateQuestion: async (sessionData: InterviewSessionData): Promise<QuestionResponse> => {
        try {
            const response = await axiosInstance.post(`/generate-question`, sessionData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    analyzeInterview: async (data: InterviewAnalysisRequest): Promise<InterviewAnalysisResponse> => {
        try {
            const response = await axiosInstance.post(`/analyze-interview`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    saveFeedback: async (feedbackData: SaveFeedbackData) => {
        try {
            const response = await axiosInstance.post(`/interview-feedback`, feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error saving feedback:', error);
            throw error;
        }
    },

    isProfileComplete: async () => {
        try {
            const profile = await API.getProfile();
            return isProfileComplete(profile);
        } catch (error) {
            return false;
        }
    },

    getReadingTest: async (difficulty?: string): Promise<ReadingTestResponse> => {
        try {
            const response = await axiosInstance.get(`/reading-test`, {
                params: { difficulty }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRepeatSentenceTest: async (difficulty?: string): Promise<RepeatSentenceResponse> => {
        try {
            const response = await axiosInstance.get(`/repeat-sentence`, {
                params: { difficulty }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getShortAnswerTest: async (): Promise<ShortAnswerResponse> => {
        try {
            const response = await axiosInstance.get(`/short-answer`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getStoryTeller: async (): Promise<{ stories: string[] }> => {
        try {
            const response = await axiosInstance.get(`/story-teller`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getSentenceBuild: async (): Promise<{ questions: { phrases: string[]; correct: string }[] }> => {
        try {
            const response = await axiosInstance.get(`/sentence-build`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get user's scores for progress tracking
    getScores: async (): Promise<{ scores: number[] }> => {
        try {
            const response = await axiosInstance.get(`/profile/scores`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getOpenQuestions: async (): Promise<{ questions: string[] }> => {
        try {
            const response = await axiosInstance.get(`/open-questions`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Payment endpoints
    async createPaymentOrder(couponCode?: string): Promise<PaymentOrder> {
        const user = await this.getCurrentUser();
        const response = await axiosInstance.post(`/payments/create-subscription`, null, {
            params: {
                user_id: user.id,
                coupon_code: couponCode || undefined
            }
        });
        return response.data;
    },

    async verifyPayment(paymentData: PaymentVerification): Promise<any> {
        const userId = paymentData.user_id;
        // Remove user_id from paymentData before sending
        const { user_id, ...paymentVerificationData } = paymentData;
        const response = await axiosInstance.post(
            `/payments/verify-payment?user_id=${userId}`,
            paymentVerificationData
        );
        return response.data;
    },

    async getSubscriptionStatus(): Promise<SubscriptionStatus> {
        const user = await this.getCurrentUser();
        const response = await axiosInstance.get(`/payments/subscription-status/${user.id}`);
        return response.data;
    },

    async getSubscriptionPlans(): Promise<any> {
        const response = await axiosInstance.get('/payments/subscription-plans');
        return response.data;
    },

    getVersantFeedback: async (transcriptions: string[]): Promise<VersantFeedbackResponse> => {
        try {
            console.log('Sending transcriptions to backend:', transcriptions);
            const response = await axiosInstance.post(`/versant-feedback`, {
                sentences: transcriptions
            });
            console.log('Received Versant feedback response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error getting Versant feedback:', error);
            throw error;
        }
    },

    // Coupon endpoints (admin)
    async getCoupons(): Promise<Coupon[]> {
        const response = await axiosInstance.get(`/coupons`);
        return response.data.data;
    },

    async createCoupon(data: CouponCreate): Promise<Coupon> {
        const response = await axiosInstance.post(`/coupons`, data);
        return response.data.data;
    },

    async updateCoupon(code: string, data: CouponUpdate): Promise<Coupon> {
        const response = await axiosInstance.put(`/coupons/${code}`, data);
        return response.data.data;
    },

    async deleteCoupon(code: string): Promise<void> {
        await axiosInstance.delete(`/coupons/${code}`);
    },

    async getCoupon(code: string): Promise<Coupon> {
        const response = await axiosInstance.get(`/coupons/${code}`);
        return response.data.data;
    },

    getAllUserDetails: async (): Promise<UserListItem[]> => {
        const response = await axiosInstance.get('/users/details');
        return response.data.data;
    },

    requestOtp: async ({ email }: { email: string }) => {
        const response = await axiosInstance.post('/auth/request-otp', { email });
        return response.data;
    },
    verifyOtp: async ({ email, otp }: { email: string; otp: string }) => {
        const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
        return response.data;
    },
    resetPasswordWithOtp: async ({ email, otp, newPassword }: { email: string; otp: string; newPassword: string }) => {
        const response = await axiosInstance.post('/auth/reset-password-with-otp', { email, otp, new_password: newPassword });
        return response.data;
    },
} as const;

// Export the API object as default
export default API; 







