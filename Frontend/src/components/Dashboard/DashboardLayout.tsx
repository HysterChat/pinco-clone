import React from 'react';
import Sidebar from './Sidebar';
import VersantFlow from '../Versant/VersantFlow';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-pinco-navy text-pinco-white">
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