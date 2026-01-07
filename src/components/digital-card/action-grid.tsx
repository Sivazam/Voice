'use client';

import { motion, Variants } from 'framer-motion';
import {
    Phone,
    Mail,
    MessageCircle,
    MapPin,
    Globe,
    Share2,
    StickyNote,
    MessageSquare,
    Package,
    Star,
    Briefcase,
    Image
} from 'lucide-react';
import { DigitalCardProfile } from '@/types/digital-card';

interface ActionGridProps {
    profile: DigitalCardProfile;
    onActionClick?: (action: string, profile: DigitalCardProfile) => void;
}

const actions = [
    {
        id: 'call',
        label: 'Call',
        icon: Phone,
        color: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-600',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600'
    },
    {
        id: 'email',
        label: 'Mail',
        icon: Mail,
        color: 'bg-amber-500',
        hoverColor: 'hover:bg-amber-600',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: MessageCircle,
        color: 'bg-green-500',
        hoverColor: 'hover:bg-green-600',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600'
    },
    {
        id: 'navigation',
        label: 'Navigation',
        icon: MapPin,
        color: 'bg-red-500',
        hoverColor: 'hover:bg-red-600',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600'
    },
    {
        id: 'website',
        label: 'Website',
        icon: Globe,
        color: 'bg-purple-500',
        hoverColor: 'hover:bg-purple-600',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600'
    },
    {
        id: 'social',
        label: 'Social Links',
        icon: Share2,
        color: 'bg-pink-500',
        hoverColor: 'hover:bg-pink-600',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600'
    },
    {
        id: 'notes',
        label: 'Notes',
        icon: StickyNote,
        color: 'bg-yellow-500',
        hoverColor: 'hover:bg-yellow-600',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
    },
    {
        id: 'enquiry',
        label: 'Enquiry',
        icon: MessageSquare,
        color: 'bg-orange-500',
        hoverColor: 'hover:bg-orange-600',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600'
    },
    {
        id: 'services',
        label: 'Services',
        icon: Package,
        color: 'bg-cyan-500',
        hoverColor: 'hover:bg-cyan-600',
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600'
    },
    {
        id: 'testimonials',
        label: 'Testimonials',
        icon: Star,
        color: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600'
    },
    {
        id: 'portfolio',
        label: 'Portfolio',
        icon: Briefcase,
        color: 'bg-teal-500',
        hoverColor: 'hover:bg-teal-600',
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600'
    },
    {
        id: 'gallery',
        label: 'Gallery',
        icon: Image,
        color: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600'
    },
];

export function ActionGrid({ profile, onActionClick }: ActionGridProps) {
    const handleAction = (actionId: string) => {
        switch (actionId) {
            case 'call':
                if (profile.mobile) {
                    window.location.href = `tel:${profile.mobile}`;
                }
                break;
            case 'email':
                if (profile.email) {
                    window.location.href = `mailto:${profile.email}`;
                }
                break;
            case 'whatsapp':
                const whatsappNumber = profile.whatsapp || profile.mobile;
                if (whatsappNumber) {
                    const cleanNumber = whatsappNumber.replace(/\D/g, '');
                    window.open(`https://wa.me/${cleanNumber}`, '_blank');
                }
                break;
            case 'navigation':
                if (profile.address) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`, '_blank');
                }
                break;
            case 'website':
                if (profile.website) {
                    window.open(profile.website, '_blank');
                }
                break;
            default:
                onActionClick?.(actionId, profile);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.8 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 25,
            },
        },
    };

    return (
        <div className="w-full">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">
                One Click to Contact Me
            </h3>

            <motion.div
                className="grid grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {actions.map((action) => {
                    const Icon = action.icon;
                    const isDisabled =
                        (action.id === 'call' && !profile.mobile) ||
                        (action.id === 'email' && !profile.email) ||
                        (action.id === 'whatsapp' && !profile.whatsapp && !profile.mobile) ||
                        (action.id === 'navigation' && !profile.address) ||
                        (action.id === 'website' && !profile.website) ||
                        (action.id === 'gallery' && (!profile.gallery || profile.gallery.length === 0)) ||
                        (action.id === 'portfolio' && (!profile.portfolio || profile.portfolio.length === 0)) ||
                        (action.id === 'services' && (!profile.services || profile.services.length === 0));

                    return (
                        <motion.button
                            key={action.id}
                            onClick={() => handleAction(action.id)}
                            disabled={isDisabled}
                            className={`
                flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-200
                ${isDisabled
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
                                }
              `}
                            variants={itemVariants}
                            whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                            whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                        >
                            <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                ${action.iconBg}
                shadow-sm
              `}>
                                <Icon className={`w-7 h-7 ${action.iconColor}`} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                                {action.label}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
}
