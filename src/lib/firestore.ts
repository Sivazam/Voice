// Firestore Configuration - Firebase Integration
// Fixed variable naming conflicts in map functions
import { 
  initializeApp, 
  getApps, 
  getApp 
} from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBYshJZ_pDasqGMU05ZSDz-1xVWzgTsWw",
  authDomain: "voice-62ddc.firebaseapp.com",
  projectId: "voice-62ddc",
  storageBucket: "voice-62ddc.firebasestorage.app",
  messagingSenderId: "724997803907",
  appId: "1:724997803907:web:4680b7412d4e4d67b8f0b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper function to get Firestore instance
export const getFirestoreInstance = () => db;

// Helper function to get Storage instance
export const getStorageInstance = () => storage;

// Firestore Service
export class FirestoreService {
  // User operations
  static async createUser(userData: any) {
    try {
      // Use mobile number as document ID
      const phoneNumber = userData.phoneNumber;
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      const userRef = doc(db, 'users', phoneNumber);
      await setDoc(userRef, {
        ...userData,
        phoneNumber: phoneNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: phoneNumber, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const users = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          
          // Get case count for each user
          const casesQuery = query(
            collection(db, 'cases'),
            where('userId', '==', doc.id)
          );
          const casesSnapshot = await getDocs(casesQuery);

          return {
            id: doc.id,
            ...userData,
            totalCasesFiled: casesSnapshot.size
          };
        })
      );

      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  static async getUser(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  static async getUserByPhoneNumber(phoneNumber: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', phoneNumber));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, userData: any) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Case operations
  static async createCase(caseData: any) {
    try {
      const docRef = await addDoc(collection(db, 'cases'), {
        ...caseData,
        submittedAt: serverTimestamp(),
        status: 'PENDING',
        viewCount: 0,
        isPublic: false
      });
      return { id: docRef.id, ...caseData };
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  }

  static async getCase(caseId: string) {
    try {
      const caseDoc = await getDoc(doc(db, 'cases', caseId));
      if (!caseDoc.exists()) {
        return null;
      }

      const caseData = caseDoc.data();
      
      // Get related data
      const userDoc = await getDoc(doc(db, 'users', caseData.userId));
      const categoriesQuery = query(
        collection(db, 'caseIssueCategories'),
        where('caseId', '==', caseId)
      );
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const attachmentsQuery = query(
        collection(db, 'attachments'),
        where('caseId', '==', caseId)
      );
      const attachmentsSnapshot = await getDocs(attachmentsQuery);

      return {
        id: caseDoc.id,
        ...caseData,
        user: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null,
        issueCategories: categoriesSnapshot.docs.map(catDoc => ({ id: catDoc.id, ...catDoc.data() })),
        attachments: attachmentsSnapshot.docs.map(attDoc => ({ id: attDoc.id, ...attDoc.data() }))
      };
    } catch (error) {
      console.error('Error getting case:', error);
      throw error;
    }
  }

  static async getUserCases(userId: string) {
    try {
      console.log('📥 Getting user cases for userId:', userId);
      // Simple query by userId only, then sort client-side
      const q = query(
        collection(db, 'cases'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      console.log('📥 Query snapshot docs count:', querySnapshot.docs.length);
      
      const cases = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const caseData = docSnapshot.data();
          
          // Get related data for each case
          const categoriesQuery = query(
            collection(db, 'caseIssueCategories'),
            where('caseId', '==', docSnapshot.id)
          );
          const categoriesSnapshot = await getDocs(categoriesQuery);
          const attachmentsQuery = query(
            collection(db, 'attachments'),
            where('caseId', '==', docSnapshot.id)
          );
          const attachmentsSnapshot = await getDocs(attachmentsQuery);

          return {
            id: docSnapshot.id,
            ...caseData,
            issueCategories: categoriesSnapshot.docs.map(cat => ({ id: cat.id, ...cat.data() })),
            attachments: attachmentsSnapshot.docs.map(att => ({ id: att.id, ...att.data() })),
            _count: {
              attachments: attachmentsSnapshot.size
            }
          };
        })
      );

      return cases;
    } catch (error) {
      console.error('🔥 Error getting user cases:', error);
      console.error('Error details:', {
        message: (error as Error).message || 'Unknown error',
        stack: (error as Error).stack || 'No stack available',
        code: (error as any).code || 'Unknown code'
      });
      throw error;
    }
  }

  static async getAllCases(status?: string) {
    try {
      let q = query(collection(db, 'cases'), orderBy('submittedAt', 'desc'));
      if (status) {
        q = query(q, where('status', '==', status));
      }
      const querySnapshot = await getDocs(q);
      
      const cases = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const caseData = docSnapshot.data();
          
          // Get related data
          const userDoc = await getDoc(doc(db, 'users', caseData.userId));
          const categoriesQuery = query(
            collection(db, 'caseIssueCategories'),
            where('caseId', '==', docSnapshot.id)
          );
          const categoriesSnapshot = await getDocs(categoriesQuery);
          const attachmentsQuery = query(
            collection(db, 'attachments'),
            where('caseId', '==', docSnapshot.id)
          );
          const attachmentsSnapshot = await getDocs(attachmentsQuery);

          return {
            id: docSnapshot.id,
            ...caseData,
            user: userDoc.exists() ? { 
              id: userDoc.id, 
              fullName: userDoc.data().fullName,
              phoneNumber: userDoc.data().phoneNumber 
            } : null,
            issueCategories: categoriesSnapshot.docs.map(cat => ({ id: cat.id, ...cat.data() })),
            attachments: attachmentsSnapshot.docs.map(att => ({ id: att.id, ...att.data() })),
            _count: {
              attachments: attachmentsSnapshot.size
            }
          };
        })
      );

      return cases;
    } catch (error) {
      console.error('Error getting all cases:', error);
      throw error;
    }
  }

