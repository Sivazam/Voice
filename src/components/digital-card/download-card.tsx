'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { DigitalCardProfile } from '@/types/digital-card';
import { CardFront } from './card-front';
import { CardBack } from './card-back';
import { getPublicProfileUrl } from '@/lib/vcard-utils';

interface DownloadCardProps {
    profile: DigitalCardProfile;
}

export function DownloadCard({ profile }: DownloadCardProps) {
    const [isDownloadingFront, setIsDownloadingFront] = useState(false);
    const [isDownloadingBack, setIsDownloadingBack] = useState(false);
    const frontCardRef = useRef<HTMLDivElement>(null);
    const backCardRef = useRef<HTMLDivElement>(null);

    const profileUrl = getPublicProfileUrl(profile.id);

    const downloadImage = useCallback(async (
        element: HTMLElement | null,
        filename: string,
        setLoading: (loading: boolean) => void
    ) => {
        if (!element) return;

        setLoading(true);
        try {
            // High-resolution export for print (300 DPI)
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 3, // 3x for high resolution
                backgroundColor: '#ffffff',
            });

            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDownloadFront = () => {
        downloadImage(
            frontCardRef.current,
            `${profile.name?.replace(/\s+/g, '_') || 'business_card'}_front.png`,
            setIsDownloadingFront
        );
    };

    const handleDownloadBack = () => {
        downloadImage(
            backCardRef.current,
            `${profile.name?.replace(/\s+/g, '_') || 'business_card'}_back.png`,
            setIsDownloadingBack
        );
    };

    return (
        <div className="space-y-4">
            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    onClick={handleDownloadFront}
                    disabled={isDownloadingFront}
                    className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                >
                    {isDownloadingFront ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Front Card
                </Button>

                <Button
                    onClick={handleDownloadBack}
                    disabled={isDownloadingBack}
                    className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                >
                    {isDownloadingBack ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Back Card
                </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-white/60 text-center">
                Print-ready: 3.5 × 2 inches at 300 DPI
            </p>

            {/* Hidden High-Resolution Cards for Export */}
            <div className="fixed left-[-9999px] top-0">
                <div ref={frontCardRef}>
                    <CardFront profile={profile} isPrintMode={true} />
                </div>
                <div ref={backCardRef} className="mt-4">
                    <CardBack profileUrl={profileUrl} isPrintMode={true} />
                </div>
            </div>
        </div>
    );
}
