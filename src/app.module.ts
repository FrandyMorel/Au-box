import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AutomationsModule } from './automation/automation.module';
import { UserModule } from './user/user.module';
import { IncidentsModule } from './incident/incident.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // ✅ IMPORTANTE: ConfigModule global para variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Base de datos
    PrismaModule,

    // ✅ Módulos de funcionalidad
    AuthModule,
    AutomationsModule,
    UserModule,
    IncidentsModule,
    DashboardModule,
  ],
})
export class AppModule {}
