// vCard Utility Functions
// Generates vCard (.vcf) files for contact import on iOS/Android

import { DigitalCardProfile } from '@/types/digital-card';

/**
 * Generate vCard 3.0 format string from profile data
 */
export function generateVCard(profile: DigitalCardProfile): string {
    const lines: string[] = [
        'BEGIN:VCARD',
        'VERSION:3.0',
    ];

    // Full Name
    if (profile.name) {
        lines.push(`FN:${escapeVCardValue(profile.name)}`);
        // Split name for N field (Last;First;Middle;Prefix;Suffix)
        const nameParts = profile.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';
        const firstName = nameParts.slice(0, -1).join(' ') || profile.name;
        lines.push(`N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);
    }

    // Organization/Designation
    if (profile.designation) {
        lines.push(`TITLE:${escapeVCardValue(profile.designation)}`);
    }

    // Phone Numbers
    if (profile.mobile) {
        lines.push(`TEL;TYPE=CELL:${profile.mobile}`);
    }
    if (profile.whatsapp && profile.whatsapp !== profile.mobile) {
        lines.push(`TEL;TYPE=VOICE:${profile.whatsapp}`);
    }

    // Email
    if (profile.email) {
        lines.push(`EMAIL;TYPE=INTERNET:${profile.email}`);
    }

    // Website
    if (profile.website) {
        lines.push(`URL:${profile.website}`);
    }

    // Address
    if (profile.address) {
        lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(profile.address)};;;;`);
    }

    // Social Links as URLs
    if (profile.socialLinks) {
        if (profile.socialLinks.linkedin) {
            lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${profile.socialLinks.linkedin}`);
        }
        if (profile.socialLinks.instagram) {
            lines.push(`X-SOCIALPROFILE;TYPE=instagram:${profile.socialLinks.instagram}`);
        }
        if (profile.socialLinks.facebook) {
            lines.push(`X-SOCIALPROFILE;TYPE=facebook:${profile.socialLinks.facebook}`);
        }
        if (profile.socialLinks.twitter) {
            lines.push(`X-SOCIALPROFILE;TYPE=twitter:${profile.socialLinks.twitter}`);
        }
    }

    // Photo (base64 encoded if available)
    if (profile.profileImage && profile.profileImage.startsWith('data:image')) {
        const base64Data = profile.profileImage.split(',')[1];
        const imageType = profile.profileImage.split(';')[0].split('/')[1].toUpperCase();
        if (base64Data) {
            lines.push(`PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}`);
        }
    }

    // Note with services
    if (profile.services && profile.services.length > 0) {
        lines.push(`NOTE:Services: ${profile.services.join(', ')}`);
    }

    lines.push('END:VCARD');

    return lines.join('\r\n');
}

/**
 * Escape special characters in vCard values
 */
function escapeVCardValue(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Download vCard file - triggers native contact creation on mobile
 */
export function downloadVCard(profile: DigitalCardProfile): void {
    const vCardContent = generateVCard(profile);
    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name?.replace(/\s+/g, '_') || 'contact'}.vcf`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Production domain for QR codes
 * Change this to your actual production domain
 */
const PRODUCTION_DOMAIN = 'https://7ideasstrust.com';

/**
 * Generate the public URL for a profile
 * Uses production domain for QR codes (so they work after printing)
 */
export function getPublicProfileUrl(profileId: string, useProductionUrl = true): string {
    // For QR codes, always use production URL
    if (useProductionUrl) {
        return `${PRODUCTION_DOMAIN}/digital-card/${profileId}`;
    }

    // For local navigation, use current origin
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/digital-card/${profileId}`;
    }
    return `/digital-card/${profileId}`;
}

/**
 * Get local URL for navigation (doesn't use production domain)
 */
export function getLocalProfileUrl(profileId: string): string {
    return getPublicProfileUrl(profileId, false);
}
