'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { buttonStyles, cardStyles, focusStyles, tailwindClasses } from '../lib/style-utils';

interface AuthPromptDialogProps {
    onClose: () => void;
}

export default function AuthPromptDialog({ onClose }: AuthPromptDialogProps) {
    const { enableProtection } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: intro, 2: password setup

    const handleEnableProtection = (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        enableProtection(password);
        onClose();
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            data-oid="7hkb:l1"
        >
            <div
                className={`bg-white/95 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center ${tailwindClasses.borders.light} animate-scaleIn`}
                data-oid="6ox0rf8"
            >
                {step === 1 ? (
                    <>
                        <div
                            className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            data-oid="dre3as9"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                data-oid="mibgl-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    data-oid="qt030ve"
                                />
                            </svg>
                        </div>
                        <h3
                            className="text-2xl font-semibold text-gray-800 mb-3"
                            data-oid="2i0ipdy"
                        >
                            Protect Your Recovery Data
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed" data-oid="_r38i8c">
                            Your recovery journey contains sensitive information. Would you like to
                            protect it with a password?
                        </p>
                        <div className="space-y-4" data-oid="pe2e1s1">
                            <button
                                onClick={() => setStep(2)}
                                className={`w-full py-3 px-4 ${tailwindClasses.gradients.primary} text-white font-medium rounded-lg hover:from-purple-600 hover:to-orange-600 transition-all ${focusStyles.default}`}
                                data-oid="022hhtc"
                            >
                                Yes, Protect My Data
                            </button>
                            <button
                                onClick={handleSkip}
                                className={`w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all ${focusStyles.default}`}
                                data-oid="-_lkgj6"
                            >
                                Not Now
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-gray-500" data-oid="zrdnx.2">
                            You can always enable protection later in the settings.
                        </p>
                    </>
                ) : (
                    <>
                        <div
                            className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            data-oid="27wo0:c"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                data-oid="p18hm0g"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                    data-oid="s0m7:2d"
                                />
                            </svg>
                        </div>
                        <h3
                            className="text-2xl font-semibold text-gray-800 mb-3"
                            data-oid="skk7zaj"
                        >
                            Create a Password
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed" data-oid="dm1zr_v">
                            Choose a secure password to protect your recovery data. Make sure it's
                            something you'll remember.
                        </p>

                        <form
                            onSubmit={handleEnableProtection}
                            className="space-y-4 text-left"
                            data-oid="t2falkp"
                        >
                            <div data-oid=":9:oxc_">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="zol3k96"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-300 ${focusStyles.default}`}
                                    placeholder="Create a password"
                                    required
                                    data-oid="q1z7.az"
                                />
                            </div>

                            <div data-oid="m:8:_j7">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                    data-oid="b688-eo"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-2 rounded-lg border border-gray-300 ${focusStyles.default}`}
                                    placeholder="Confirm your password"
                                    required
                                    data-oid=".f4h14t"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600" data-oid="02:h3qd">
                                    {error}
                                </p>
                            )}

                            <div className="flex gap-4 pt-2" data-oid="uw1py1d">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all ${focusStyles.default}`}
                                    data-oid="xng6qt."
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 py-2 px-4 ${tailwindClasses.gradients.primary} text-white font-medium rounded-lg hover:from-purple-600 hover:to-orange-600 transition-all ${focusStyles.default}`}
                                    data-oid="-oh7yui"
                                >
                                    Enable Protection
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
