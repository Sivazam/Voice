'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useDigitalCardStore } from '@/store/digital-card-store';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { firebaseApp } from "@/lib/firestore";
import { StepIndicator } from '@/components/digital-card/setup/step-indicator';
import { BasicInfoStep } from '@/components/digital-card/setup/basic-info-step';
import { ContactInfoStep } from '@/components/digital-card/setup/contact-info-step';
import { OnlinePresenceStep } from '@/components/digital-card/setup/online-presence-step';
import { ProfessionalInfoStep } from '@/components/digital-card/setup/professional-info-step';
import { PreviewPublishStep } from '@/components/digital-card/setup/preview-publish-step';
import { SetupStep } from '@/types/digital-card';

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

// Auth Modal Component
function AuthModal({
    onSuccess
}: {
    onSuccess: () => void;
}): JSX.Element {
    const { auth: storeAuth, setPhoneNumber, loginSuccess } = useDigitalCardStore();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        const auth = getAuth(firebaseApp);

        // Clear existing verifier if any
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.error('Error clearing recaptcha:', e);
            }
            window.recaptchaVerifier = undefined;
        }

        // Initialize RecaptchaVerifier
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    console.log('reCAPTCHA solved');
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                    console.log('reCAPTCHA expired');
                    if (window.recaptchaVerifier) {
                        window.recaptchaVerifier.clear();
                        window.recaptchaVerifier = undefined;
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing RecaptchaVerifier:', error);
        }

        return () => {
            // Cleanup
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.error('Error clearing recaptcha on unmount:', e);
                }
                window.recaptchaVerifier = undefined;
            }
        };
    }, []);

    const handleSendOtp = async () => {
        if (!phone || phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        setError('');

        // Mock OTP Send
        setTimeout(() => {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
            console.log('Mock OTP sent to:', formattedPhone);
            setConfirmationResult({ verificationId: 'mock-id' } as any);
            setPhoneNumber(formattedPhone);
            setStep('otp');
            setLoading(false);
        }, 1000);
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        // Mock OTP Verify
        setTimeout(async () => {
            if (otp === '123456' || otp.length === 6) {
                const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
                await loginSuccess(formattedPhone);
                onSuccess();
            } else {
                setError('Invalid OTP. Please use 123456');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Digital Business Card</h1>
                    <p className="text-gray-500 mt-2">
                        {step === 'phone'
                            ? 'Enter your mobile number to get started'
                            : 'Enter the OTP sent to your phone'
                        }
                    </p>
                </div>

                {
                    error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )
                }

                <AnimatePresence mode="wait">
                    {step === 'phone' ? (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your 10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={handleSendOtp}
                                disabled={loading || phone.length < 10}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>

                            <p className="text-center text-sm text-gray-500">
                                We will send you a One Time Password to your mobile number
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-xl tracking-widest font-mono"
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                <p className="text-sm text-blue-700 text-center">
                                    Please enter the OTP sent to your mobile
                                </p>
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length !== 6}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <button
                                onClick={() => {
                                    setStep('phone');
                                    setOtp('');
                                    setError('');
                                }}
                                className="w-full py-2 text-gray-600 hover:text-gray-900 text-sm"
                            >
                                ← Change Phone Number
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recaptcha Container - Moved outside to persist */}
                <div id="recaptcha-container"></div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </motion.div >
        </div >
    );
}

// Main Setup Page
export default function DigitalCardSetupPage() {
    const { auth, currentStep, setCurrentStep, nextStep, prevStep, logout } = useDigitalCardStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Handle hydration for localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Show auth modal if not authenticated
    if (!auth.isAuthenticated) {
        return <AuthModal onSuccess={() => { }} />;
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <BasicInfoStep onNext={nextStep} />;
            case 2:
                return <ContactInfoStep onNext={nextStep} onBack={prevStep} />;
            case 3:
                return <OnlinePresenceStep onNext={nextStep} onBack={prevStep} />;
            case 4:
                return <ProfessionalInfoStep onNext={nextStep} onBack={prevStep} />;
            case 5:
                return <PreviewPublishStep onBack={prevStep} />;
            default:
                return <BasicInfoStep onNext={nextStep} />;
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shrink-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-gray-900">Digital Card</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Progress Indicator */}
            <div className="shrink-0">
                <StepIndicator
                    currentStep={currentStep}
                    onStepClick={(step) => {
                        if (step < currentStep) setCurrentStep(step);
                    }}
                />
            </div>

            {/* Step Content */}
            <main className="flex-1 overflow-y-auto container mx-auto px-4 py-8">
                <div className="max-w-lg mx-auto pb-8">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
