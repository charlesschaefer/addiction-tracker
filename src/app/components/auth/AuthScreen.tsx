'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
    const { login, isAuthenticated } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();

    // If authentication is successful, show success message and redirect
    useEffect(() => {
        if (isAuthenticated && showSuccess) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, showSuccess, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate a slight delay for better UX
        setTimeout(() => {
            const success = login(password);
            if (success) {
                setShowSuccess(true);
            } else {
                setError('Incorrect password. Please try again.');
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 animate-scaleIn">
                <div className="text-center mb-8">
                    <img
                        src="/images/logo.png"
                        alt="Addiction Tracker"
                        className="h-10 mx-auto mb-6"
                    />

                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        {showSuccess ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-green-600 animate-scaleIn"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        )}
                    </div>

                    {showSuccess ? (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Successfully Unlocked
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Redirecting you to your recovery dashboard...
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Protected Information
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Please enter your password to access your recovery data.
                            </p>
                        </>
                    )}
                </div>

                {!showSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter your password"
                                required
                                autoFocus
                            />

                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all ${
                                isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Unlocking...
                                </span>
                            ) : (
                                'Unlock'
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">Your data is protected and encrypted.</p>
                </div>
            </div>
        </div>
    );
}
