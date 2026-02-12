import { AppDataSource } from '@/lib/database';
import { AuditLog, AuditAction, AuditSeverity } from '@/lib/entities/AuditLog';
import { User } from '@/lib/entities/User';
import { NextRequest } from 'next/server';

export { AuditLog, AuditAction, AuditSeverity } from '@/lib/entities/AuditLog';

export const AUDIT_ACTIONS = {
  CONTENT_REPORTED: 'content_reported',
  REPORT_RESOLVED: 'report_resolved',
  REPORT_DISMISSED: 'report_dismissed',
  REPORT_DELETED: 'report_deleted',
  USER_BANNED: 'user_banned',
  PERFORMANCE_ALERT_CREATED: 'performance_alert_created',
  PERFORMANCE_ALERT_ACKNOWLEDGED: 'performance_alert_acknowledged',
  PERFORMANCE_ALERT_RESOLVED: 'performance_alert_resolved',
};

export interface AuditLogData {
  user?: User;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
  description?: string;
}

export class AuditService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = new AuditLog();
    auditLog.userId = data.user?.id || data.userId;
    auditLog.userEmail = data.user?.email || data.userEmail;
    auditLog.action = data.action;
    auditLog.resourceType = data.resourceType;
    auditLog.resourceId = data.resourceId;
    auditLog.oldValues = data.oldValues;
    auditLog.newValues = data.newValues;
    auditLog.ipAddress = data.ipAddress;
    auditLog.userAgent = data.userAgent;
    auditLog.severity = data.severity || AuditSeverity.INFO;
    auditLog.description = data.description;
    auditLog.isSystemGenerated = false;

    return await this.auditLogRepository.save(auditLog);
  }

  async logFromRequest(
    request: NextRequest,
    data: Omit<AuditLogData, 'ipAddress' | 'userAgent'>
  ): Promise<AuditLog> {
    return await this.log({
      ...data,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
  }

  async logUserAction(
    user: User,
    action: AuditAction,
    details?: {
      resourceType?: string;
      resourceId?: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
      description?: string;
      severity?: AuditSeverity;
    }
  ): Promise<AuditLog> {
    return await this.log({
      user,
      action,
      resourceType: details?.resourceType,
      resourceId: details?.resourceId,
      oldValues: details?.oldValues,
      newValues: details?.newValues,
      description: details?.description,
      severity: details?.severity,
    });
  }

  async logAuthSuccess(user: User, request: NextRequest): Promise<AuditLog> {
    return await this.logFromRequest(request, {
      user,
      action: AuditAction.LOGIN,
      resourceType: 'session',
      description: `User ${user.email} logged in successfully`,
    });
  }

  async logAuthFailure(
    email: string,
    request: NextRequest,
    reason?: string
  ): Promise<AuditLog> {
    return await this.log({
      userEmail: email,
      action: AuditAction.LOGIN_FAILED,
      resourceType: 'session',
      severity: AuditSeverity.WARNING,
      description: `Failed login attempt for ${email}${reason ? `: ${reason}` : ''}`,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });
  }

  async logDataChange(
    user: User,
    action: AuditAction,
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
  ): Promise<AuditLog> {
    const changes: string[] = [];
    if (oldValues && newValues) {
      for (const key of Object.keys(newValues)) {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes.push(`${key}: ${JSON.stringify(oldValues[key])} -> ${JSON.stringify(newValues[key])}`);
        }
      }
    }

    return await this.log({
      user,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      description: `${user.email} ${action.replace(/_/g, ' ')} ${resourceType} ${resourceId}${changes.length > 0 ? `: ${changes.join(', ')}` : ''}`,
    });
  }

  async getLogsByUser(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { logs, total };
  }

  async getLogsByAction(
    action: AuditAction,
    limit = 100,
    offset = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { logs, total };
  }

  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 100,
    offset = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditLogRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('audit_log.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();
    return { logs, total };
  }

  async getRecentActivity(limit = 50): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getSecurityEvents(
    startDate?: Date
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.severity IN (:...severities)', {
        severities: [AuditSeverity.WARNING, AuditSeverity.ERROR, AuditSeverity.CRITICAL],
      });

    if (startDate) {
      query.andWhere('audit_log.createdAt >= :startDate', { startDate });
    }

    return await query.orderBy('audit_log.createdAt', 'DESC').getMany();
  }

  async cleanupOldLogs(retentionDays = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}

export const auditService = new AuditService();
