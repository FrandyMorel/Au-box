import { Exclude } from 'class-transformer';

/**
 * DTO de respuesta para la información del usuario
 * Excluye campos sensibles como el hash de la contraseña
 */
export class UserResponseDto {
  id!: number;

  email!: string;

  name!: string;

  department!: string;

  createdAt!: Date;

  updatedAt!: Date;

  @Exclude()
  passwordHash?: string;
}

/**
 * DTO de respuesta para la actualización del nombre
 */
export class UpdateUserNameResponseDto {
  id!: number;

  name!: string;

  email!: string;

  department!: string;

  updatedAt!: Date;

  message!: string;
}

/**
 * DTO de respuesta para el cambio de contraseña
 */
export class ChangePasswordResponseDto {
  id!: number;

  email!: string;

  message!: string;

  updatedAt!: Date;
}

/**
 * DTO de respuesta genérica para mensajes
 */
export class MessageResponseDto {
  message!: string;
}
