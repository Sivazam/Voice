'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Upload, Camera, X, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDigitalCardStore } from '@/store/digital-card-store';
import { DigitalCardService } from '@/lib/digital-card-service';

interface BasicInfoStepProps {
    onNext: () => void;
}

function CameraModal({ isOpen, onClose, onCapture }: { isOpen: boolean; onClose: () => void; onCapture: (file: File) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            console.error("Camera error", err);
            alert("Could not access camera. Please ensure you have granted camera permissions.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
    };

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                onCapture(file);
                onClose();
            }
        }, 'image/jpeg');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full relative shadow-2xl">
                <div className="relative aspect-[4/3] bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex justify-between items-center bg-white">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <button onClick={capture} className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                        <div className="w-12 h-12 bg-blue-500 rounded-full" />
                    </button>
                    <div className="w-16" /> {/* Spacer */}
                </div>
            </div>
        </div>
    );
}

export function BasicInfoStep({ onNext }: BasicInfoStepProps) {
    const { profile, updateProfile } = useDigitalCardStore();
    const [name, setName] = useState(profile.name || '');
    const [designation, setDesignation] = useState(profile.designation || '');
    const [company, setCompany] = useState(profile.company || '');
    const [profileImage, setProfileImage] = useState(profile.profileImage || '');
    const [logo, setLogo] = useState(profile.logo || '');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showCamera, setShowCamera] = useState<'profile' | 'logo' | null>(null);

    const profileImageRef = useRef<HTMLInputElement>(null);
    const logoRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File, type: 'profile' | 'logo') => {
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, image: 'Image must be less than 5MB' }));
            return;
        }

        const userId = profile.id || `temp_${Date.now()}`;

        try {
            if (type === 'profile') {
                setIsUploadingProfile(true);
                const url = await DigitalCardService.uploadProfileImage(file, userId);
                setProfileImage(url);
            } else {
                setIsUploadingLogo(true);
                const url = await DigitalCardService.uploadLogo(file, userId);
                setLogo(url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setErrors((prev) => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
        } finally {
            setIsUploadingProfile(false);
            setIsUploadingLogo(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo') => {
        const file = e.target.files?.[0];
        if (file) processFile(file, type);
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!designation.trim()) {
            newErrors.designation = 'Designation is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            updateProfile({
                name: name.trim(),
                designation: designation.trim(),
                company: company.trim(),
                profileImage,
                logo,
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
            <CameraModal
                isOpen={!!showCamera}
                onClose={() => setShowCamera(null)}
                onCapture={(file) => processFile(file, showCamera!)}
            />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-500 mt-2">Let&apos;s start with your basic details</p>
            </div>

            {/* Profile Image Upload */}
            <div className="flex flex-col sm:flex-row gap-8 items-start justify-center">
                {/* Profile Image */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <input
                            ref={profileImageRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'profile')}
                        />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                            {isUploadingProfile ? (
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            ) : profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-blue-400" />
                            )}
                        </div>
                        {profileImage && !isUploadingProfile && (
                            <button
                                onClick={() => setProfileImage('')}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => profileImageRef.current?.click()} className="h-8 text-xs">
                            <Upload className="w-3 h-3 mr-1.5" /> Upload
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCamera('profile')} className="h-8 text-xs">
                            <Camera className="w-3 h-3 mr-1.5" /> Camera
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400">Profile Photo</p>
                </div>

                {/* Logo */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <input
                            ref={logoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, 'logo')}
                        />
                        <div className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            {isUploadingLogo ? (
                                <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                            ) : logo ? (
                                <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Upload className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                        {logo && !isUploadingLogo && (
                            <button
                                onClick={() => setLogo('')}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => logoRef.current?.click()} className="h-8 text-xs">
                            <Upload className="w-3 h-3 mr-1.5" /> Upload
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowCamera('logo')} className="h-8 text-xs">
                            <Camera className="w-3 h-3 mr-1.5" /> Camera
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400">Company Logo</p>
                </div>
            </div>

            {errors.image && (
                <p className="text-red-500 text-sm text-center">{errors.image}</p>
            )}

            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Full Name *
                </Label>
                <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                )}
            </div>

            {/* Designation Field */}
            <div className="space-y-2">
                <Label htmlFor="designation" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Designation / Title *
                </Label>
                <Input
                    id="designation"
                    placeholder="e.g., Software Engineer, CEO, Designer"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className={errors.designation ? 'border-red-500' : ''}
                />
                {errors.designation && (
                    <p className="text-red-500 text-sm">{errors.designation}</p>
                )}
            </div>

            {/* Company Field */}
            <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Business Name (Optional)
                </Label>
                <Input
                    id="company"
                    placeholder="e.g., Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />
            </div>

            {/* Next Button */}
            <div className="pt-6">
                <Button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/25"
                >
                    Continue
                </Button>
            </div>
        </motion.div>
    );
}
