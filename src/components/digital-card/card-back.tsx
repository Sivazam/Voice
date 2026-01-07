'use client';

import { QRCodeDisplay } from './qr-code';

interface CardBackProps {
    profileUrl: string;
    isPrintMode?: boolean;
}

export function CardBack({ profileUrl, isPrintMode = false }: CardBackProps) {
    const cardClasses = isPrintMode
        ? 'w-[1050px] h-[600px]' // 3.5 x 2 inches at 300 DPI
        : 'w-full max-w-[350px] h-[200px]';

    const qrSize = isPrintMode ? 350 : 100;

    return (
        <div
            className={`
        ${cardClasses}
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a365d]
        shadow-2xl
        flex items-center justify-center
      `}
        >
            {/* Decorative Elements - matching front */}
            <div className="absolute top-0 right-0 w-1/2 h-full">
                <svg
                    viewBox="0 0 200 200"
                    className="absolute top-0 right-0 w-full h-full opacity-20"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M100,0 Q150,100 100,200 L200,200 L200,0 Z"
                        fill="url(#waveGradientBack)"
                    />
                    <defs>
                        <linearGradient id="waveGradientBack" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-white/10" />
                <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/5" />
            </div>

            {/* Corner accent - matching front */}
            <div className="absolute bottom-0 left-0 w-20 h-20 opacity-20 rotate-180">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="10" cy="10" r="8" fill="#fbbf24" fillOpacity="0.5" />
                    <circle cx="30" cy="10" r="5" fill="#fbbf24" fillOpacity="0.3" />
                    <circle cx="10" cy="30" r="5" fill="#fbbf24" fillOpacity="0.3" />
                </svg>
            </div>

            {/* QR Code */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl shadow-lg">
                    <QRCodeDisplay url={profileUrl} size={qrSize} />
                </div>

                {/* Branding */}
                <p className={`mt-2 text-white/80 ${isPrintMode ? 'text-lg' : 'text-[10px]'}`}>
                    Digital Business Card by{' '}
                    <a
                        href="https://7ideasstrust.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200"
                    >
                        7ideasstrust.com
                    </a>
                </p>
            </div>
        </div>
    );
}
