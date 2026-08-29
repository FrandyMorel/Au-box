import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/response.dto';
import type { JwtPayload } from './interfaces/auth.interfaces';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, department, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash: string = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, name, department, passwordHash },
    });

    const token = this.generateToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      token,
    };
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      department: user.department,
    };

    const expiresIn: SignOptions['expiresIn'] =
      this.configService.get<SignOptions['expiresIn']>('JWT_EXPIRATION') ??
      '1d';

    return this.jwtService.sign(payload, { expiresIn });
  }
}
