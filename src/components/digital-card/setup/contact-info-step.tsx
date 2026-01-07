'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDigitalCardStore } from '@/store/digital-card-store';

interface ContactInfoStepProps {
    onNext: () => void;
    onBack: () => void;
}

export function ContactInfoStep({ onNext, onBack }: ContactInfoStepProps) {
    const { profile, updateProfile, auth } = useDigitalCardStore();
    const [mobile, setMobile] = useState(profile.mobile || auth.phoneNumber || '');
    const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '');
    const [email, setEmail] = useState(profile.email || '');
    const [address, setAddress] = useState(profile.address || '');
    const [sameAsPhone, setSameAsPhone] = useState(
        !profile.whatsapp || profile.whatsapp === profile.mobile
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        if (!phone) return false;
        // Allow 10 digit numbers, optionally with country code
        const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\d{10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!validatePhone(mobile)) {
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';
        }

        if (!sameAsPhone && whatsapp && !validatePhone(whatsapp)) {
            newErrors.whatsapp = 'Please enter a valid WhatsApp number';
        }

        if (email && !validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            updateProfile({
                mobile: mobile.trim(),
                whatsapp: sameAsPhone ? mobile.trim() : whatsapp.trim(),
                email: email.trim(),
                address: address.trim(),
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
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-gray-500 mt-2">How can people reach you?</p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Mobile Number *
                </Label>
                <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={errors.mobile ? 'border-red-500' : ''}
                />
                {errors.mobile && (
                    <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-3">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp Number
                </Label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => {
                            setSameAsPhone(e.target.checked);
                            if (e.target.checked) {
                                setWhatsapp(mobile);
                            }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">Same as mobile number</span>
                </label>

                {!sameAsPhone && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Input
                            id="whatsapp"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className={errors.whatsapp ? 'border-red-500' : ''}
                        />
                        {errors.whatsapp && (
                            <p className="text-red-500 text-sm">{errors.whatsapp}</p>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Address
                    <span className="text-xs text-gray-400">(Optional)</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                )}
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Full Address
                    <span className="text-xs text-gray-400">(Optional - for Maps)</span>
                </Label>
                <Input
                    id="address"
                    placeholder="123 Main St, City, Country"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Your contact details will be visible on your digital card
                    and can be saved directly to contacts by visitors.
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
