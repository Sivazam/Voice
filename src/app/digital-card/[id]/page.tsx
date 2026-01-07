'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Share2,
    Instagram,
    Linkedin,
    Facebook,
    Twitter,
    Youtube,
    Globe,
    X,
    Star,
    MessageSquare,
    RotateCw,
    UserPlus,
    Download,
    Phone,
    Mail,
    MessageCircle,
    Package,
    Image as ImageIcon,
    Loader2,
    Sparkles,
    Edit,
    MapPin,
    CheckCircle2,
    Maximize2
} from 'lucide-react';
import Link from 'next/link';
import { useDigitalCardStore } from '@/store/digital-card-store';
import { DigitalCardProfile } from '@/types/digital-card';
import { DigitalCardService } from '@/lib/digital-card-service';
import { CardFront } from '@/components/digital-card/card-front';
import { CardBack } from '@/components/digital-card/card-back';
import { downloadVCard, getPublicProfileUrl } from '@/lib/vcard-utils';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import { ReviewService, Review } from '@/lib/review-service';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage } from '@/lib/firestore';
import { Camera } from 'lucide-react';

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[65vh]">{children}</div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Action Button - Premium Design
// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="-2 -2 28 28" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    );
}

// Action Button - Premium Bento Design
function ActionButton({ icon: Icon, label, onClick, disabled = false, gradient }: { icon: any; label: string; onClick: () => void; disabled?: boolean; gradient: string }) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`relative flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 transition-all group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/20'}`}
            whileHover={!disabled ? { y: -4, scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.97 } : undefined}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-white/90 tracking-wide">{label}</span>
        </motion.button>
    );
}

