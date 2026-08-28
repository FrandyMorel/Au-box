import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Este guard verifica que el usuario tenga un JWT válido
 * Se usa con @UseGuards(JwtAuthGuard) en controladores
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
