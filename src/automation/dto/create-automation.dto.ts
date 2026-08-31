import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { AutomationStatus } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO para crear una nueva automatización
 */
export class CreateAutomationDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  readonly name!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres',
  })
  readonly description!: string;

  @IsString({ message: 'El solicitante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @MinLength(3, {
    message: 'El nombre del solicitante debe tener al menos 3 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre del solicitante no puede exceder 150 caracteres',
  })
  readonly requestedBy!: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de implementación debe ser una fecha válida (ISO 8601)',
    },
  )
  readonly implementDate?: string;
}

/**
 * DTO para actualizar una automatización
 */
export class UpdateAutomationDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  readonly name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(500, {
    message: 'La descripción no puede exceder 500 caracteres',
  })
  readonly description?: string;

  @IsOptional()
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, COMPLETED o IN_INCIDENT',
  })
  readonly status?: AutomationStatus;
}

/**
 * DTO para actualizar el solicitante
 */
export class UpdateRequestedByDto {
  @IsString({ message: 'El solicitante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  @MinLength(3, {
    message: 'El nombre del solicitante debe tener al menos 3 caracteres',
  })
  @MaxLength(150, {
    message: 'El nombre del solicitante no puede exceder 150 caracteres',
  })
  readonly requestedBy!: string;
}

/**
 * DTO para actualizar la fecha de implementación
 */
export class UpdateImplementationDateDto {
  @IsDateString(
    {},
    {
      message:
        'La fecha de implementación debe ser una fecha válida (ISO 8601)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de implementación es requerida' })
  readonly implementDate!: string;
}

/**
 * DTO para cambiar el estado
 */
export class UpdateStatusDto {
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, COMPLETED o IN_INCIDENT',
  })
  @IsNotEmpty({ message: 'El estado es requerido' })
  readonly status!: AutomationStatus;
}

/**
 * DTO para paginación
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página debe ser mayor o igual a 1' })
  readonly page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite debe ser mayor o igual a 1' })
  readonly limit?: number;
}

/**
 * DTO para búsqueda y filtros
 */
export class SearchAndFilterDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser una cadena de texto' })
  @MaxLength(255, { message: 'La búsqueda no puede exceder 255 caracteres' })
  readonly search?: string;

  @IsOptional()
  @IsEnum(AutomationStatus, {
    message: 'El estado debe ser ACTIVE, COMPLETED o IN_INCIDENT',
  })
  readonly status?: AutomationStatus;

  @IsOptional()
  @IsString({ message: 'El solicitante debe ser una cadena de texto' })
  @MaxLength(150, {
    message: 'El solicitante no puede exceder 150 caracteres',
  })
  readonly requestedBy?: string;

  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  @MaxLength(100, {
    message: 'El departamento no puede exceder 100 caracteres',
  })
  readonly department?: string;
}

/**
 * DTO de respuesta de automatización
 */
export class AutomationResponseDto {
  readonly id!: number;
  readonly name!: string;
  readonly description!: string;
  readonly status!: AutomationStatus;
  readonly requestedBy!: string;
  readonly implementDate!: Date | null;
  readonly statusChangedAt!: Date | null; // 🆕 Fecha del último cambio de estado
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
  readonly createdByUser!: {
    readonly id: number;
    readonly name: string;
    readonly email: string;
    readonly department: string;
  };
  readonly incidentCount!: number;
  readonly activeIncidents!: number;
}
