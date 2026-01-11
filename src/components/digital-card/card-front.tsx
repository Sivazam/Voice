'use client';

import { Phone, Mail, Globe } from 'lucide-react';
import { DigitalCardProfile } from '@/types/digital-card';
import { themes, ThemeName, defaultTheme } from '@/lib/themes';

interface CardFrontProps {
    profile: Partial<DigitalCardProfile>;
    isPrintMode?: boolean;
    crossOrigin?: "anonymous" | "use-credentials" | "" | undefined;
}

export function CardFront({ profile, isPrintMode = false, crossOrigin }: CardFrontProps) {
    const themeName = (profile.theme || defaultTheme) as ThemeName;
    const theme = themes[themeName];
    const p = isPrintMode; // shorthand

    const cardClasses = p ? 'w-[1050px] h-[600px]' : 'w-full max-w-[350px] h-[200px]';

    // Render theme-specific layout
    switch (themeName) {
        case 'ocean':
            return <OceanLayout profile={profile} theme={theme} cardClasses={cardClasses} p={p} crossOrigin={crossOrigin} />;
        case 'sunset':
            return <SunsetLayout profile={profile} theme={theme} cardClasses={cardClasses} p={p} crossOrigin={crossOrigin} />;
        case 'emerald':
            return <EmeraldLayout profile={profile} theme={theme} cardClasses={cardClasses} p={p} crossOrigin={crossOrigin} />;
        case 'midnight':
            return <MidnightLayout profile={profile} theme={theme} cardClasses={cardClasses} p={p} crossOrigin={crossOrigin} />;
        default:
            return <ClassicLayout profile={profile} theme={theme} cardClasses={cardClasses} p={p} crossOrigin={crossOrigin} />;
    }
}

