'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    DigitalCardProfile,
    DigitalCardAuthState,
    SetupStep,
    createEmptyProfile
} from '@/types/digital-card';
import { DigitalCardService } from '@/lib/digital-card-service';

interface DigitalCardStore {
    // Auth State
    auth: DigitalCardAuthState;

    // Setup State
    currentStep: SetupStep;
    profile: Partial<DigitalCardProfile>;

    // Published Profiles (simulating database)
    publishedProfiles: DigitalCardProfile[];

    // Auth Actions
    setPhoneNumber: (phone: string) => void;
    loginSuccess: (phone: string) => Promise<void>;
    logout: () => void;

    // Setup Actions
    setCurrentStep: (step: SetupStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Profile Actions
    updateProfile: (data: Partial<DigitalCardProfile>) => void;
    resetProfile: () => void;
    publishProfile: () => string; // Returns the profile ID

    // Published Profiles Actions
    getProfileById: (id: string) => DigitalCardProfile | undefined;
}

// Generate a unique ID
const generateId = (): string => {
    return `dc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const useDigitalCardStore = create<DigitalCardStore>()(
    persist(
        (set, get) => ({
            // Initial Auth State
            auth: {
                isAuthenticated: false,
                phoneNumber: null,
                otpVerified: false,
            },

            // Initial Setup State
            currentStep: 1,
            profile: createEmptyProfile(),

            // Published Profiles
            publishedProfiles: [],

            // Auth Actions
            setPhoneNumber: (phone) => {
                set((state) => ({
                    auth: { ...state.auth, phoneNumber: phone },
                    profile: { ...state.profile, mobile: phone },
                }));
            },

            loginSuccess: async (phoneNumber) => {
                // Fetch profile from Firestore
                let profileUpdate = {};
                if (phoneNumber) {
                    try {
                        const remoteProfile = await DigitalCardService.getProfile(phoneNumber);
                        if (remoteProfile) {
                            profileUpdate = { profile: remoteProfile };
                        }
                    } catch (error) {
                        console.error('Error fetching profile:', error);
                    }
                }

                set((state) => ({
                    auth: {
                        ...state.auth,
                        phoneNumber,
                        isAuthenticated: true,
                        otpVerified: true
                    },
                    ...profileUpdate
                }));
            },

            logout: () => {
                set({
                    auth: {
                        isAuthenticated: false,
                        phoneNumber: null,
                        otpVerified: false,
                    },
                    currentStep: 1,
                    profile: createEmptyProfile(),
                });
            },

            // Setup Actions
            setCurrentStep: (step) => set({ currentStep: step }),

            nextStep: () => {
                const { currentStep } = get();
                if (currentStep < 5) {
                    set({ currentStep: (currentStep + 1) as SetupStep });
                }
            },

            prevStep: () => {
                const { currentStep } = get();
                if (currentStep > 1) {
                    set({ currentStep: (currentStep - 1) as SetupStep });
                }
            },

            // Profile Actions
            updateProfile: (data) => {
                set((state) => {
                    const newProfile = {
                        ...state.profile,
                        ...data,
                        updatedAt: new Date().toISOString(),
                    };

                    // Save to Firestore (fire and forget)
                    const { auth } = get();
                    if (auth.phoneNumber) {
                        DigitalCardService.saveProfile(auth.phoneNumber, newProfile).catch(err =>
                            console.error('Error auto-saving profile:', err)
                        );
                    }

                    return { profile: newProfile };
                });
            },

            resetProfile: () => {
                set({
                    currentStep: 1,
                    profile: createEmptyProfile(),
                });
            },

            publishProfile: () => {
                const { profile, auth } = get();
                const id = generateId();
                const now = new Date().toISOString();

                const publishedProfile: DigitalCardProfile = {
                    ...createEmptyProfile(),
                    ...profile,
                    id,
                    mobile: auth.phoneNumber || profile.mobile || '',
                    createdAt: now,
                    updatedAt: now,
                    isPublished: true,
                } as DigitalCardProfile;

                try {
                    set((state) => ({
                        publishedProfiles: [...state.publishedProfiles, publishedProfile],
                        profile: { ...state.profile, id, isPublished: true },
                    }));

                    // Save to Firestore
                    if (auth.phoneNumber) {
                        DigitalCardService.publishProfile(auth.phoneNumber, publishedProfile).catch(err =>
                            console.error('Error publishing to Firestore:', err)
                        );
                    }
                } catch (error) {
                    console.error('Error publishing profile:', error);
                }

                return id;
            },

            // Get Profile - prioritize current session profile (has gallery)
            getProfileById: (id) => {
                const { publishedProfiles, profile } = get();
                // First check current profile (it has full gallery data in session)
                if (profile.id === id && profile.isPublished) {
                    return profile as DigitalCardProfile;
                }
                // Then check stored published profiles (gallery stripped)
                const found = publishedProfiles.find((p) => p.id === id);
                if (found) {
                    // Merge with current profile if it's the same ID (to get gallery back)
                    if (profile.id === found.id) {
                        return { ...found, gallery: profile.gallery || found.gallery } as DigitalCardProfile;
                    }
                    return found;
                }
                return undefined;
            },
        }),
        {
            name: 'digital-card-storage',
            partialize: (state) => ({
                auth: state.auth,
                currentStep: state.currentStep,
                profile: state.profile,
                publishedProfiles: state.publishedProfiles,
            }),
        }
    )
);
