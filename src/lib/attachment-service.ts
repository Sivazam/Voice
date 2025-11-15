// Firestore Configuration - Firebase Integration
// Reimplemented Attachment Module for Robust Document Storage

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

// Enhanced Attachment Interface
export interface AttachmentData {
  caseId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storagePath?: string;
  uploadedAt?: Date;
}

// Reimplemented Attachment Service Class
export class AttachmentService {
  // Create attachment with comprehensive validation and error handling
  static async createAttachment(attachmentData: AttachmentData) {
    try {
      console.log('🔗 Creating attachment:', attachmentData);
      
      // Validate required fields
      if (!attachmentData.caseId || !attachmentData.fileName || !attachmentData.fileUrl) {
        throw new Error('Missing required attachment fields: caseId, fileName, or fileUrl');
      }

      // Validate file type
      if (!attachmentData.fileType) {
        throw new Error('File type is required');
      }

      // Validate file size
      if (!attachmentData.fileSize || attachmentData.fileSize <= 0) {
        throw new Error('File size must be greater than 0');
      }

      // Create attachment document with enhanced metadata
      const docRef = await addDoc(collection(db, 'attachments'), {
        caseId: attachmentData.caseId,
        fileName: attachmentData.fileName,
        fileUrl: attachmentData.fileUrl,
        fileType: attachmentData.fileType,
        fileSize: attachmentData.fileSize,
        storagePath: attachmentData.storagePath || null,
        uploadedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        status: 'active',
        downloadCount: 0
      });

      const result = {
        id: docRef.id,
        ...attachmentData,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      console.log('✅ Attachment created successfully:', {
        id: result.id,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        caseId: result.caseId
      });

      return result;
    } catch (error) {
      console.error('❌ Error creating attachment:', error);
      throw error;
    }
  }

  // Get attachments for a case with enhanced error handling
  static async getCaseAttachments(caseId: string) {
    try {
      console.log('📂 Getting attachments for case:', caseId);
      
      const q = query(
        collection(db, 'attachments'),
        where('caseId', '==', caseId),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      console.log('📊 Found attachments count:', querySnapshot.docs.length);
      
      const attachments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        if (!data) {
          console.warn('⚠️ Empty attachment document found:', doc.id);
          return null;
        }
        
        const result = {
          id: doc.id,
          caseId: data.caseId || '',
          fileName: data.fileName || '',
          fileUrl: data.fileUrl || '',
          fileType: data.fileType || '',
          fileSize: data.fileSize || 0,
          storagePath: data.storagePath || '',
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'active',
          downloadCount: data.downloadCount || 0
        };
        
        console.log('📎 Processed attachment:', result);
        return result;
      }).filter(att => att !== null); // Filter out null results

      console.log('✅ Retrieved attachments:', attachments.length, 'valid attachments');
      return attachments;
    } catch (error) {
      console.error('❌ Error getting case attachments:', error);
      throw error;
    }
  }

  // Update attachment (for download tracking, status changes, etc.)
  static async updateAttachment(attachmentId: string, updateData: Partial<AttachmentData>) {
    try {
      const docRef = doc(db, 'attachments', attachmentId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Attachment updated:', attachmentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating attachment:', error);
      throw error;
    }
  }