// Social Links
function SocialLinksContent({ profile }: { profile: DigitalCardProfile }) {
    const socials = [
        { key: 'instagram', label: 'Instagram', icon: Instagram, gradient: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500', url: profile.socialLinks?.instagram },
        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, gradient: 'bg-gradient-to-br from-blue-600 to-blue-800', url: profile.socialLinks?.linkedin },
        { key: 'facebook', label: 'Facebook', icon: Facebook, gradient: 'bg-gradient-to-br from-blue-500 to-blue-700', url: profile.socialLinks?.facebook },
        { key: 'twitter', label: 'X (Twitter)', icon: Twitter, gradient: 'bg-gradient-to-br from-gray-800 to-black', url: profile.socialLinks?.twitter },
        { key: 'youtube', label: 'YouTube', icon: Youtube, gradient: 'bg-gradient-to-br from-red-500 to-red-700', url: profile.socialLinks?.youtube },
        { key: 'website', label: 'Website', icon: Globe, gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600', url: profile.website },
    ].filter(s => s.url);

    if (socials.length === 0) return <div className="text-center py-8 text-gray-400">No social links available</div>;

    return (
        <div className="space-y-3">
            {socials.map((s) => {
                const Icon = s.icon;
                return (
                    <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 p-4 rounded-2xl text-white ${s.gradient} hover:opacity-95 transition-opacity shadow-lg`}>
                        <Icon className="w-6 h-6" />
                        <span className="font-semibold">{s.label}</span>
                    </a>
                );
            })}
        </div>
    );
}

// Services
function ServicesContent({ profile }: { profile: DigitalCardProfile }) {
    if (!profile.services?.length) return <div className="text-center py-8 text-gray-400">No services listed</div>;
    return (
        <div className="space-y-3">
            {profile.services.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">{s}</span>
                </div>
            ))}
        </div>
    );
}

// Gallery
function GalleryContent({ profile }: { profile: DigitalCardProfile }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!profile.gallery?.length) return <div className="text-center py-8 text-gray-400">No images in gallery</div>;

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                {profile.gallery.map((img, i) => (
                    <div key={i} className="relative group cursor-pointer" onClick={() => setSelectedImage(img)}>
                        <img src={img} alt="" className="w-full aspect-square object-cover rounded-2xl shadow-md transition-transform group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={selectedImage}
                            alt="Full view"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Portfolio
function PortfolioContent({ profile }: { profile: DigitalCardProfile }) {
    if (!profile.portfolio?.length) return <div className="text-center py-8 text-gray-400">No portfolio items</div>;
    return (
        <div className="space-y-3">
            {profile.portfolio.map((p) => (
                <div key={p.id} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-900">{p.title}</h4>
                    {p.description && <p className="text-gray-600 text-sm mt-1">{p.description}</p>}
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline mt-2 inline-block font-medium">View Project →</a>}
                </div>
            ))}
        </div>
    );
}

// Testimonials
function TestimonialsContent({ profile }: { profile: DigitalCardProfile }) {
    const { profile: currentProfile } = useDigitalCardStore();
    const isOwner = currentProfile.id === profile.id;
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', designation: '', company: '', rating: 5, content: '', userImage: '' });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [profile.id]);

    const loadReviews = async () => {
        try {
            const data = await ReviewService.getReviewsByCardId(profile.id);
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(firebaseStorage, `reviews/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setNewReview(prev => ({ ...prev, userImage: url }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReview.name || !newReview.content) return;

        setSubmitLoading(true);
        try {
            await ReviewService.addReview({
                cardId: profile.id,
                userName: newReview.name,
                userImage: newReview.userImage,
                designation: newReview.designation,
                company: newReview.company,
                rating: newReview.rating,
                content: newReview.content,
            });
            setNewReview({ name: '', designation: '', company: '', rating: 5, content: '', userImage: '' });
            setIsAdding(false);
            loadReviews();
        } catch (error) {
            console.error('Failed to add review', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Reviews ({reviews.length})</h4>
                {!isOwner && (
                    <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
                        {isAdding ? 'Cancel' : 'Write a Review'}
                    </Button>
                )}
            </div>

            {isAdding && !isOwner && (
                <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 p-4 rounded-xl space-y-3"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 group cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={uploading} />
                            {newReview.userImage ? (
                                <img src={newReview.userImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            )}
                            {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-medium text-gray-500 ml-1">Your Photo (Optional)</label>
                            <p className="text-[10px] text-gray-400">Click to upload a profile picture</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-gray-500 ml-1">Your Name *</label>
                            <Input
                                placeholder="John Doe"
                                value={newReview.name}
                                onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 ml-1">Designation</label>
                            <Input
                                placeholder="CEO"
                                value={newReview.designation}
                                onChange={(e) => setNewReview({ ...newReview, designation: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 ml-1">Company</label>
                            <Input
                                placeholder="Acme Inc"
                                value={newReview.company}
                                onChange={(e) => setNewReview({ ...newReview, company: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 ml-1">Rating</label>
                        <div className="flex gap-2 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 ml-1">Review *</label>
                        <Textarea
                            placeholder="Share your experience..."
                            value={newReview.content}
                            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                            required
                            className="resize-none"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitLoading || uploading}>
                        {submitLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit Review
                    </Button>
                </motion.form>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                    <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400">No reviews yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((t) => (
                        <div key={t.id} className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-100">
                            <div className="flex gap-0.5 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;{t.content}&quot;</p>
                            <div className="mt-3 pt-3 border-t border-yellow-200/50 flex items-center gap-3">
                                {t.userImage ? (
                                    <img src={t.userImage} alt={t.userName} className="w-10 h-10 rounded-full object-cover border border-yellow-200 shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center border border-yellow-200 shadow-sm">
                                        <span className="text-yellow-700 font-bold text-sm">{t.userName.charAt(0)}</span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-900 font-semibold text-sm">{t.userName}</p>
                                    {(t.designation || t.company) && (
                                        <p className="text-gray-500 text-xs">
                                            {t.designation}{t.designation && t.company ? ' at ' : ''}{t.company}
                                        </p>
                                    )}
                                    <p className="text-gray-400 text-[10px] mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Main Page
export default function DigitalCardProfilePage() {
    const params = useParams();
    const { getProfileById, profile: currentProfile } = useDigitalCardStore();
    const [profile, setProfile] = useState<DigitalCardProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFlipped, setIsFlipped] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = params.id as string;
        if (id) {
            const fetchProfile = async () => {
                // First check local store (for preview)
                let found = getProfileById(id);

                // Fallback to current profile if ID matches (for drafts/previews)
                if (!found && currentProfile.id === id) {
                    found = currentProfile as DigitalCardProfile;
                }

                // Validate found profile - if it's empty or missing name, treat as not found
                const isValidLocal = found && found.name && found.name.trim().length > 0;

                if (isValidLocal) {
                    console.log('Found valid local profile:', found);
                    setProfile(found as DigitalCardProfile);
                    setIsLoading(false);
                } else {
                    // If not found locally or invalid, fetch from Firestore (for public view)
                    try {
                        console.log('Fetching profile from Firestore for ID:', id);
                        const remoteProfile = await DigitalCardService.getProfileById(id);
                        console.log('Remote profile result:', remoteProfile);

                        if (remoteProfile) {
                            setProfile(remoteProfile);
                        } else {
                            console.warn('No profile found in Firestore for ID:', id);
                        }
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    } finally {
                        setIsLoading(false);
                    }
                }
            };
            fetchProfile();
        }
    }, [params.id, getProfileById, currentProfile]);

    const download = useCallback(async (ref: React.RefObject<HTMLDivElement | null>, name: string, type: string) => {
        if (!ref.current) return;
        setDownloading(type);
        try {
            // Add a small delay to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));

            const url = await toPng(ref.current, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
                skipAutoScale: true,
                backgroundColor: 'transparent'
            });

            const a = document.createElement('a');
            a.download = name;
            a.href = url;
            a.click();
        } catch (e) {
            console.error('Download failed:', e);
            alert('Failed to download card. Please try again.');
        } finally {
            setDownloading(null);
        }
    }, []);

    const action = (id: string) => {
        if (!profile) return;
        switch (id) {
            case 'call': profile.mobile && (window.location.href = `tel:${profile.mobile}`); break;
            case 'email': profile.email && (window.location.href = `mailto:${profile.email}`); break;
            case 'whatsapp': const n = profile.whatsapp || profile.mobile; n && window.open(`https://wa.me/${n.replace(/\D/g, '')}`, '_blank'); break;
            case 'website': profile.website && window.open(profile.website, '_blank'); break;
            case 'location':
                if (profile.address) {
                    const query = encodeURIComponent(profile.address);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                }
                break;
            default: setActiveModal(id);
        }
    };

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) { try { await navigator.share({ title: `${profile?.name}'s Card`, url }); } catch { } }
        else { navigator.clipboard.writeText(url); alert('Link copied!'); }
    };

    if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>;

    if (!profile) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
            <div className="text-center"><CreditCard className="w-14 h-14 text-gray-600 mx-auto mb-4" /><h1 className="text-xl font-bold text-white mb-2">Card Not Found</h1><p className="text-gray-500 mb-6 text-sm">This digital card doesn&apos;t exist.</p><Link href="/digital-card/setup"><Button className="bg-blue-600 hover:bg-blue-700">Create Your Card</Button></Link></div>
        </div>
    );

    const url = getPublicProfileUrl(profile.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[360px] mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Digital Card</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        {currentProfile.id === profile?.id && (
                            <Link href="/digital-card/setup">
                                <button className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white">
                                    <Edit className="w-5 h-5" />
                                </button>
                            </Link>
                        )}
                        <button onClick={share} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"><Share2 className="w-5 h-5 text-white/80" /></button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-[360px] mx-auto px-4 pt-20 pb-28">
                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    {profile.profileImage && (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                            <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-white mb-1 capitalize">{profile.name}</h1>
                    <p className="text-blue-300 font-medium">{profile.designation}</p>
                </motion.div>

                {/* Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-5">
                    <div style={{ perspective: 1200 }}>
                        <motion.div className="relative w-[320px] h-[184px]" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}>
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', zIndex: isFlipped ? 0 : 1 }}><CardFront profile={profile} /></div>
                            <div className="absolute inset-0 bg-white rounded-xl overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: isFlipped ? 1 : 0 }}><CardBack profileUrl={url} /></div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Flip */}
                <div className="flex justify-center mb-8">
                    <button onClick={() => setIsFlipped(!isFlipped)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 backdrop-blur rounded-full text-white text-sm font-medium border border-white/10 transition-colors">
                        <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                        {isFlipped ? 'View Front' : 'View QR'}
                    </button>
                </div>

                {/* Actions - 3x3 Grid */}
                <motion.section
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="mb-8"
                >
                    <h3 className="text-center text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">Quick Actions</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Phone, label: "Call", id: 'call', disabled: !profile.mobile, gradient: "bg-gradient-to-br from-blue-500 to-blue-600" },
                            { icon: Mail, label: "Email", id: 'email', disabled: !profile.email, gradient: "bg-gradient-to-br from-amber-500 to-orange-500" },
                            { icon: WhatsAppIcon, label: "WhatsApp", id: 'whatsapp', disabled: !profile.mobile && !profile.whatsapp, gradient: "bg-gradient-to-br from-green-500 to-emerald-600" },
                            { icon: Globe, label: "Website", id: 'website', disabled: !profile.website, gradient: "bg-gradient-to-br from-purple-500 to-indigo-600" },
                            { icon: Share2, label: "Social", id: 'social', gradient: "bg-gradient-to-br from-pink-500 to-rose-500" },
                            { icon: Package, label: "Services", id: 'services', disabled: !profile.services?.length, gradient: "bg-gradient-to-br from-cyan-500 to-teal-500" },
                            { icon: Star, label: "Reviews", id: 'testimonials', gradient: "bg-gradient-to-br from-yellow-500 to-amber-500" },
                            { icon: MapPin, label: "Location", id: 'location', disabled: !profile.address, gradient: "bg-gradient-to-br from-teal-500 to-cyan-600" },
                            { icon: ImageIcon, label: "Gallery", id: 'gallery', disabled: !profile.gallery?.length, gradient: "bg-gradient-to-br from-emerald-500 to-green-600" }
                        ].map((btn, i) => (
                            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                <ActionButton icon={btn.icon} label={btn.label} onClick={() => action(btn.id)} disabled={btn.disabled} gradient={btn.gradient} />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Downloads - Only for Owner */}
                {currentProfile.id === profile.id && (
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h3 className="text-center text-xs font-bold text-white/50 mb-4 uppercase tracking-widest">Download Cards</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => download(frontRef, `${profile.name}_front.png`, 'front')} disabled={!!downloading} className="flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-2xl border border-white/10 disabled:opacity-50 transition-colors">
                                {downloading === 'front' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Front
                            </button>
                            <button onClick={() => download(backRef, `${profile.name}_back.png`, 'back')} disabled={!!downloading} className="flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-2xl border border-white/10 disabled:opacity-50 transition-colors">
                                {downloading === 'back' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Back
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-white/40 mt-3">Print-ready: 3.5 × 2 in @ 300 DPI</p>
                    </motion.section>
                )}

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-white/30 text-xs">Build by <span className="font-semibold text-white/50">Harte Labs</span></p>
                </footer>
            </main>

            {/* FAB */}
            <motion.button
                onClick={() => profile && downloadVCard(profile)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <UserPlus className="w-7 h-7" />
            </motion.button>

            {/* Hidden Cards */}
            <div className="fixed -left-[9999px] top-0">
                <div ref={frontRef}>
                    <CardFront
                        profile={{
                            ...profile,
                            profileImage: profile.profileImage ? `/api/proxy-image?url=${encodeURIComponent(profile.profileImage)}` : '',
                            logo: profile.logo ? `/api/proxy-image?url=${encodeURIComponent(profile.logo)}` : ''
                        }}
                        isPrintMode
                        crossOrigin="anonymous"
                    />
                </div>
                <div ref={backRef}>
                    <CardBack profileUrl={url} isPrintMode />
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={activeModal === 'social'} onClose={() => setActiveModal(null)} title="Social Links"><SocialLinksContent profile={profile} /></Modal>
            <Modal isOpen={activeModal === 'services'} onClose={() => setActiveModal(null)} title="Services"><ServicesContent profile={profile} /></Modal>
            <Modal isOpen={activeModal === 'portfolio'} onClose={() => setActiveModal(null)} title="Portfolio"><PortfolioContent profile={profile} /></Modal>
            <Modal isOpen={activeModal === 'gallery'} onClose={() => setActiveModal(null)} title="Gallery"><GalleryContent profile={profile} /></Modal>
            <Modal isOpen={activeModal === 'testimonials'} onClose={() => setActiveModal(null)} title="Reviews"><TestimonialsContent profile={profile} /></Modal>
        </div>
    );
}