// ==================== CLASSIC LAYOUT ====================
// Left-aligned content, vertical company name on right, wave pattern
function ClassicLayout({ profile, theme, cardClasses, p, crossOrigin }: any) {
    const isDark = true;
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d] shadow-2xl`}>
            {/* Wave pattern right */}
            <svg viewBox="0 0 200 200" className="absolute top-0 right-0 w-1/2 h-full opacity-30" preserveAspectRatio="none">
                <path d="M100,0 Q150,100 100,200 L200,200 L200,0 Z" fill="#3b82f6" />
            </svg>
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-white/10" />
            <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/5" />

            {/* Gold corner accent */}
            <div className="absolute top-0 left-0 w-20 h-20 opacity-20">
                <svg viewBox="0 0 100 100"><circle cx="10" cy="10" r="8" fill="#fbbf24" fillOpacity="0.5" /><circle cx="30" cy="10" r="5" fill="#fbbf24" fillOpacity="0.3" /><circle cx="10" cy="30" r="5" fill="#fbbf24" fillOpacity="0.3" /></svg>
            </div>

            <div className={`relative z-10 h-full flex flex-col ${p ? 'p-10' : 'p-5'} justify-between`}>
                <div className="flex items-start gap-3">
                    {(profile.logo || profile.profileImage) && (
                        <div className={`${p ? 'w-24 h-24 rounded-2xl' : 'w-14 h-14 rounded-lg'} bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/20 shrink-0`}>
                            <img src={profile.logo || profile.profileImage} alt="" crossOrigin={crossOrigin} className="w-full h-full object-contain p-1" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0 pt-1">
                        <h2 className={`font-bold text-white leading-tight capitalize ${p ? 'text-5xl mb-2' : 'text-lg'}`}>{profile.name}</h2>
                        <p className={`font-medium text-blue-300 ${p ? 'text-3xl' : 'text-xs'}`}>{profile.designation}</p>
                    </div>
                </div>
                <div className={`space-y-1.5 ${p ? 'space-y-3' : ''}`}>
                    {profile.mobile && <ContactRow icon={Phone} text={profile.mobile} p={p} iconBg="bg-white/10" iconColor="text-blue-400" textColor="text-white/90" />}
                    {profile.email && <ContactRow icon={Mail} text={profile.email} p={p} iconBg="bg-white/10" iconColor="text-blue-400" textColor="text-white/90" />}
                    {profile.website && <ContactRow icon={Globe} text={profile.website.replace(/^https?:\/\//, '')} p={p} iconBg="bg-white/10" iconColor="text-blue-400" textColor="text-white/90" />}
                </div>
            </div>
            {profile.company && <VerticalCompany text={profile.company} p={p} color="text-white/15" />}
        </div>
    );
}

// ==================== OCEAN LAYOUT ====================
// Centered content, bottom contact bar, floating bubbles
function OceanLayout({ profile, theme, cardClasses, p, crossOrigin }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#4dd0e1] shadow-2xl`}>
            {/* Floating bubbles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-white/30" />
                <div className="absolute top-12 left-16 w-4 h-4 rounded-full bg-white/20" />
                <div className="absolute bottom-16 right-8 w-12 h-12 rounded-full bg-white/25" />
                <div className="absolute top-8 right-20 w-6 h-6 rounded-full bg-cyan-400/30" />
                <div className="absolute bottom-8 left-12 w-5 h-5 rounded-full bg-teal-300/40" />
            </div>
            {/* Wave bottom */}
            <svg viewBox="0 0 400 50" className="absolute bottom-0 left-0 w-full h-10" preserveAspectRatio="none">
                <path d="M0,25 Q100,0 200,25 T400,25 L400,50 L0,50 Z" fill="#0097a7" opacity="0.15" />
            </svg>

            <div className={`relative z-10 h-full flex flex-col items-center justify-center text-center ${p ? 'px-16' : 'px-6'}`}>
                {(profile.logo || profile.profileImage) && (
                    <div className={`${p ? 'w-28 h-28 mb-4' : 'w-12 h-12 mb-2'} rounded-full bg-white shadow-lg overflow-hidden border-4 border-white`}>
                        <img src={profile.logo || profile.profileImage} alt="" crossOrigin={crossOrigin} className="w-full h-full object-cover" />
                    </div>
                )}
                <h2 className={`font-bold text-cyan-900 capitalize ${p ? 'text-5xl mb-2' : 'text-lg mb-0.5'}`}>{profile.name}</h2>
                <p className={`font-medium text-teal-600 ${p ? 'text-2xl mb-4' : 'text-[10px] mb-2'}`}>{profile.designation}</p>
                {profile.company && <p className={`text-cyan-700/60 font-semibold uppercase tracking-wider ${p ? 'text-xl' : 'text-[8px]'}`}>{profile.company}</p>}
            </div>

            {/* Bottom contact bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-cyan-800/90 backdrop-blur ${p ? 'py-4 px-8' : 'py-1.5 px-4'}`}>
                <div className={`flex justify-center ${p ? 'gap-8' : 'gap-4'} text-white`}>
                    {profile.mobile && <span className={p ? 'text-lg' : 'text-[9px]'}>{profile.mobile}</span>}
                    {profile.email && <span className={p ? 'text-lg' : 'text-[9px]'}>{profile.email}</span>}
                </div>
            </div>
        </div>
    );
}

// ==================== SUNSET LAYOUT ====================
// Split design - large photo left, info right, diagonal accent
function SunsetLayout({ profile, theme, cardClasses, p, crossOrigin }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff5f5] via-[#ffe4e6] to-[#fecdd3] shadow-2xl`}>
            {/* Diagonal corner triangle */}
            <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-400 to-rose-500 rotate-45 opacity-80" />
            </div>
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-1/2 h-2 bg-gradient-to-r from-rose-400 to-orange-400" />

            <div className="relative z-10 h-full flex">
                {/* Left - Photo */}
                <div className={`${p ? 'w-[280px]' : 'w-[90px]'} h-full flex items-center justify-center ${p ? 'pl-8' : 'pl-3'}`}>
                    {(profile.logo || profile.profileImage) && (
                        <div className={`${p ? 'w-48 h-48' : 'w-16 h-16'} rounded-2xl overflow-hidden shadow-xl border-4 border-white`}>
                            <img src={profile.logo || profile.profileImage} alt="" crossOrigin={crossOrigin} className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
                {/* Right - Info */}
                <div className={`flex-1 flex flex-col justify-center ${p ? 'pr-12 pl-8' : 'pr-4 pl-2'}`}>
                    <h2 className={`font-bold text-rose-900 capitalize leading-tight ${p ? 'text-5xl mb-2' : 'text-base mb-0.5'}`}>{profile.name}</h2>
                    <p className={`font-semibold text-rose-600 ${p ? 'text-2xl mb-3' : 'text-[10px] mb-1'}`}>{profile.designation}</p>
                    {profile.company && <p className={`text-rose-400 font-medium ${p ? 'text-xl mb-4' : 'text-[8px] mb-2'}`}>{profile.company}</p>}
                    <div className={`space-y-1 ${p ? 'space-y-2' : ''}`}>
                        {profile.mobile && <p className={`text-rose-700 ${p ? 'text-xl' : 'text-[9px]'}`}>{profile.mobile}</p>}
                        {profile.email && <p className={`text-rose-700 ${p ? 'text-xl' : 'text-[9px]'}`}>{profile.email}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== EMERALD LAYOUT ====================
// Bottom-aligned content, large centered logo top, organic curves
function EmeraldLayout({ profile, theme, cardClasses, p, crossOrigin }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#d1fae5] via-[#a7f3d0] to-[#6ee7b7] shadow-2xl`}>
            {/* Organic curves */}
            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,150 Q100,120 200,140 T400,130 L400,200 L0,200 Z" fill="#059669" opacity="0.15" />
                <path d="M0,170 Q150,150 300,165 T400,160 L400,200 L0,200 Z" fill="#047857" opacity="0.1" />
            </svg>
            {/* Dotted border effect */}
            <div className="absolute inset-3 border-2 border-dashed border-emerald-500/20 rounded-xl pointer-events-none" />

            <div className={`relative z-10 h-full flex flex-col ${p ? 'pt-6 pb-8 px-10' : 'pt-3 pb-4 px-5'}`}>
                {/* Top - Centered Logo */}
                <div className="flex justify-center">
                    {(profile.logo || profile.profileImage) && (
                        <div className={`${p ? 'w-24 h-24' : 'w-10 h-10'} rounded-xl bg-white shadow-lg overflow-hidden`}>
                            <img src={profile.logo || profile.profileImage} alt="" crossOrigin={crossOrigin} className="w-full h-full object-contain p-1" />
                        </div>
                    )}
                </div>
                {/* Bottom - Info */}
                <div className="flex-1 flex flex-col justify-end text-center">
                    <h2 className={`font-bold text-emerald-900 capitalize ${p ? 'text-5xl mb-2' : 'text-lg mb-0.5'}`}>{profile.name}</h2>
                    <p className={`font-semibold text-emerald-600 ${p ? 'text-2xl mb-2' : 'text-[10px] mb-1'}`}>{profile.designation}</p>
                    {profile.company && <p className={`text-emerald-500 font-medium uppercase tracking-wide ${p ? 'text-lg mb-3' : 'text-[8px] mb-1.5'}`}>{profile.company}</p>}
                    <div className={`flex justify-center flex-wrap ${p ? 'gap-6' : 'gap-3'}`}>
                        {profile.mobile && <span className={`text-emerald-700 ${p ? 'text-xl' : 'text-[9px]'}`}>{profile.mobile}</span>}
                        {profile.email && <span className={`text-emerald-700 ${p ? 'text-xl' : 'text-[9px]'}`}>{profile.email}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== MIDNIGHT LAYOUT ====================
// Top-heavy with name prominent, star particles, aurora effect
function MidnightLayout({ profile, theme, cardClasses, p, crossOrigin }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] shadow-2xl`}>
            {/* Aurora effect */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-violet-400/20 via-purple-500/10 to-transparent" />
            {/* Star particles */}
            <div className="absolute inset-0">
                <div className="absolute top-6 left-10 w-1 h-1 bg-white rounded-full opacity-80" />
                <div className="absolute top-12 left-24 w-0.5 h-0.5 bg-white rounded-full opacity-60" />
                <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-violet-300 rounded-full opacity-70" />
                <div className="absolute top-16 right-10 w-1 h-1 bg-white rounded-full opacity-50" />
                <div className="absolute bottom-20 left-20 w-0.5 h-0.5 bg-violet-200 rounded-full opacity-60" />
                <div className="absolute bottom-16 right-24 w-1 h-1 bg-white rounded-full opacity-40" />
            </div>
            {/* Glowing orb */}
            <div className="absolute top-4 right-8 w-20 h-20 bg-violet-500/20 rounded-full blur-xl" />

            <div className={`relative z-10 h-full flex flex-col ${p ? 'p-10' : 'p-5'}`}>
                {/* Top - Prominent name */}
                <div className="flex items-start gap-3">
                    {(profile.logo || profile.profileImage) && (
                        <div className={`${p ? 'w-20 h-20' : 'w-12 h-12'} rounded-xl bg-violet-500/20 backdrop-blur overflow-hidden border border-violet-400/30`}>
                            <img src={profile.logo || profile.profileImage} alt="" crossOrigin={crossOrigin} className="w-full h-full object-contain p-1" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className={`font-extrabold text-white capitalize leading-tight ${p ? 'text-6xl mb-1' : 'text-xl mb-0'}`}>{profile.name}</h2>
                        <p className={`font-medium text-violet-300 ${p ? 'text-2xl' : 'text-xs'}`}>{profile.designation}</p>
                    </div>
                </div>
                {/* Bottom - Compact details */}
                <div className="flex-1" />
                <div className={`flex items-end justify-between`}>
                    <div className={`space-y-0.5 ${p ? 'space-y-1' : ''}`}>
                        {profile.mobile && <p className={`text-violet-200 ${p ? 'text-xl' : 'text-[10px]'}`}>{profile.mobile}</p>}
                        {profile.email && <p className={`text-violet-200 ${p ? 'text-xl' : 'text-[10px]'}`}>{profile.email}</p>}
                    </div>
                    {profile.company && (
                        <p className={`text-violet-400/50 font-bold uppercase tracking-widest ${p ? 'text-2xl' : 'text-[10px]'}`}>{profile.company}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== HELPER COMPONENTS ====================
function ContactRow({ icon: Icon, text, p, iconBg, iconColor, textColor }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className={`${p ? 'w-10 h-10' : 'w-5 h-5'} rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`${p ? 'w-5 h-5' : 'w-3 h-3'} ${iconColor}`} />
            </div>
            <span className={`truncate ${textColor} ${p ? 'text-3xl' : 'text-xs'}`}>{text}</span>
        </div>
    );
}

function VerticalCompany({ text, p, color }: any) {
    const len = text.length;
    let size = p ? 'text-6xl' : 'text-[15px]';
    if (len > 50) size = p ? 'text-3xl' : 'text-[9px]';
    else if (len > 30) size = p ? 'text-4xl' : 'text-[11px]';
    else if (len > 20) size = p ? 'text-5xl' : 'text-[13px]';

    return (
        <div className={`absolute top-0 right-0 h-full flex items-center justify-center pointer-events-none ${p ? 'w-[160px]' : 'w-14'}`}>
            <div className={`transform -rotate-90 font-bold uppercase text-center leading-none whitespace-normal flex-shrink-0 ${color} ${p ? 'w-[540px]' : 'w-[180px]'} ${size} tracking-tight`}>
                {text}
            </div>
        </div>
    );
}
