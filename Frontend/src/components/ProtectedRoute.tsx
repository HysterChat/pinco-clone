import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        let isMounted = true;

        const checkProfileCompletion = async () => {
            try {
                const profile = await api.getProfile();
                if (isMounted) {
                    setIsProfileComplete(profile.profile_completed);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error checking profile completion:', error);
                if (isMounted) {
                    setIsLoading(false);
                    setIsProfileComplete(false);
                }
            }
        };

        if (token) {
            checkProfileCompletion();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [token, location.pathname]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If profile is not complete and user is not already on settings page, redirect to settings
    if (!isProfileComplete && !location.pathname.includes('/dashboard/settings')) {
        return <Navigate to="/dashboard/settings" replace state={{ requiresCompletion: true }} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute; 






