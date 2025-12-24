import Topbar from './TopBar';
import Footer from './Footer';
import React from 'react';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Topbar />
            <main className="flex flex-col flex-1 items-center justify-center p-4">
                {children}
            </main>
            <Footer />
        </div>
    );
}