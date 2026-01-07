'use client';

import { Phone, Mail, Globe, MapPin, User } from 'lucide-react';
import { DigitalCardProfile } from '@/types/digital-card';

interface CardFrontProps {
    profile: Partial<DigitalCardProfile>;
    isPrintMode?: boolean;
    crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
}

export function CardFront({ profile, isPrintMode = false, crossOrigin }: CardFrontProps) {
    const cardClasses = isPrintMode
        ? 'w-[1050px] h-[600px]' // 3.5 x 2 inches at 300 DPI
        : 'w-full max-w-[350px] h-[200px]';

    const getCompanyStyle = (length: number, print: boolean) => {
        if (print) {
            if (length > 80) return { size: 'text-xl', tracking: 'tracking-tighter' };
            if (length > 60) return { size: 'text-2xl', tracking: 'tracking-tighter' };
            if (length > 50) return { size: 'text-3xl', tracking: 'tracking-tight' };
            if (length > 40) return { size: 'text-3xl', tracking: 'tracking-tight' };
            if (length > 30) return { size: 'text-4xl', tracking: 'tracking-normal' };
            if (length > 20) return { size: 'text-5xl', tracking: 'tracking-tight' };
            return { size: 'text-6xl', tracking: 'tracking-normal' };
        }
        if (length > 80) return { size: 'text-[7px]', tracking: 'tracking-tighter' };
        if (length > 60) return { size: 'text-[8px]', tracking: 'tracking-tighter' };
        if (length > 50) return { size: 'text-[9px]', tracking: 'tracking-tighter' };
        if (length > 40) return { size: 'text-[10px]', tracking: 'tracking-tight' };
        if (length > 30) return { size: 'text-[11px]', tracking: 'tracking-tight' };
        if (length > 20) return { size: 'text-[13px]', tracking: 'tracking-normal' };
        return { size: 'text-[15px]', tracking: 'tracking-normal' };
    };

    const companyStyle = profile.company ? getCompanyStyle(profile.company.length, isPrintMode) : { size: '', tracking: '' };

    return (
        <div
            className={`
        ${cardClasses}
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d]
        shadow-2xl
      `}
        >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full">
                {/* Curved wave pattern */}
                <svg
                    viewBox="0 0 200 200"
                    className="absolute top-0 right-0 w-full h-full opacity-30"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M100,0 Q150,100 100,200 L200,200 L200,0 Z"
                        fill="url(#waveGradient)"
                    />
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Decorative circles */}
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-white/10" />
                <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/5" />
            </div>

            {/* Decorative corner ornament */}
            <div className="absolute top-0 left-0 w-20 h-20 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="10" cy="10" r="8" fill="#fbbf24" fillOpacity="0.5" />
                    <circle cx="30" cy="10" r="5" fill="#fbbf24" fillOpacity="0.3" />
                    <circle cx="10" cy="30" r="5" fill="#fbbf24" fillOpacity="0.3" />
                    <path d="M0,50 Q25,25 50,0" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.5" />
                </svg>
            </div>

            {/* Content */}
            <div className={`relative z-10 h-full flex flex-col ${isPrintMode ? 'p-10 justify-between' : 'p-5 justify-between'}`} style={{ fontFamily: 'var(--font-raleway), sans-serif' }}>
                {/* Top Section - Logo & Name */}
                <div className="flex items-start gap-3">
                    {/* Logo or Profile Image - Conditionally Rendered */}
                    {(profile.logo || profile.profileImage) && (
                        <div className={`${isPrintMode ? 'w-24 h-24 rounded-2xl' : 'w-14 h-14 rounded-lg'} bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20 shrink-0`}>
                            {profile.logo ? (
                                <img src={profile.logo} alt="Logo" crossOrigin={crossOrigin} className="w-full h-full object-contain p-1" />
                            ) : (
                                <img src={profile.profileImage} alt={profile.name} crossOrigin={crossOrigin} className="w-full h-full object-cover" />
                            )}
                        </div>
                    )}

                    <div className="flex-1 min-w-0 pt-1">
                        <h2 className={`font-bold text-white leading-tight ${isPrintMode ? 'text-5xl mb-2' : 'text-lg'}`}>
                            {profile.name}
                        </h2>
                        <p className={`text-blue-300 font-medium ${isPrintMode ? 'text-3xl' : 'text-xs'}`}>
                            {profile.designation}
                        </p>
                    </div>
                </div>

                {/* Contact Details */}
                <div className={`space-y-1.5 ${isPrintMode ? 'space-y-3 mt-4' : ''}`}>
                    {profile.mobile && (
                        <div className="flex items-center gap-3">
                            <div className={`${isPrintMode ? 'w-10 h-10' : 'w-5 h-5'} rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                                <Phone className={`${isPrintMode ? 'w-5 h-5' : 'w-3 h-3'} text-blue-400`} />
                            </div>
                            <span className={`text-white/90 truncate ${isPrintMode ? 'text-3xl' : 'text-xs'}`}>
                                {profile.mobile}
                            </span>
                        </div>
                    )}

                    {profile.email && (
                        <div className="flex items-center gap-3">
                            <div className={`${isPrintMode ? 'w-10 h-10' : 'w-5 h-5'} rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                                <Mail className={`${isPrintMode ? 'w-5 h-5' : 'w-3 h-3'} text-blue-400`} />
                            </div>
                            <span className={`text-white/90 truncate ${isPrintMode ? 'text-3xl' : 'text-xs'}`}>
                                {profile.email}
                            </span>
                        </div>
                    )}

                    {profile.website && (
                        <div className="flex items-center gap-3">
                            <div className={`${isPrintMode ? 'w-10 h-10' : 'w-5 h-5'} rounded-full bg-white/10 flex items-center justify-center shrink-0`}>
                                <Globe className={`${isPrintMode ? 'w-5 h-5' : 'w-3 h-3'} text-blue-400`} />
                            </div>
                            <span className={`text-white/90 truncate ${isPrintMode ? 'text-3xl' : 'text-xs'}`}>
                                {profile.website.replace(/^https?:\/\//, '')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Business Name - Vertical on Right */}
            {profile.company && (
                <div className={`absolute top-0 right-0 h-full flex items-center justify-center pointer-events-none ${isPrintMode ? 'w-[160px]' : 'w-14'}`}>
                    <div
                        className={`transform -rotate-90 font-bold text-white/20 uppercase text-center leading-none whitespace-normal flex-shrink-0 ${isPrintMode ? 'w-[540px]' : 'w-[180px]'} ${companyStyle.size} ${companyStyle.tracking}`}
                    >
                        {profile.company}
                    </div>
                </div>
            )}
        </div>
    );
}
