import { AppDataSource } from '@/lib/database';
import { AuditLog, AuditAction, AuditSeverity } from '@/lib/entities/AuditLog';
import { In } from 'typeorm';
import { filterContent, sanitizeContent, ContentCategory } from '@/lib/utils/content-filter';

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterEmail: string;
  reportedBy?: string;
  reportedContentId: string;
  reportedContentType: 'chat_message' | 'appointment' | 'user_profile' | 'review';
  category: 'inappropriate_content' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'other';
  description: string;
  evidence?: {
    imageUrl?: string;
    message?: string;
    contentSnippet?: string;
  };
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  resolution?: string;
  createdAt: Date;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  reportedContentId: string;
  reportedContentType: string;
  action: 'delete' | 'hide' | 'suspend' | 'warn' | 'none';
  reason: string;
  createdAt: Date;
}

export interface ReviewDashboard {
  pendingReports: number;
  actionRequired: number;
  resolvedReports: number;
  categoryBreakdown: {
    inappropriate_content: number;
    hate_speech: number;
    harassment: number;
    spam: number;
    misinformation: number;
  };
  recentReports: ContentReport[];
  topReportedContent: Array<{
    id: string;
    type: string;
    count: number;
    recentReports: ContentReport[];
  }>;
}

export class ModerationService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);
  private reportsRepository = AppDataSource.getRepository('content_reports');

  async createReport(data: {
    reporterId: string;
    reporterEmail: string;
    reportedContentId: string;
    reportedContentType: 'chat_message' | 'appointment' | 'user_profile' | 'review';
    category: 'inappropriate_content' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'other';
    description: string;
    evidence?: {
      imageUrl?: string;
      message?: string;
      contentSnippet?: string;
    };
  }): Promise<ContentReport> {
    const report = {
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };

    await this.auditLogRepository.save({
      action: AuditAction.CONTENT_REPORTED,
      description: `Content report created for ${data.reportedContentType} by ${data.reporterEmail}`,
      severity: AuditSeverity.INFO,
      userId: data.reporterId,
    });

    return report as ContentReport;
  }

  async getReportsByStatus(status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', limit = 50): Promise<ContentReport[]> {
    const reports = await this.reportsRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return reports as unknown as ContentReport[];
  }

  async getReportById(id: string): Promise<ContentReport | null> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    return report as unknown as ContentReport | null;
  }

  async getPendingReports(): Promise<ContentReport[]> {
    const reports = await this.reportsRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
    });
    return reports as unknown as ContentReport[];
  }

  async resolveReport(
    reportId: string,
    moderatorId: string,
    resolution: string,
    action: 'delete' | 'hide' | 'suspend' | 'warn' | 'none',
    _reason: string
  ): Promise<ContentReport> {
    const report = await this.reportsRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = 'resolved';
    report.resolvedBy = moderatorId;
    report.resolution = resolution;
    report.reviewedAt = new Date();

    await this.auditLogRepository.save({
      action: AuditAction.REPORT_RESOLVED,
      description: `Report ${reportId} resolved with action: ${action}`,
      severity: AuditSeverity.INFO,
      userId: moderatorId,
      resourceId: reportId,
    });

    return report as ContentReport;
  }

  async dismissReport(
    reportId: string,
    moderatorId: string,
    reason: string
  ): Promise<ContentReport> {
    const report = await this.reportsRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = 'dismissed';
    report.reviewedAt = new Date();

    await this.auditLogRepository.save({
      action: AuditAction.REPORT_DISMISSED,
      description: `Report ${reportId} dismissed: ${reason}`,
      severity: AuditSeverity.INFO,
      userId: moderatorId,
      resourceId: reportId,
    });

    return report as ContentReport;
  }

  async getDashboardStats(): Promise<ReviewDashboard> {
    const [
      pendingReports,
      actionRequired,
      resolvedReports,
    ] = await Promise.all([
      this.reportsRepository.count({ where: { status: 'pending' } }),
      this.reportsRepository.count({ where: { status: 'reviewed' } }),
      this.reportsRepository.count({ where: { status: 'resolved' } }),
    ]);

    const categoryBreakdown = {
      inappropriate_content: await this.reportsRepository.count({
        where: { category: 'inappropriate_content', status: 'pending' },
      }),
      hate_speech: await this.reportsRepository.count({
        where: { category: 'hate_speech', status: 'pending' },
      }),
      harassment: await this.reportsRepository.count({
        where: { category: 'harassment', status: 'pending' },
      }),
      spam: await this.reportsRepository.count({
        where: { category: 'spam', status: 'pending' },
      }),
      misinformation: await this.reportsRepository.count({
        where: { category: 'misinformation', status: 'pending' },
      }),
    };

    const recentReports = await this.reportsRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
      take: 10,
    }) as unknown as ContentReport[];

    return {
      pendingReports,
      actionRequired,
      resolvedReports,
      categoryBreakdown,
      recentReports,
      topReportedContent: await this.getTopReportedContent(),
    };
  }

  private async getTopReportedContent() {
    const topReports = await this.reportsRepository.find({
      where: { status: 'pending' },
      order: { createdAt: 'DESC' },
      take: 50,
    }) as unknown as ContentReport[];

    const contentMap = new Map<string, Array<{ report: ContentReport; category: string }>>();

    topReports.forEach(report => {
      const key = `${report.reportedContentType}_${report.reportedContentId}`;
      if (!contentMap.has(key)) {
        contentMap.set(key, []);
      }
      contentMap.get(key)!.push({
        report,
        category: report.category,
      });
    });

    return Array.from(contentMap.entries())
      .map(([key, items]) => ({
        id: key.split('_')[1],
        type: key.split('_')[0],
        count: items.length,
        recentReports: items.slice(0, 3).map(item => item.report),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  async getModerationActions(limit = 50) {
    return await this.auditLogRepository.find({
      where: {
        action: In([
          AuditAction.CONTENT_REPORTED,
          AuditAction.REPORT_RESOLVED,
          AuditAction.REPORT_DISMISSED,
        ]),
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async searchReports(query: string) {
    return await this.reportsRepository
      .createQueryBuilder('report')
      .where('report.description LIKE :query', { query: `%${query}%` })
      .orWhere('report.reportedContentId LIKE :query', { query: `%${query}%` })
      .orWhere('report.reporterEmail LIKE :query', { query: `%${query}%` })
      .orderBy('report.createdAt', 'DESC')
      .take(20)
      .getMany();
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.reportsRepository.delete({ id: reportId });
    await this.auditLogRepository.save({
      action: AuditAction.REPORT_DELETED,
      description: `Report ${reportId} deleted by admin`,
      severity: AuditSeverity.INFO,
    });
  }

  async banUser(userId: string, reason: string, durationDays = 30) {
    await this.auditLogRepository.save({
      action: AuditAction.USER_BANNED,
      description: `User ${userId} banned for ${durationDays} days: ${reason}`,
      severity: AuditSeverity.CRITICAL,
    });

    return { success: true, durationDays };
  }

  async getUserModerationHistory(userId: string) {
    return await this.auditLogRepository.find({
      where: {
        userId,
        action: In([
          AuditAction.CONTENT_REPORTED,
          AuditAction.USER_BANNED,
          AuditAction.REPORT_RESOLVED,
          AuditAction.REPORT_DISMISSED,
        ]),
      },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async filterChatMessage(content: string): Promise<{ allowed: boolean; sanitized: string; category?: ContentCategory }> {
    const sanitized = sanitizeContent(content);
    const result = filterContent(content);

    return {
      allowed: result.allowed,
      sanitized,
      category: result.category,
    };
  }

  async checkAndReportContent(
    content: string,
    reporterId: string,
    reporterEmail: string,
    contentId: string,
    contentType: 'chat_message' | 'appointment' | 'user_profile' | 'review'
  ): Promise<{ filtered: boolean; report?: ContentReport }> {
    const filterResult = filterContent(content);

    if (!filterResult.allowed && filterResult.category) {
      const report = await this.createReport({
        reporterId,
        reporterEmail,
        reportedContentId: contentId,
        reportedContentType: contentType,
        category: this.mapCategoryToReportCategory(filterResult.category),
        description: `Auto-filtered content: ${filterResult.reason}`,
      });

      return { filtered: true, report };
    }

    return { filtered: false };
  }

  private mapCategoryToReportCategory(category: ContentCategory): 'inappropriate_content' | 'hate_speech' | 'harassment' | 'spam' | 'misinformation' | 'other' {
    switch (category) {
      case 'spam':
        return 'spam';
      case 'harassment':
        return 'harassment';
      case 'hate':
        return 'hate_speech';
      case 'violence':
        return 'misinformation';
      default:
        return 'inappropriate_content';
    }
  }
}

export const moderationService = new ModerationService();
