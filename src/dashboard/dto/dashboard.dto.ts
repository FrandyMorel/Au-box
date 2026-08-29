import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO para parámetros de período en consultas
 */
export class PeriodQueryDto {
  @IsEnum(['year', 'month', 'week'], {
    message: 'El período debe ser: year, month o week',
  })
  period!: 'year' | 'month' | 'week';

  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(2000, { message: 'El año debe ser mayor o igual a 2000' })
  year?: number;

  @IsOptional()
  @IsInt({ message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  month?: number;

  @IsOptional()
  @IsInt({ message: 'La semana debe ser un número entero' })
  @Min(1, { message: 'La semana debe estar entre 1 y 53' })
  @Max(53, { message: 'La semana debe estar entre 1 y 53' })
  week?: number;
}
