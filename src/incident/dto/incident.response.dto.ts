import { Exclude } from 'class-transformer';
import { IncidentStatus, IncidentPriority } from '@prisma/client';

export class IncidentResponseDto {
  readonly id: number;

  readonly name: string;

  readonly description: string;

  readonly status: IncidentStatus;

  readonly priority: IncidentPriority;

  readonly reportedAt: Date;

  readonly resolvedAt: Date | null;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  readonly automationId: number;

  readonly userId: number;

  @Exclude()
  readonly automation?: Record<string, unknown>;

  @Exclude()
  readonly user?: Record<string, unknown>;

  constructor(
    id: number,
    name: string,
    description: string,
    status: IncidentStatus,
    priority: IncidentPriority,
    reportedAt: Date,
    resolvedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    automationId: number,
    userId: number,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.reportedAt = reportedAt;
    this.resolvedAt = resolvedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.automationId = automationId;
    this.userId = userId;
  }
}
