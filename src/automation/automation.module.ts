import { Module } from '@nestjs/common';
import { AutomationsService } from './automation.service';
import { AutomationsController } from './automation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AutomationsController],
  providers: [AutomationsService],
  exports: [AutomationsService],
})
export class AutomationsModule {}
