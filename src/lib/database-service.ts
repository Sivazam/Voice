// Database Service - Abstract layer that can switch between Prisma and Firestore
// Currently using Prisma, but can be easily switched to Firestore

import { db } from './db';
import { FirestoreService } from './firestore';

// Configuration flag - switch to 'firestore' for Firebase
const DATABASE_PROVIDER = 'firestore'; // 'prisma' | 'firestore'

export class DatabaseService {
  // User operations
  static async createUser(userData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.createUser(userData);
    } else {
      return await db.user.create({ data: userData });
    }
  }

  static async getUser(userId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getUser(userId);
    } else {
      return await db.user.findUnique({ where: { id: userId } });
    }
  }

  static async getUserByPhoneNumber(phoneNumber: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      // TODO: Implement in FirestoreService
      return null;
    } else {
      return await db.user.findUnique({ where: { phoneNumber } });
    }
  }

  static async updateUser(userId: string, userData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.updateUser(userId, userData);
    } else {
      return await db.user.update({ where: { id: userId }, data: userData });
    }
  }

  // Case operations
  static async createCase(caseData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.createCase(caseData);
    } else {
      return await db.case.create({ 
        data: caseData,
        include: {
          user: true,
          issueCategories: true,
          attachments: true
        }
      });
    }
  }

  static async getCase(caseId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getCase(caseId);
    } else {
      return await db.case.findUnique({ 
        where: { id: caseId },
        include: {
          user: true,
          issueCategories: true,
          attachments: true
        }
      });
    }
  }

  static async getUserCases(userId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getUserCases(userId);
    } else {
      return await db.case.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              fullName: true
            }
          },
          issueCategories: true,
          attachments: true,
          _count: {
            select: { attachments: true }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      });
    }
  }

  static async getAllCases(status?: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getAllCases(status);
    } else {
      let whereClause: any = {};
      if (status) {
        whereClause.status = status;
      }

      return await db.case.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              fullName: true,
              phoneNumber: true
            }
          },
          issueCategories: true,
          attachments: true,
          _count: {
            select: { attachments: true }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      });
    }
  }

  static async updateCase(caseId: string, caseData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.updateCase(caseId, caseData);
    } else {
      return await db.case.update({
        where: { id: caseId },
        data: caseData,
        include: {
          user: {
            select: {
              fullName: true,
              phoneNumber: true
            }
          },
          issueCategories: true,
          attachments: true
        }
      });
    }
  }

  // Issue Category operations
  static async createIssueCategory(categoryData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      // TODO: Implement in FirestoreService
      return null;
    } else {
      return await db.caseIssueCategory.create({ data: categoryData });
    }
  }

  static async createIssueCategories(categories: any[]) {
    if (DATABASE_PROVIDER === 'firestore') {
      // TODO: Implement batch operation in FirestoreService
      return [];
    } else {
      return await Promise.all(
        categories.map(category => 
          db.caseIssueCategory.create({ data: category })
        )
      );
    }
  }

  // Attachment operations
  static async createAttachment(attachmentData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.createAttachment(attachmentData);
    } else {
      return await db.attachment.create({ data: attachmentData });
    }
  }

  static async getCaseAttachments(caseId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getCaseAttachments(caseId);
    } else {
      return await db.attachment.findMany({
        where: { caseId },
        orderBy: { uploadedAt: 'desc' }
      });
    }
  }

  // Notification operations
  static async createNotification(notificationData: any) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.createNotification(notificationData);
    } else {
      return await db.notification.create({ data: notificationData });
    }
  }

  static async getUserNotifications(userId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.getUserNotifications(userId);
    } else {
      return await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    }
  }

  static async markNotificationRead(notificationId: string) {
    if (DATABASE_PROVIDER === 'firestore') {
      return await FirestoreService.markNotificationRead(notificationId);
    } else {
      return await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      });
    }
  }
}

// Export the current provider for reference
export { DATABASE_PROVIDER };