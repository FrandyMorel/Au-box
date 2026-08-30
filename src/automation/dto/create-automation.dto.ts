import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'El solicitante es requerido' })
  requestedBy!: string;

  @IsOptional()
  @IsString()
  implementDate?: string;
}
