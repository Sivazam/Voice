'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
    url: string;
    size?: number;
    className?: string;
}

export function QRCodeDisplay({ url, size = 200, className = '' }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (canvasRef.current && url) {
            QRCode.toCanvas(canvasRef.current, url, {
                width: size,
                margin: 2,
                color: {
                    dark: '#1e293b', // Slate-800
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H', // High error correction for print reliability
            })
                .then(() => setError(null))
                .catch((err) => {
                    console.error('QR Code generation error:', err);
                    setError('Failed to generate QR code');
                });
        }
    }, [url, size]);

    if (!url) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
                style={{ width: size, height: size }}
            >
                <span className="text-gray-400 text-sm">No URL</span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className={`flex items-center justify-center bg-red-50 rounded-lg ${className}`}
                style={{ width: size, height: size }}
            >
                <span className="text-red-400 text-sm">{error}</span>
            </div>
        );
    }

    return (
        <canvas
            ref={canvasRef}
            className={`rounded-lg ${className}`}
            style={{ width: size, height: size }}
        />
    );
}
