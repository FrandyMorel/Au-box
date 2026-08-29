import { IsEnum, IsNotEmpty, IsOptional, IsISO8601 } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentStatusDto {
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  readonly status: IncidentStatus;

  @IsOptional()
  @IsISO8601()
  readonly resolvedAt?: string;

  constructor(status: IncidentStatus, resolvedAt?: string) {
    this.status = status;
    this.resolvedAt = resolvedAt;
  }
}
