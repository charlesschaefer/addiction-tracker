'use client';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import type React from 'react';
import { useEffect } from 'react';

// Wrapper component to handle auth logic
export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isProtected } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    useEffect(() => {
        // If protection is enabled and user is not authenticated
        // and not already on the login page, redirect to login
        if (isProtected && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, isProtected, pathname, router]);

    // If protection is enabled and user is not authenticated,
    // don't render anything (to prevent flash of content)
    if (isProtected && !isAuthenticated && pathname !== '/login') {
        return null;
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-orange-50 text-gray-800 transition-all duration-300 max-w-full overflow-x-hidden">
            {/* Only show header if authenticated or on login page */}
            {(isAuthenticated || pathname === '/login') && <Header />}
            <div className="px-2 sm:px-4 md:px-6">{children}</div>
        </div>
    );
}
