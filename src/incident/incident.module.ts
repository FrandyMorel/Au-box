import { Module } from '@nestjs/common';
import { IncidentsController } from './incident.controller';
import { IncidentsService } from './incident.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
