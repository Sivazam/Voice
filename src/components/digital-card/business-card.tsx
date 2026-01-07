'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { DigitalCardProfile } from '@/types/digital-card';
import { CardFront } from './card-front';
import { CardBack } from './card-back';
import { getPublicProfileUrl } from '@/lib/vcard-utils';

interface BusinessCardProps {
    profile: Partial<DigitalCardProfile>;
    size?: 'small' | 'medium' | 'large';
    showFlipButton?: boolean;
}

export function BusinessCard({
    profile,
    size = 'medium',
    showFlipButton = true
}: BusinessCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const profileUrl = profile.id
        ? getPublicProfileUrl(profile.id)
        : typeof window !== 'undefined'
            ? `${window.location.origin}/digital-card/preview`
            : '/digital-card/preview';

    const sizeClasses = {
        small: 'scale-75',
        medium: 'scale-100',
        large: 'scale-110',
    };

    return (
        <div className={`relative ${sizeClasses[size]}`}>
            {/* 3D Flip Container */}
            <div
                className="relative w-[350px] h-[200px]"
                style={{ perspective: '1000px' }}
            >
                <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 bg-white rounded-xl overflow-hidden"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                    >
                        <CardFront profile={profile} />
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 bg-white rounded-xl overflow-hidden"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <CardBack profileUrl={profileUrl} />
                    </div>
                </motion.div>
            </div>

            {/* Flip Button */}
            {showFlipButton && (
                <motion.button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RotateCw className={`w-4 h-4 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
                    {isFlipped ? 'View Front' : 'View Back'}
                </motion.button>
            )}
        </div>
    );
}

// Side-by-side layout for desktop
export function BusinessCardDesktop({ profile }: { profile: Partial<DigitalCardProfile> }) {
    const profileUrl = profile.id
        ? getPublicProfileUrl(profile.id)
        : typeof window !== 'undefined'
            ? `${window.location.origin}/digital-card/preview`
            : '/digital-card/preview';

    return (
        <div className="flex gap-8 justify-center items-center">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CardFront profile={profile} />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <CardBack profileUrl={profileUrl} />
            </motion.div>
        </div>
    );
}
