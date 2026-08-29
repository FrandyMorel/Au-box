import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserService } from './user.service';
import type { UpdateUserNameDto, ChangePasswordDto } from './dto/user.dto';
import type {
  UserResponseDto,
  UpdateUserNameResponseDto,
  ChangePasswordResponseDto,
} from './dto/user-response.dto';

/**
 * Controlador de usuario
 * Maneja los endpoints relacionados con la información y configuración del usuario
 * Requiere autenticación JWT para todas las operaciones
 */
@Controller('users')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /users/me
   * Obtiene la información del usuario autenticado
   * @param userId - ID del usuario extraído del JWT por el decorador @GetUser('sub')
   * @returns UserResponseDto con la información del usuario
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getUserInfo(@GetUser('sub') userId: number): Promise<UserResponseDto> {
    return this.userService.getUserInfo(userId);
  }

  /**
   * PATCH /users/name
   * Actualiza el nombre del usuario autenticado
   * @param userId - ID del usuario extraído del JWT por el decorador @GetUser('sub')
   * @param updateUserNameDto - DTO con el nuevo nombre
   * @returns UpdateUserNameResponseDto con la información actualizada
   */
  @Patch('name')
  @HttpCode(HttpStatus.OK)
  async updateUserName(
    @GetUser('sub') userId: number,
    @Body() updateUserNameDto: UpdateUserNameDto,
  ): Promise<UpdateUserNameResponseDto> {
    return this.userService.updateUserName(userId, updateUserNameDto);
  }

  /**
   * POST /users/change-password
   * Cambia la contraseña del usuario autenticado
   * Requiere la contraseña actual y la nueva contraseña (confirmada)
   * @param userId - ID del usuario extraído del JWT por el decorador @GetUser('sub')
   * @param changePasswordDto - DTO con las contraseñas
   * @returns ChangePasswordResponseDto con confirmación
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser('sub') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ChangePasswordResponseDto> {
    return this.userService.changePassword(userId, changePasswordDto);
  }
}
