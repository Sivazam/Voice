'use client';

import { QRCodeDisplay } from './qr-code';
import { ThemeName, defaultTheme } from '@/lib/themes';

interface CardBackProps {
    profileUrl: string;
    isPrintMode?: boolean;
    theme?: ThemeName;
}

export function CardBack({ profileUrl, isPrintMode = false, theme: themeName = defaultTheme }: CardBackProps) {
    const p = isPrintMode;
    const cardClasses = p ? 'w-[1050px] h-[600px]' : 'w-full max-w-[350px] h-[200px]';
    const qrSize = p ? 350 : 100;

    // Render theme-specific layout
    switch (themeName) {
        case 'ocean':
            return <OceanBack cardClasses={cardClasses} qrSize={qrSize} profileUrl={profileUrl} p={p} />;
        case 'sunset':
            return <SunsetBack cardClasses={cardClasses} qrSize={qrSize} profileUrl={profileUrl} p={p} />;
        case 'emerald':
            return <EmeraldBack cardClasses={cardClasses} qrSize={qrSize} profileUrl={profileUrl} p={p} />;
        case 'midnight':
            return <MidnightBack cardClasses={cardClasses} qrSize={qrSize} profileUrl={profileUrl} p={p} />;
        default:
            return <ClassicBack cardClasses={cardClasses} qrSize={qrSize} profileUrl={profileUrl} p={p} />;
    }
}

// ==================== CLASSIC BACK ====================
function ClassicBack({ cardClasses, qrSize, profileUrl, p }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d] shadow-2xl flex items-center justify-center`}>
            {/* Wave pattern */}
            <svg viewBox="0 0 200 200" className="absolute top-0 right-0 w-1/2 h-full opacity-20" preserveAspectRatio="none">
                <path d="M100,0 Q150,100 100,200 L200,200 L200,0 Z" fill="#3b82f6" />
            </svg>
            <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-white/10" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rotate-180 opacity-20">
                <svg viewBox="0 0 100 100"><circle cx="10" cy="10" r="8" fill="#fbbf24" fillOpacity="0.5" /></svg>
            </div>
            <div className="relative z-10 p-2 bg-white rounded-xl shadow-lg">
                <QRCodeDisplay url={profileUrl} size={qrSize} fgColor="#000000" bgColor="#ffffff" />
            </div>
        </div>
    );
}

// ==================== OCEAN BACK ====================
function OceanBack({ cardClasses, qrSize, profileUrl, p }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#4dd0e1] shadow-2xl flex items-center justify-center`}>
            {/* Floating bubbles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-white/30" />
                <div className="absolute top-12 left-16 w-4 h-4 rounded-full bg-white/20" />
                <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/25" />
                <div className="absolute top-8 right-20 w-6 h-6 rounded-full bg-cyan-400/30" />
            </div>
            {/* Wave bottom */}
            <svg viewBox="0 0 400 50" className="absolute bottom-0 left-0 w-full h-10" preserveAspectRatio="none">
                <path d="M0,25 Q100,0 200,25 T400,25 L400,50 L0,50 Z" fill="#0097a7" opacity="0.15" />
            </svg>
            <div className="relative z-10 p-3 bg-white rounded-2xl shadow-xl">
                <QRCodeDisplay url={profileUrl} size={qrSize} fgColor="#000000" bgColor="#ffffff" />
            </div>
            <p className={`absolute bottom-2 text-cyan-700 font-medium ${p ? 'text-lg' : 'text-[8px]'}`}>Scan to connect</p>
        </div>
    );
}

// ==================== SUNSET BACK ====================
function SunsetBack({ cardClasses, qrSize, profileUrl, p }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff5f5] via-[#ffe4e6] to-[#fecdd3] shadow-2xl flex items-center justify-center`}>
            {/* Diagonal corner triangle */}
            <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-400 to-rose-500 rotate-45 opacity-60" />
            </div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-rose-400 to-orange-300 rotate-45 opacity-40" />
            </div>
            <div className="relative z-10 p-3 bg-white rounded-2xl shadow-xl border-2 border-rose-200">
                <QRCodeDisplay url={profileUrl} size={qrSize} fgColor="#000000" bgColor="#ffffff" />
            </div>
        </div>
    );
}

// ==================== EMERALD BACK ====================
function EmeraldBack({ cardClasses, qrSize, profileUrl, p }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#d1fae5] via-[#a7f3d0] to-[#6ee7b7] shadow-2xl flex items-center justify-center`}>
            {/* Organic curves */}
            <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,30 Q100,10 200,30 T400,20 L400,0 L0,0 Z" fill="#059669" opacity="0.12" />
                <path d="M0,180 Q150,160 300,175 T400,170 L400,200 L0,200 Z" fill="#047857" opacity="0.1" />
            </svg>
            {/* Dotted border */}
            <div className="absolute inset-3 border-2 border-dashed border-emerald-500/20 rounded-xl pointer-events-none" />
            <div className="relative z-10 p-3 bg-white rounded-xl shadow-lg border border-emerald-200">
                <QRCodeDisplay url={profileUrl} size={qrSize} fgColor="#000000" bgColor="#ffffff" />
            </div>
        </div>
    );
}

// ==================== MIDNIGHT BACK ====================
function MidnightBack({ cardClasses, qrSize, profileUrl, p }: any) {
    return (
        <div className={`${cardClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95] shadow-2xl flex items-center justify-center`}>
            {/* Aurora effect */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-violet-400/20 via-purple-500/10 to-transparent" />
            {/* Star particles */}
            <div className="absolute inset-0">
                <div className="absolute top-6 left-10 w-1 h-1 bg-white rounded-full opacity-80" />
                <div className="absolute top-12 left-24 w-0.5 h-0.5 bg-white rounded-full opacity-60" />
                <div className="absolute top-8 right-16 w-1.5 h-1.5 bg-violet-300 rounded-full opacity-70" />
                <div className="absolute bottom-16 right-24 w-1 h-1 bg-white rounded-full opacity-40" />
            </div>
            {/* Glowing orb */}
            <div className="absolute bottom-4 left-8 w-20 h-20 bg-violet-500/20 rounded-full blur-xl" />
            <div className="relative z-10 p-3 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-violet-300/30">
                <QRCodeDisplay url={profileUrl} size={qrSize} fgColor="#000000" bgColor="#ffffff" />
            </div>
        </div>
    );
}
