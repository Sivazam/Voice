// Digital Business Card Types
// Fully isolated from existing types

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string; // X
  youtube?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
}

export interface DigitalCardProfile {
  id: string;

  // Basic Info (Step 1)
  name: string;
  designation: string;
  company?: string; // Added company field
  profileImage?: string;
  logo?: string;

  // Contact Info (Step 2)
  mobile: string;
  whatsapp?: string;
  email?: string;
  address?: string;

  // Online Presence (Step 3)
  website?: string;
  socialLinks: SocialLinks;

  // Professional Info (Step 4)
  services: string[];
  portfolio: PortfolioItem[];
  gallery: string[];

  // Testimonials & Notes
  testimonials: Testimonial[];

  // Meta
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating?: number;
}

export interface DigitalCardAuthState {
  isAuthenticated: boolean;
  phoneNumber: string | null;
  otpVerified: boolean;
}

export type SetupStep = 1 | 2 | 3 | 4 | 5;

export interface DigitalCardSetupState {
  currentStep: SetupStep;
  profile: Partial<DigitalCardProfile>;
  auth: DigitalCardAuthState;
}

// Default empty profile
export const createEmptyProfile = (): Partial<DigitalCardProfile> => ({
  id: '',
  name: '',
  designation: '',
  company: '', // Added company field
  profileImage: '',
  logo: '',
  mobile: '',
  whatsapp: '',
  email: '',
  address: '',
  website: '',
  socialLinks: {
    instagram: '',
    linkedin: '',
    facebook: '',
    twitter: '',
    youtube: '',
  },
  services: [],
  portfolio: [],
  gallery: [],
  testimonials: [],
  isPublished: false,
});
