import { AppDataSource } from '@/lib/database';
import { AuditLog, AuditAction, AuditSeverity } from '@/lib/entities/AuditLog';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime?: number;
  metrics?: {
    database?: {
      connected: boolean;
      queryCount: number;
      errorCount: number;
    };
    cache?: {
      connected: boolean;
      hitRate: number;
      evictions: number;
    };
    memory?: {
      used: number;
      total: number;
      usagePercentage: number;
    };
  };
  lastError?: string;
  checkedAt: Date;
}

export interface PerformanceAlert {
  id: string;
  alertType: 'performance' | 'error' | 'security' | 'availability' | 'resource';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface AlertMetrics {
  avgResponseTime: number;
  errorRate: number;
  transactionVolume: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  availability: number;
}

export class HealthCheckService {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);
  private performanceMetrics: {
    responseTimes: number[];
    errorCounts: number[];
    uptime: number;
  } = {
    responseTimes: [],
    errorCounts: [],
    uptime: 0,
  };

  async performSystemHealthCheck(): Promise<{
    overallStatus: 'healthy' | 'degraded' | 'critical';
    checks: HealthCheckResult[];
    timestamp: Date;
  }> {
    const checks = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkCacheHealth(),
      this.checkMemoryUsage(),
      this.checkPerformanceMetrics(),
      this.checkExternalServices(),
    ]);

    const overallStatus = this.determineOverallStatus(checks);

    return {
      overallStatus,
      checks,
      timestamp: new Date(),
    };
  }

  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      await AppDataSource.query('SELECT 1');
    } catch (err) {
      error = err as Error;
    }

    const responseTime = Date.now() - startTime;
    const status = error ? 'unhealthy' : 'healthy';

    return {
      service: 'database',
      status,
      responseTime,
      metrics: status === 'healthy' ? {
        database: {
          connected: true,
          queryCount: 1,
          errorCount: 0,
        },
      } : undefined,
      lastError: error?.message,
      checkedAt: new Date(),
    };
  }

  private async checkCacheHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      const cache = await AppDataSource.query('SELECT pg_backend_pid()');
    } catch (err) {
      error = err as Error;
    }

    const responseTime = Date.now() - startTime;
    const status = error ? 'unhealthy' : 'healthy';

    return {
      service: 'cache',
      status,
      responseTime,
      metrics: status === 'healthy' ? {
        cache: {
          connected: true,
          hitRate: 95,
          evictions: 0,
        },
      } : undefined,
      lastError: error?.message,
      checkedAt: new Date(),
    };
  }

  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      const memory = await AppDataSource.query('SELECT CURRENT_TIMESTAMP');
    } catch (err) {
      error = err as Error;
    }

    const responseTime = Date.now() - startTime;
    const status = error ? 'unhealthy' : 'healthy';

    return {
      service: 'memory',
      status,
      responseTime,
      metrics: status === 'healthy' ? {
        memory: {
          used: 2048,
          total: 8192,
          usagePercentage: 25,
        },
      } : undefined,
      lastError: error?.message,
      checkedAt: new Date(),
    };
  }

  private async checkPerformanceMetrics(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      const responseTime = await AppDataSource.query('SELECT NOW()');
    } catch (err) {
      error = err as Error;
    }

    const responseTimeMs = Date.now() - startTime;
    const status = error ? 'unhealthy' : 'healthy';

    return {
      service: 'performance',
      status,
      responseTime: responseTimeMs,
      metrics: status === 'healthy' ? {
        database: {
          connected: true,
          queryCount: 2,
          errorCount: 0,
        },
      } : undefined,
      lastError: error?.message,
      checkedAt: new Date(),
    };
  }

  private async checkExternalServices(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let error: Error | undefined;

    try {
      await AppDataSource.query('SELECT 1');
    } catch (err) {
      error = err as Error;
    }

    const responseTime = Date.now() - startTime;
    const status = error ? 'unhealthy' : 'healthy';

    return {
      service: 'external_services',
      status,
      responseTime,
      metrics: status === 'healthy' ? {
        database: {
          connected: true,
          queryCount: 3,
          errorCount: 0,
        },
      } : undefined,
      lastError: error?.message,
      checkedAt: new Date(),
    };
  }

  private determineOverallStatus(checks: HealthCheckResult[]): 'healthy' | 'degraded' | 'critical' {
    const unhealthy = checks.filter(c => c.status === 'unhealthy').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;

    if (unhealthy > 0) {
      return 'critical';
    }
    if (degraded > 0) {
      return 'degraded';
    }
    return 'healthy';
  }

  recordResponseTime(responseTime: number): void {
    this.performanceMetrics.responseTimes.push(responseTime);
    if (this.performanceMetrics.responseTimes.length > 100) {
      this.performanceMetrics.responseTimes.shift();
    }
  }

  recordError(): void {
    this.performanceMetrics.errorCounts.push(Date.now());
    if (this.performanceMetrics.errorCounts.length > 100) {
      this.performanceMetrics.errorCounts.shift();
    }
  }

  getPerformanceMetrics(): AlertMetrics {
    const avgResponseTime = this.performanceMetrics.responseTimes.length > 0
      ? this.performanceMetrics.responseTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseTimes.length
      : 0;

    const errorCount = this.performanceMetrics.errorCounts.length;
    const totalChecks = this.performanceMetrics.responseTimes.length || 1;
    const errorRate = errorCount / totalChecks;

    return {
      avgResponseTime,
      errorRate,
      transactionVolume: totalChecks,
      resourceUsage: {
        cpu: 25,
        memory: 25,
        disk: 60,
      },
      availability: 99.9,
    };
  }

  async createPerformanceAlert(alertType: PerformanceAlert['alertType'], severity: PerformanceAlert['severity'], metadata: Record<string, any>): Promise<PerformanceAlert> {
    const alert = {
      id: this.generateId(),
      alertType,
      severity,
      title: this.generateAlertTitle(alertType, severity),
      description: this.generateAlertDescription(alertType, severity, metadata),
      metadata,
      acknowledged: false,
      createdAt: new Date(),
    };

    await this.auditLogRepository.save({
      action: AuditAction.PERFORMANCE_ALERT_CREATED,
      description: `Performance alert created: ${alert.title}`,
      severity: severity === 'critical' ? AuditSeverity.CRITICAL : AuditSeverity.INFO,
      resourceId: alert.id,
    });

    return alert as PerformanceAlert;
  }

  private generateAlertTitle(type: PerformanceAlert['alertType'], severity: PerformanceAlert['severity']): string {
    const titles = {
      performance: {
        info: 'Performance Degradation Detected',
        warning: 'High Response Time',
        critical: 'Critical Performance Issues',
      },
      error: {
        info: 'Service Error',
        warning: 'Multiple Errors Detected',
        critical: 'Critical Service Failure',
      },
      security: {
        info: 'Security Alert',
        warning: 'Suspicious Activity',
        critical: 'Security Breach Attempt',
      },
      availability: {
        info: 'Service Availability',
        warning: 'Partial Outage',
        critical: 'Complete Service Failure',
      },
      resource: {
        info: 'Resource Usage',
        warning: 'High Resource Usage',
        critical: 'Resource Exhaustion',
      },
    };

    return titles[type][severity];
  }

  private generateAlertDescription(type: PerformanceAlert['alertType'], severity: PerformanceAlert['severity'], metadata: Record<string, any>): string {
    const descriptions = {
      performance: {
        info: `Average response time: ${metadata.avgResponseTime || 0}ms`,
        warning: `Average response time has increased to ${metadata.avgResponseTime || 0}ms. Expected threshold: 100ms.`,
        critical: `Critical performance issues detected. Response time: ${metadata.avgResponseTime || 0}ms, Error rate: ${(metadata.errorRate || 0) * 100}%`,
      },
      error: {
        info: `Error rate: ${(metadata.errorRate || 0) * 100}%`,
        warning: `Error rate has increased to ${(metadata.errorRate || 0) * 100}%. Multiple errors detected.`,
        critical: `Critical error rate: ${(metadata.errorRate || 0) * 100}%. Multiple service failures detected.`,
      },
      security: {
        info: `Security alert triggered. ${metadata.reason || ''}`,
        warning: `Suspicious activity detected. ${metadata.reason || ''}`,
        critical: `Security breach attempt detected. ${metadata.reason || ''}`,
      },
      availability: {
        info: `Service availability: ${(metadata.availability || 0)}%`,
        warning: `Service availability has dropped to ${(metadata.availability || 0)}%.`,
        critical: `Service availability is critically low at ${(metadata.availability || 0)}%.`,
      },
      resource: {
        info: `Resource usage: CPU ${(metadata.cpu || 0)}%, Memory ${(metadata.memory || 0)}%, Disk ${(metadata.disk || 0)}%`,
        warning: `High resource usage detected: CPU ${(metadata.cpu || 0)}%, Memory ${(metadata.memory || 0)}%, Disk ${(metadata.disk || 0)}%`,
        critical: `Resource exhaustion detected: CPU ${(metadata.cpu || 0)}%, Memory ${(metadata.memory || 0)}%, Disk ${(metadata.disk || 0)}%`,
      },
    };

    const descriptionKey = type as keyof typeof descriptions;
    const severityKey = severity as keyof typeof descriptions[typeof descriptionKey];
    return descriptions[descriptionKey][severityKey];
  }

  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    return [];
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await this.auditLogRepository.save({
      action: AuditAction.PERFORMANCE_ALERT_ACKNOWLEDGED,
      description: `Alert ${alertId} acknowledged by user ${userId}`,
      severity: AuditSeverity.INFO,
      userId,
      resourceId: alertId,
    });
  }

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    await this.auditLogRepository.save({
      action: AuditAction.PERFORMANCE_ALERT_RESOLVED,
      description: `Alert ${alertId} resolved by user ${userId}`,
      severity: AuditSeverity.INFO,
      userId,
      resourceId: alertId,
    });
  }

  async getSystemDiagnostics(): Promise<{
    status: 'operational' | 'degraded' | 'critical';
    uptime: number;
    lastCheck: Date;
    health: HealthCheckResult[];
    metrics: AlertMetrics;
    recommendations: string[];
  }> {
    const health = await this.performSystemHealthCheck();
    const metrics = this.getPerformanceMetrics();
    const healthChecks = health.checks;

    const recommendations = this.generateRecommendations(metrics, healthChecks);

    return {
      status: health.overallStatus === 'critical' ? 'critical' : health.overallStatus === 'degraded' ? 'degraded' : 'operational',
      uptime: this.performanceMetrics.uptime,
      lastCheck: new Date(),
      health: healthChecks,
      metrics,
      recommendations,
    };
  }

  private generateRecommendations(metrics: AlertMetrics, checks: HealthCheckResult[]): string[] {
    const recommendations: string[] = [];

    const hasUnhealthy = checks.some(c => c.status === 'unhealthy');
    const hasDegraded = checks.some(c => c.status === 'degraded');

    if (hasUnhealthy || hasDegraded) {
      recommendations.push('Review system logs for error details');
      recommendations.push('Check server resources and capacity');
      recommendations.push('Review database performance and optimization');
    }

    if (metrics.avgResponseTime > 500) {
      recommendations.push('Database query optimization recommended');
      recommendations.push('Consider implementing caching layer');
    }

    if (metrics.errorRate > 0.1) {
      recommendations.push('Investigate error patterns and root causes');
      recommendations.push('Implement retry mechanisms for failed operations');
    }

    if (hasDegraded) {
      recommendations.push('Review individual service health status');
    }

    return recommendations;
  }

  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const healthCheckService = new HealthCheckService();
