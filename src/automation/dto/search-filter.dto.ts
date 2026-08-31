import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AutomationStatus } from '@prisma/client';

export class SearchAndFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, COMPLETED o IN_INCIDENT',
  })
  status?: AutomationStatus;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
