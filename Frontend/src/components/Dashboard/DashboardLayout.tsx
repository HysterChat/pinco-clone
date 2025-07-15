import React from 'react';
import Sidebar from './Sidebar';
import VersantFlow from '../Versant/VersantFlow';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-eval8 ai-navy text-eval8 ai-white">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-[280px]">
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 