  static async updateCase(caseId: string, caseData: any) {
    try {
      await updateDoc(doc(db, 'cases', caseId), {
        ...caseData,
        updatedAt: serverTimestamp()
      });
      
      // Return updated case with related data
      return await this.getCase(caseId);
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }

  // Issue Category operations
  static async createIssueCategory(categoryData: any) {
    try {
      const docRef = await addDoc(collection(db, 'caseIssueCategories'), categoryData);
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('Error creating issue category:', error);
      throw error;
    }
  }

  static async createIssueCategories(categories: any[]) {
    try {
      const results = await Promise.all(
        categories.map(category => this.createIssueCategory(category))
      );
      return results;
    } catch (error) {
      console.error('Error creating issue categories:', error);
      throw error;
    }
  }

  // Attachment operations
  static async createAttachment(attachmentData: any) {
    try {
      const docRef = await addDoc(collection(db, 'attachments'), {
        ...attachmentData,
        uploadedAt: serverTimestamp()
      });
      return { id: docRef.id, ...attachmentData };
    } catch (error) {
      console.error('Error creating attachment:', error);
      throw error;
    }
  }

  static async getCaseAttachments(caseId: string) {
    try {
      const q = query(
        collection(db, 'attachments'),
        where('caseId', '==', caseId),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting case attachments:', error);
      throw error;
    }
  }

  // File upload to Firebase Storage
  static async uploadFile(file: File, caseId: string) {
    try {
      // Create a better organized folder structure
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      
      // Determine file type folder
      let fileTypeFolder = 'documents';
      if (file.type.startsWith('image/')) {
        fileTypeFolder = 'images';
      } else if (file.type.startsWith('audio/')) {
        fileTypeFolder = 'audio';
      } else if (file.type === 'application/pdf') {
        fileTypeFolder = 'pdfs';
      }
      
      // Structure: cases/year/month/day/caseId/fileTypeFolder/timestamp_filename
      const storageRef = ref(storage, `cases/${year}/${month}/${day}/${caseId}/${fileTypeFolder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        fileName: file.name,
        fileUrl: downloadURL,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        storagePath: storageRef.fullPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Utility function to move files from temp case ID to real case ID
  static async moveFilesFromTempCase(tempCaseId: string, realCaseId: string) {
    try {
      // This would require Firebase Storage admin SDK to move/copy files
      // For now, files will stay in temp folders but be associated with real case ID in Firestore
      console.log(`Files from temp case ${tempCaseId} are now associated with case ${realCaseId}`);
      return { success: true };
    } catch (error) {
      console.error('Error moving files from temp case:', error);
      throw error;
    }
  }

  // Get storage statistics for monitoring
  static async getStorageStats() {
    try {
      // This would require Firebase Storage admin SDK
      // For now, return placeholder data
      return {
        totalFiles: 0,
        totalSize: 0,
        caseFolders: 0
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Notification operations
  static async createNotification(notificationData: any) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp(),
        isRead: false
      });
      return { id: docRef.id, ...notificationData };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  static async markNotificationRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        isRead: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Hospital operations
  static async createHospital(hospitalData: any) {
    try {
      const docRef = await addDoc(collection(db, 'hospitals'), {
        ...hospitalData,
        addedAt: serverTimestamp()
      });
      return { id: docRef.id, ...hospitalData };
    } catch (error) {
      console.error('Error creating hospital:', error);
      throw error;
    }
  }

  static async getAllHospitals() {
    try {
      const q = query(collection(db, 'hospitals'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting hospitals:', error);
      throw error;
    }
  }
}

// Export Firebase app instance
export { app as firebaseApp };
export { db as firestore };
export { storage as firebaseStorage };