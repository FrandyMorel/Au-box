import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { AutomationStatus } from '@prisma/client';
import { Type } from 'class-transformer';

// DTO para crear una nueva automatización
export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @MinLength(3, {
    message: 'El nombre del solicitante debe tener al menos 3 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre del solicitante no puede exceder 150 caracteres',
  })
  requestedBy!: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de implementación debe ser una fecha válida' },
  )
  implementDate?: string;
}

// DTO para actualizar una automatización
export class UpdateAutomationDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, MAINTENANCE o DISCONTINUED',
  })
  status?: AutomationStatus;
}

// DTO para actualizar el solicitante
export class UpdateRequestedByDto {
  @IsString()
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @MinLength(3, {
    message: 'El nombre del solicitante debe tener al menos 3 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre del solicitante no puede exceder 150 caracteres',
  })
  requestedBy!: string;
}

// DTO para actualizar la fecha de implementación
export class UpdateImplementationDateDto {
  @IsDateString(
    {},
    {
      message:
        'La fecha de implementación debe ser una fecha válida (ISO 8601)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de implementación es requerida' })
  implementDate!: string;
}

// DTO para cambiar el estado
export class UpdateStatusDto {
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, MAINTENANCE o DISCONTINUED',
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status!: AutomationStatus;
}

// DTO para la paginación
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

// DTO para búsqueda y filtros
export class SearchAndFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AutomationStatus)
  status?: AutomationStatus;

  @IsOptional()
  @IsString()
  requestedBy?: string;
}

// DTO de respuesta de automatización
export class AutomationResponseDto {
  id!: number;
  name!: string;
  description!: string;
  status!: AutomationStatus;
  requestedBy!: string;
  implementDate!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  createdByUser?: {
    id: number;
    name: string;
    email: string;
  };
  incidentCount!: number;
  activeIncidents!: number;
}
