import { Metadata } from 'next';

// Production domain for OG URLs
const PROD_DOMAIN = 'https://7ideasstrust.com';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    // Fetch profile data for metadata
    const projectId = 'voicevcard-95543';
    let profile = { name: 'Digital Business Card', designation: '', company: '' };

    try {
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
                body: JSON.stringify(queryBody),
                next: { revalidate: 60 } // Cache for 60 seconds
            }
        );

        const data = await response.json();

        if (data && data.length > 0 && data[0].document) {
            const fields = data[0].document.fields;
            profile = {
                name: fields.name?.stringValue || 'Digital Business Card',
                designation: fields.designation?.stringValue || '',
                company: fields.company?.stringValue || ''
            };
        }
    } catch (error) {
        console.error('Error fetching profile for metadata:', error);
    }

    const title = profile.name;
    const description = [profile.designation, profile.company].filter(Boolean).join(' | ') || 'Digital Business Card';
    const ogImageUrl = `${PROD_DOMAIN}/api/og/${id}`;
    const pageUrl = `${PROD_DOMAIN}/digital-card/${id}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'profile',
            url: pageUrl,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${profile.name}'s Digital Business Card`,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
    };
}

export default function DigitalCardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
