import { IsEnum, IsNotEmpty } from 'class-validator';
import { IncidentPriority } from '@prisma/client';

export class UpdateIncidentPriorityDto {
  @IsEnum(IncidentPriority)
  @IsNotEmpty()
  readonly priority: IncidentPriority;

  constructor(priority: IncidentPriority) {
    this.priority = priority;
  }
}
