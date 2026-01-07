'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Link2, Image, Plus, X, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDigitalCardStore } from '@/store/digital-card-store';
import { PortfolioItem } from '@/types/digital-card';
import { DigitalCardService } from '@/lib/digital-card-service';

interface ProfessionalInfoStepProps {
    onNext: () => void;
    onBack: () => void;
}

export function ProfessionalInfoStep({ onNext, onBack }: ProfessionalInfoStepProps) {
    const { profile, updateProfile } = useDigitalCardStore();
    const [services, setServices] = useState<string[]>(profile.services || []);
    const [newService, setNewService] = useState('');
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>(profile.portfolio || []);
    const [gallery, setGallery] = useState<string[]>(profile.gallery || []);
    const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
    const [newPortfolioUrl, setNewPortfolioUrl] = useState('');

    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Add service tag
    const addService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()]);
            setNewService('');
        }
    };

    const removeService = (service: string) => {
        setServices(services.filter((s) => s !== service));
    };

    // Add portfolio item
    const addPortfolioItem = () => {
        if (newPortfolioTitle.trim()) {
            const newItem: PortfolioItem = {
                id: `portfolio_${Date.now()}`,
                title: newPortfolioTitle.trim(),
                url: newPortfolioUrl.trim() || undefined,
            };
            setPortfolio([...portfolio, newItem]);
            setNewPortfolioTitle('');
            setNewPortfolioUrl('');
        }
    };

    const removePortfolioItem = (id: string) => {
        setPortfolio(portfolio.filter((p) => p.id !== id));
    };

    const [isUploadingGallery, setIsUploadingGallery] = useState(false);

    // Add gallery image
    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const remainingSlots = 6 - gallery.length;
            const filesToUpload = Array.from(files).slice(0, remainingSlots);

            if (filesToUpload.length === 0) return;

            // Use a temporary ID if profile doesn't have one yet
            const userId = profile.id || `temp_${Date.now()}`;

            setIsUploadingGallery(true);
            try {
                const uploadPromises = filesToUpload.map(async (file) => {
                    if (file.size > 5 * 1024 * 1024) return null;
                    return await DigitalCardService.uploadGalleryImage(file, userId);
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter((url): url is string => url !== null);

                setGallery((prev) => {
                    if (prev.length >= 6) return prev;
                    return [...prev, ...validUrls].slice(0, 6);
                });
            } catch (error) {
                console.error('Gallery upload failed:', error);
            } finally {
                setIsUploadingGallery(false);
            }
        }
    };

    const removeGalleryImage = (index: number) => {
        setGallery(gallery.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        updateProfile({
            services,
            portfolio,
            gallery,
        });
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Professional Info</h2>
                <p className="text-gray-500 mt-2">Showcase your services and work</p>
            </div>

            {/* Services Tags */}
            <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    Services / Skills
                    <span className="text-xs text-gray-400">(Optional)</span>
                </Label>

                {/* Service Tags Display */}
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                        {services.map((service) => (
                            <motion.span
                                key={service}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                                {service}
                                <button
                                    onClick={() => removeService(service)}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add Service Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Add a service or skill"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                    />
                    <Button type="button" variant="outline" onClick={addService}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Portfolio Links */}
            <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" />
                    Portfolio / Projects
                    <span className="text-xs text-gray-400">(Optional)</span>
                </Label>

                {/* Portfolio Items Display */}
                <div className="space-y-2">
                    <AnimatePresence>
                        {portfolio.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.title}</p>
                                    {item.url && (
                                        <p className="text-sm text-blue-600 truncate">{item.url}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removePortfolioItem(item.id)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Add Portfolio Input */}
                <div className="space-y-2">
                    <Input
                        placeholder="Project title"
                        value={newPortfolioTitle}
                        onChange={(e) => setNewPortfolioTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Input
                            placeholder="Project URL (optional)"
                            value={newPortfolioUrl}
                            onChange={(e) => setNewPortfolioUrl(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={addPortfolioItem}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-gray-400" />
                    Gallery
                    <span className="text-xs text-gray-400">(Optional, max 6 images, 5MB each)</span>
                </Label>

                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryUpload}
                />

                {/* Gallery Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <AnimatePresence>
                        {gallery.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-lg overflow-hidden group"
                            >
                                <img
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add Image Button */}
                    {gallery.length < 6 && (
                        <motion.button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={isUploadingGallery}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isUploadingGallery ? (
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="w-6 h-6 text-gray-400" />
                            )}
                        </motion.button>
                    )}
                </div>
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
                    disabled={isUploadingGallery}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploadingGallery ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </span>
                    ) : (
                        'Continue'
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
