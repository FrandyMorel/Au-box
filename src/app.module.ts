import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AutomationsModule } from './automation/automation.module';
import { UserModule } from './user/user.module';
import { IncidentModule } from './incident/incident.module';

@Module({
  imports: [PrismaModule, AuthModule, AutomationsModule, UserModule, IncidentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
