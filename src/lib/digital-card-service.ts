import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { firebaseStorage, firestore } from "./firestore";
import { DigitalCardProfile } from "@/types/digital-card";

export class DigitalCardService {
    /**
     * Upload a file to Firebase Storage
     * @param file The file to upload
     * @param path The storage path (e.g., 'digital-cards/userId/profile')
     * @returns The download URL of the uploaded file
     */
    static async uploadImage(file: File, path: string): Promise<string> {
        try {
            // Create a unique filename to prevent caching issues
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}.${extension}`;
            const fullPath = `${path}/${filename}`;

            const storageRef = ref(firebaseStorage, fullPath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Upload profile image
     */
    static async uploadProfileImage(file: File, userId: string): Promise<string> {
        return this.uploadImage(file, `digital-cards/${userId}/profile`);
    }

    /**
     * Upload company logo
     */
    static async uploadLogo(file: File, userId: string): Promise<string> {
        return this.uploadImage(file, `digital-cards/${userId}/logo`);
    }

    /**
     * Upload gallery image
     */
    static async uploadGalleryImage(file: File, userId: string): Promise<string> {
        return this.uploadImage(file, `digital-cards/${userId}/gallery`);
    }

    // Firestore Operations

    /**
     * Save or update a digital card profile
     */
    static async saveProfile(userId: string, profile: Partial<DigitalCardProfile>): Promise<void> {
        try {
            const userRef = doc(firestore, 'digital_cards', userId);
            // Remove undefined values to avoid Firestore errors
            const cleanProfile = JSON.parse(JSON.stringify(profile));

            await setDoc(userRef, {
                ...cleanProfile,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    /**
     * Get a digital card profile by User ID (Phone Number)
     */
    static async getProfile(userId: string): Promise<DigitalCardProfile | null> {
        try {
            const userRef = doc(firestore, 'digital_cards', userId);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                return docSnap.data() as DigitalCardProfile;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    /**
     * Get a digital card profile by its unique ID (for public view)
     */
    static async getProfileById(id: string): Promise<DigitalCardProfile | null> {
        try {
            const q = query(collection(firestore, 'digital_cards'), where('id', '==', id));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data() as DigitalCardProfile;
            }
            return null;
        } catch (error) {
            console.error('Error fetching profile by ID:', error);
            throw error;
        }
    }

    /**
     * Publish a profile
     */
    static async publishProfile(userId: string, profile: DigitalCardProfile): Promise<void> {
        try {
            const userRef = doc(firestore, 'digital_cards', userId);
            const cleanProfile = JSON.parse(JSON.stringify(profile));

            await setDoc(userRef, {
                ...cleanProfile,
                isPublished: true,
                publishedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error publishing profile:', error);
            throw error;
        }
    }
}
