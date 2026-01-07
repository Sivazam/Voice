'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDigitalCardStore } from '@/store/digital-card-store';
import { getPublicProfileUrl, getLocalProfileUrl } from '@/lib/vcard-utils';
import { BusinessCard } from '../business-card';
import { QRCodeDisplay } from '../qr-code';

interface PreviewPublishStepProps {
    onBack: () => void;
}

export function PreviewPublishStep({ onBack }: PreviewPublishStepProps) {
    const { profile, publishProfile } = useDigitalCardStore();
    const [isPublished, setIsPublished] = useState(profile.isPublished || false);
    const [publishedUrl, setPublishedUrl] = useState(''); // Production URL for QR & display
    const [localUrl, setLocalUrl] = useState(''); // Local URL for navigation
    const [copied, setCopied] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        if (profile.id && profile.isPublished) {
            setPublishedUrl(getPublicProfileUrl(profile.id)); // Production URL
            setLocalUrl(getLocalProfileUrl(profile.id)); // Local URL for testing
        }
    }, [profile.id, profile.isPublished]);

    const handlePublish = async () => {
        setIsPublishing(true);

        // Simulate publishing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const profileId = publishProfile();
        const prodUrl = getPublicProfileUrl(profileId);
        const navUrl = getLocalProfileUrl(profileId);

        setPublishedUrl(prodUrl);
        setLocalUrl(navUrl);
        setIsPublished(true);
        setIsPublishing(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publishedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openProfile = () => {
        // Use local URL for navigation during development
        window.open(localUrl, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Preview & Publish</h2>
                <p className="text-gray-500 mt-2">Review your card and make it live!</p>
            </div>

            {/* Card Preview */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 text-center">Card Preview</h3>
                <div className="flex justify-center">
                    <BusinessCard profile={profile as any} size="small" />
                </div>
            </div>

            {/* QR Code Preview */}
            {isPublished && publishedUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 text-center"
                >
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Your QR Code</h3>
                    <div className="flex justify-center mb-4">
                        <QRCodeDisplay url={publishedUrl} size={200} />
                    </div>
                    <p className="text-xs text-gray-500">
                        Scan this code to open your digital business card
                    </p>
                </motion.div>
            )}

            {/* Public URL */}
            {isPublished && publishedUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-800">Published Successfully!</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-emerald-200">
                        <input
                            type="text"
                            readOnly
                            value={publishedUrl}
                            className="flex-1 text-sm text-gray-700 bg-transparent outline-none truncate"
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={copyToClipboard}
                            className="shrink-0"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={openProfile}
                            className="shrink-0"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Publish Button */}
            {!isPublished && (
                <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold shadow-lg shadow-emerald-500/25"
                >
                    {isPublishing ? (
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Publishing...
                        </motion.div>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Publish My Card
                        </span>
                    )}
                </Button>
            )}

            {/* View Card Button (when published) */}
            {isPublished && (
                <Button
                    onClick={openProfile}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/25"
                >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View My Digital Card
                </Button>
            )}

            {/* Navigation */}
            <div className="pt-4">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="w-full py-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Edit
                </Button>
            </div>
        </motion.div>
    );
}
