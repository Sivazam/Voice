'use client';

export type ThemeName = 'classic' | 'ocean' | 'sunset' | 'emerald' | 'midnight';

export interface CardTheme {
    name: ThemeName;
    label: string;
    // Card backgrounds
    cardBg: string;
    cardBgStyle: React.CSSProperties;
    // Text colors
    primaryText: string;
    secondaryText: string;
    mutedText: string;
    // Accent colors
    accent: string;
    accentLight: string;
    // Icon backgrounds
    iconBg: string;
    iconColor: string;
    // Decorative
    decorativeColor: string;
    decorativeOpacity: number;
    // QR Code (back)
    qrBg: string;
    qrFg: string;
    // Preview swatch colors (for selector)
    swatchPrimary: string;
    swatchSecondary: string;
}

export const themes: Record<ThemeName, CardTheme> = {
    classic: {
        name: 'classic',
        label: 'Classic',
        cardBg: 'bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d]',
        cardBgStyle: {},
        primaryText: 'text-white',
        secondaryText: 'text-blue-300',
        mutedText: 'text-white/90',
        accent: '#3b82f6',
        accentLight: '#60a5fa',
        iconBg: 'bg-white/10',
        iconColor: 'text-blue-400',
        decorativeColor: '#fbbf24',
        decorativeOpacity: 0.2,
        qrBg: 'bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d]',
        qrFg: '#ffffff',
        swatchPrimary: '#0f2847',
        swatchSecondary: '#3b82f6',
    },
    ocean: {
        name: 'ocean',
        label: 'Ocean',
        cardBg: 'bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#80deea]',
        cardBgStyle: {},
        primaryText: 'text-cyan-900',
        secondaryText: 'text-cyan-700',
        mutedText: 'text-cyan-800',
        accent: '#0097a7',
        accentLight: '#00bcd4',
        iconBg: 'bg-cyan-600/20',
        iconColor: 'text-cyan-600',
        decorativeColor: '#00838f',
        decorativeOpacity: 0.15,
        qrBg: 'bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#80deea]',
        qrFg: '#006064',
        swatchPrimary: '#80deea',
        swatchSecondary: '#00bcd4',
    },
    sunset: {
        name: 'sunset',
        label: 'Sunset',
        cardBg: 'bg-gradient-to-br from-[#fff5f5] via-[#fed7d7] to-[#fbb6b6]',
        cardBgStyle: {},
        primaryText: 'text-rose-900',
        secondaryText: 'text-rose-600',
        mutedText: 'text-rose-800',
        accent: '#e11d48',
        accentLight: '#fb7185',
        iconBg: 'bg-rose-500/15',
        iconColor: 'text-rose-500',
        decorativeColor: '#f97316',
        decorativeOpacity: 0.2,
        qrBg: 'bg-gradient-to-br from-[#fff5f5] via-[#fed7d7] to-[#fbb6b6]',
        qrFg: '#9f1239',
        swatchPrimary: '#fbb6b6',
        swatchSecondary: '#f97316',
    },
    emerald: {
        name: 'emerald',
        label: 'Emerald',
        cardBg: 'bg-gradient-to-br from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
        cardBgStyle: {},
        primaryText: 'text-emerald-900',
        secondaryText: 'text-emerald-600',
        mutedText: 'text-emerald-800',
        accent: '#059669',
        accentLight: '#10b981',
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-600',
        decorativeColor: '#14b8a6',
        decorativeOpacity: 0.15,
        qrBg: 'bg-gradient-to-br from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0]',
        qrFg: '#065f46',
        swatchPrimary: '#a7f3d0',
        swatchSecondary: '#10b981',
    },
    midnight: {
        name: 'midnight',
        label: 'Midnight',
        cardBg: 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
        cardBgStyle: {},
        primaryText: 'text-white',
        secondaryText: 'text-violet-300',
        mutedText: 'text-violet-100',
        accent: '#8b5cf6',
        accentLight: '#a78bfa',
        iconBg: 'bg-violet-500/20',
        iconColor: 'text-violet-400',
        decorativeColor: '#c084fc',
        decorativeOpacity: 0.25,
        qrBg: 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
        qrFg: '#ffffff',
        swatchPrimary: '#4c1d95',
        swatchSecondary: '#8b5cf6',
    },
};

export const themeList = Object.values(themes);
export const defaultTheme: ThemeName = 'classic';
