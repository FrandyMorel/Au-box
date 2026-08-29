import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * IsEmail
 * DTO para obtener la información del usuario
 * No requiere datos de entrada
 */
export class GetUserDto {
  // Este DTO es un marcador - no requiere propiedades
  // pero es útil para mantener la consistencia de la API
}

/**
 * DTO para actualizar el nombre del usuario
 */
export class UpdateUserNameDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name!: string;
}

/**
 * DTO para cambiar la contraseña del usuario
 */
export class ChangePasswordDto {
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  currentPassword!: string;

  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword!: string;

  @IsString({ message: 'La confirmación debe ser una cadena de texto' })
  confirmPassword!: string;
}
