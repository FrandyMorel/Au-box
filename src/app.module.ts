import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AutomationModule } from './automation/automation.module';

@Module({
  imports: [PrismaModule, AuthModule, AutomationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
