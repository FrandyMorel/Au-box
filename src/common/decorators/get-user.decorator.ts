import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { JwtPayload } from '../../auth/interfaces/auth.interfaces';

/**
 * Decorador personalizado para obtener la información del usuario autenticado
 * desde el contexto de la request
 *
 * Uso:
 * - @GetUser() - obtiene el objeto usuario completo
 * - @GetUser('sub') - obtiene solo el ID del usuario
 * - @GetUser('email') - obtiene solo el email del usuario
 * - @GetUser('department') - obtiene solo el departamento del usuario
 */
export const GetUser = createParamDecorator(
  (
    data: keyof JwtPayload | undefined,
    ctx: ExecutionContext,
  ): JwtPayload | string | number | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
