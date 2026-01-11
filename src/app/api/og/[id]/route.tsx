import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Fetch profile data from Firestore via REST API (edge-compatible)
    const projectId = 'voicevcard-95543';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/digital_cards?query`;

    try {
        // Query Firestore for profile with matching id field
        const queryBody = {
            structuredQuery: {
                from: [{ collectionId: 'digital_cards' }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'id' },
                        op: 'EQUAL',
                        value: { stringValue: id }
                    }
                },
                limit: 1
            }
        };

        const response = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(queryBody)
            }
        );

        const data = await response.json();

        // Parse Firestore response
        let profile: any = null;
        if (data && data.length > 0 && data[0].document) {
            const fields = data[0].document.fields;
            profile = {
                name: fields.name?.stringValue || 'Digital Card',
                designation: fields.designation?.stringValue || '',
                company: fields.company?.stringValue || '',
                theme: fields.theme?.stringValue || 'classic',
                profileImage: fields.profileImage?.stringValue || '',
                logo: fields.logo?.stringValue || ''
            };
        }

        const name = profile?.name || 'Digital Business Card';
        const designation = profile?.designation || '';
        const company = profile?.company || '';
        const theme = profile?.theme || 'classic';

        // Theme-based colors
        const themeColors: Record<string, { bg: string; primary: string; secondary: string; accent: string }> = {
            classic: { bg: 'linear-gradient(135deg, #0a1628 0%, #1a365d 100%)', primary: '#ffffff', secondary: '#93c5fd', accent: '#3b82f6' },
            ocean: { bg: 'linear-gradient(135deg, #e0f7fa 0%, #4dd0e1 100%)', primary: '#164e63', secondary: '#0d9488', accent: '#06b6d4' },
            sunset: { bg: 'linear-gradient(135deg, #fff5f5 0%, #fecdd3 100%)', primary: '#881337', secondary: '#be123c', accent: '#f97316' },
            emerald: { bg: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)', primary: '#064e3b', secondary: '#047857', accent: '#10b981' },
            midnight: { bg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', primary: '#ffffff', secondary: '#c4b5fd', accent: '#8b5cf6' }
        };

        const colors = themeColors[theme] || themeColors.classic;

        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.bg,
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Card container */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                        }}
                    >
                        {/* Name */}
                        <div
                            style={{
                                fontSize: 72,
                                fontWeight: 'bold',
                                color: colors.primary,
                                textAlign: 'center',
                                marginBottom: 16,
                                textTransform: 'capitalize',
                            }}
                        >
                            {name}
                        </div>

                        {/* Designation */}
                        {designation && (
                            <div
                                style={{
                                    fontSize: 36,
                                    color: colors.secondary,
                                    textAlign: 'center',
                                    marginBottom: 12,
                                }}
                            >
                                {designation}
                            </div>
                        )}

                        {/* Company */}
                        {company && (
                            <div
                                style={{
                                    fontSize: 28,
                                    color: colors.secondary,
                                    textAlign: 'center',
                                    opacity: 0.8,
                                    textTransform: 'uppercase',
                                    letterSpacing: 2,
                                }}
                            >
                                {company}
                            </div>
                        )}
                    </div>

                    {/* Branding */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: colors.primary,
                            opacity: 0.6,
                            fontSize: 20,
                        }}
                    >
                        Digital Business Card
                    </div>

                    {/* Decorative accent */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 200,
                            height: 200,
                            background: colors.accent,
                            opacity: 0.2,
                            borderRadius: '0 0 0 100%',
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('Error generating OG image:', error);

        // Fallback image
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #0a1628 0%, #1a365d 100%)',
                        color: 'white',
                        fontSize: 48,
                        fontFamily: 'sans-serif',
                    }}
                >
                    Digital Business Card
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    }
}