  // Delete attachment with cleanup
  static async deleteAttachment(attachmentId: string) {
    try {
      const docRef = doc(db, 'attachments', attachmentId);
      await deleteDoc(docRef);
      
      console.log('✅ Attachment deleted:', attachmentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting attachment:', error);
      throw error;
    }
  }

  // Get attachment by ID
  static async getAttachment(attachmentId: string) {
    try {
      const docRef = doc(db, 'attachments', attachmentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('⚠️ Attachment not found:', attachmentId);
        return null;
      }

      const data = docSnap.data();
      const result = {
        id: docSnap.id,
        caseId: data.caseId || '',
        fileName: data.fileName || '',
        fileUrl: data.fileUrl || '',
        fileType: data.fileType || '',
        fileSize: data.fileSize || 0,
        storagePath: data.storagePath || '',
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || 'active',
        downloadCount: data.downloadCount || 0
      };

      console.log('✅ Retrieved attachment:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting attachment:', error);
      throw error;
    }
  }

  // Get attachment statistics
  static async getAttachmentStats(caseId: string) {
    try {
      const attachments = await this.getCaseAttachments(caseId);
      
      const stats = {
        totalAttachments: attachments.length,
        totalSize: attachments.reduce((sum, att) => sum + (att?.fileSize || 0), 0),
        fileTypes: [...new Set(attachments.map(att => att?.fileType).filter(Boolean))],
        averageSize: attachments.length > 0 ? Math.round(attachments.reduce((sum, att) => sum + (att?.fileSize || 0), 0) / attachments.length) : 0
      };

      console.log('📊 Attachment stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting attachment stats:', error);
      throw error;
    }
  }

  // Search attachments
  static async searchAttachments(searchQuery: {
    caseId?: string,
    fileType?: string,
    fileName?: string,
    limit?: number
  }) {
    try {
      let constraints: any[] = [];
      
      if (searchQuery.caseId) {
        constraints.push(where('caseId', '==', searchQuery.caseId));
      }
      
      if (searchQuery.fileType) {
        constraints.push(where('fileType', '==', searchQuery.fileType));
      }
      
      if (searchQuery.fileName) {
        constraints.push(where('fileName', '>=', searchQuery.fileName));
      }

      let q = query(collection(db, 'attachments'), ...constraints);
      
      if (searchQuery.limit) {
        q = query(q, limit(searchQuery.limit));
      }
      
      q = query(q, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      });

      console.log('🔍 Search results:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Error searching attachments:', error);
      throw error;
    }
  }
}

// Enhanced File Upload Service
export class FileUploadService {
  // Enhanced file upload with better organization and metadata
  static async uploadFile(file: File, caseId: string, fileType?: string) {
    try {
      console.log('📤 Starting file upload:', {
        fileName: file.name,
        size: file.size,
        type: file.type,
        caseId: caseId
      });

      // Create organized folder structure
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = Date.now();
      
      // Enhanced file type detection
      let fileTypeFolder = this.getFileTypeFolder(file.type, fileType);
      
      // Structure: cases/year/month/day/caseId/fileTypeFolder/timestamp_filename
      const storageRef = ref(storage, `cases/${year}/${month}/${day}/${caseId}/${fileTypeFolder}/${timestamp}_${file.name}`);
      
      console.log('📁 Storage path:', storageRef.fullPath);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedFrom: 'case-submission-form',
          caseId: caseId,
          uploadTimestamp: new Date().toISOString()
        }
      };

      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const result = {
        fileName: file.name,
        fileUrl: downloadURL,
        fileType: file.type,
        fileSize: file.size,
        storagePath: storageRef.fullPath,
        uploadedAt: new Date().toISOString(),
        caseId: caseId,
        timestamp: timestamp
      };

      console.log('✅ File uploaded successfully:', {
        fileName: result.fileName,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
        storagePath: result.storagePath
      });

      return result;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }

  // Enhanced file type detection
  private static getFileTypeFolder(mimeType: string, explicitType?: string): string {
    if (explicitType) {
      return explicitType;
    }
    
    if (mimeType.startsWith('image/')) {
      return 'images';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType === 'application/pdf') {
      return 'pdfs';
    } else if (mimeType.includes('document') || mimeType.includes('text')) {
      return 'documents';
    } else if (mimeType.includes('video')) {
      return 'videos';
    } else {
      return 'documents';
    }
  }

  // Batch upload multiple files
  static async uploadMultipleFiles(files: File[], caseId: string, onProgress?: (progress: number) => void) {
    try {
      console.log('📤 Starting batch upload:', files.length, 'files');
      
      const results: any[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const result = await this.uploadFile(file, caseId);
          results.push(result);
          
          // Update progress
          const progress = Math.round(((i + 1) / totalFiles) * 100);
          onProgress?.(progress);
          
          console.log(`📊 Upload progress: ${progress}% (${i + 1}/${totalFiles})`);
          
        } catch (error) {
          console.error(`❌ Failed to upload ${file.name}:`, error);
          // Continue with other files instead of failing
        }
      }
      
      console.log(`✅ Batch upload completed: ${results.length}/${totalFiles} successful`);
      return results;
    } catch (error) {
      console.error('❌ Error in batch upload:', error);
      throw error;
    }
  }
}

