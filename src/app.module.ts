import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AutomationsModule } from './automation/automation.module';

@Module({
  imports: [PrismaModule, AuthModule, AutomationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
