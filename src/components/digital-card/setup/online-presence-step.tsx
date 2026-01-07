'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Instagram, Linkedin, Facebook, Youtube, Twitter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDigitalCardStore } from '@/store/digital-card-store';

interface OnlinePresenceStepProps {
    onNext: () => void;
    onBack: () => void;
}

const socialPlatforms = [
    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', placeholder: 'https://instagram.com/yourprofile' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', placeholder: 'https://linkedin.com/in/yourprofile' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600', placeholder: 'https://facebook.com/yourprofile' },
    { key: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-gray-800', placeholder: 'https://x.com/yourhandle' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', placeholder: 'https://youtube.com/@yourchannel' },
];

export function OnlinePresenceStep({ onNext, onBack }: OnlinePresenceStepProps) {
    const { profile, updateProfile } = useDigitalCardStore();
    const [website, setWebsite] = useState(profile.website || '');
    const [socialLinks, setSocialLinks] = useState(profile.socialLinks || {});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateUrl = (url: string): boolean => {
        if (!url) return true; // Empty is valid (optional)
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSocialChange = (key: string, value: string) => {
        setSocialLinks((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (website && !validateUrl(website)) {
            newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
        }

        // Validate social links
        for (const platform of socialPlatforms) {
            const value = socialLinks[platform.key as keyof typeof socialLinks];
            if (value && !validateUrl(value)) {
                newErrors[platform.key] = 'Please enter a valid URL';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            updateProfile({
                website: website.trim(),
                socialLinks,
            });
            onNext();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Online Presence</h2>
                <p className="text-gray-500 mt-2">Add your website and social media links</p>
            </div>

            {/* Website */}
            <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Website
                    <span className="text-xs text-gray-400">(Optional)</span>
                </Label>
                <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && (
                    <p className="text-red-500 text-sm">{errors.website}</p>
                )}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
                <Label className="text-base font-semibold">Social Media Links</Label>
                <p className="text-sm text-gray-500 -mt-2">Add links to your social profiles</p>

                <div className="space-y-3">
                    {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        const value = socialLinks[platform.key as keyof typeof socialLinks] || '';

                        return (
                            <motion.div
                                key={platform.key}
                                className="space-y-1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className={`w-5 h-5 ${platform.color}`} />
                                    <span className="text-sm font-medium text-gray-700">{platform.label}</span>
                                </div>
                                <Input
                                    type="url"
                                    placeholder={platform.placeholder}
                                    value={value}
                                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                                    className={`pl-4 ${errors[platform.key] ? 'border-red-500' : ''}`}
                                />
                                {errors[platform.key] && (
                                    <p className="text-red-500 text-xs">{errors[platform.key]}</p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-700">
                    <strong>Tip:</strong> Social links are optional, but they help visitors connect with you
                    across different platforms.
                </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 py-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/25"
                >
                    Continue
                </Button>
            </div>
        </motion.div>
    );
}
