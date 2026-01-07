import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { firestore } from "./firestore";

export interface Review {
    id: string;
    cardId: string;
    userId?: string;
    userName: string;
    userImage?: string;
    designation?: string;
    company?: string;
    rating: number;
    content: string;
    createdAt: string;
}

export class ReviewService {
    private static collectionName = 'reviews';

    static async addReview(review: Omit<Review, 'id' | 'createdAt'>) {
        try {
            const docRef = await addDoc(collection(firestore, this.collectionName), {
                ...review,
                createdAt: serverTimestamp()
            });
            return { id: docRef.id, ...review, createdAt: new Date().toISOString() };
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    static async getReviewsByCardId(cardId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(firestore, this.collectionName),
                where('cardId', '==', cardId)
            );

            const querySnapshot = await getDocs(q);
            const reviews = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : new Date().toISOString()
                } as Review;
            });

            return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error('Error getting reviews:', error);
            throw error;
        }
    }
}
