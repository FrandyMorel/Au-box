import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { UpdateUserNameDto, ChangePasswordDto } from './dto/user.dto';
import type {
  UserResponseDto,
  UpdateUserNameResponseDto,
  ChangePasswordResponseDto,
} from './dto/user-response.dto';

/**
 * Servicio de usuario
 * Maneja la lógica de negocio para las operaciones del usuario
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Obtiene la información del usuario autenticado
   * @param userId - ID del usuario del JWT
   * @returns UserResponseDto con la información del usuario
   * @throws NotFoundException si el usuario no existe
   */
  async getUserInfo(userId: number): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${userId} no encontrado en el sistema`,
        );
      }

      return this.mapUserToResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al obtener la información del usuario',
      );
    }
  }

  /**
   * Actualiza el nombre del usuario
   * @param userId - ID del usuario del JWT
   * @param updateUserNameDto - Datos con el nuevo nombre
   * @returns UpdateUserNameResponseDto con la información actualizada
   * @throws NotFoundException si el usuario no existe
   * @throws BadRequestException si el nombre es inválido
   */
  async updateUserName(
    userId: number,
    updateUserNameDto: UpdateUserNameDto,
  ): Promise<UpdateUserNameResponseDto> {
    try {
      const { name } = updateUserNameDto;

      // Validar que el nombre no esté vacío
      if (!name || name.trim().length === 0) {
        throw new BadRequestException('El nombre no puede estar vacío');
      }

      // Verificar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${userId} no encontrado en el sistema`,
        );
      }

      // Actualizar el nombre
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() },
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        updatedAt: updatedUser.updatedAt,
        message: 'Nombre actualizado correctamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al actualizar el nombre del usuario',
      );
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param userId - ID del usuario del JWT
   * @param changePasswordDto - Datos con las contraseñas
   * @returns ChangePasswordResponseDto con confirmación
   * @throws NotFoundException si el usuario no existe
   * @throws BadRequestException si las contraseñas no coinciden o son inválidas
   */
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    try {
      const { currentPassword, newPassword, confirmPassword } =
        changePasswordDto;

      // Validar que las contraseñas nuevas coinciden
      if (newPassword !== confirmPassword) {
        throw new BadRequestException(
          'La nueva contraseña y la confirmación no coinciden',
        );
      }

      // Validar que la nueva contraseña es diferente a la actual
      if (currentPassword === newPassword) {
        throw new BadRequestException(
          'La nueva contraseña debe ser diferente a la contraseña actual',
        );
      }

      // Obtener el usuario
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${userId} no encontrado en el sistema`,
        );
      }

      // Verificar que la contraseña actual es correcta
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      // Hash de la nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar la contraseña
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt,
        message: 'Contraseña cambiada correctamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error al cambiar la contraseña del usuario',
      );
    }
  }

  /**
   * Mapea un usuario de la base de datos a un DTO de respuesta
   * @param user - Usuario de Prisma
   * @returns UserResponseDto
   */
  private mapUserToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
