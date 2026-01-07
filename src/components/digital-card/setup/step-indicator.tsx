'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SetupStep } from '@/types/digital-card';

interface StepIndicatorProps {
    currentStep: SetupStep;
    onStepClick?: (step: SetupStep) => void;
}

const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Contact' },
    { number: 3, title: 'Online' },
    { number: 4, title: 'Professional' },
    { number: 5, title: 'Publish' },
];

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const isClickable = onStepClick && step.number <= currentStep;

                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <motion.button
                                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  font-semibold text-sm transition-all duration-300
                  ${isCompleted
                                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                        : isCurrent
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                                            : 'bg-gray-100 text-gray-400'
                                    }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                `}
                                onClick={() => isClickable && onStepClick(step.number as SetupStep)}
                                whileHover={isClickable ? { scale: 1.1 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    step.number
                                )}

                                {/* Pulse animation for current step */}
                                {isCurrent && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-blue-400"
                                        initial={{ opacity: 0.5, scale: 1 }}
                                        animate={{ opacity: 0, scale: 1.5 }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                            </motion.button>

                            {/* Step Title (visible on larger screens) */}
                            <span
                                className={`
                  hidden sm:block ml-2 text-xs font-medium whitespace-nowrap
                  ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}
                `}
                            >
                                {step.title}
                            </span>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: isCompleted ? '100%' : isCurrent ? '50%' : '0%'
                                        }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
