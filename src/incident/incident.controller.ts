import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { IncidentsService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { UpdateIncidentPriorityDto } from './dto/update-incident-priority.dto';
import {
  IIncidentResponse,
  IPaginatedIncidents,
  IIncidentFilters,
  IIncidentHistoryItem,
} from './interface/incident.interface';
import { IncidentStatus, IncidentPriority } from '@prisma/client';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  /**
   * POST /incidents
   * Registra una nueva incidencia
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createIncident(
    @Body(new ValidationPipe({ transform: true }))
    createIncidentDto: CreateIncidentDto,
  ): Promise<IIncidentResponse> {
    return await this.incidentsService.createIncident(createIncidentDto);
  }

  /**
   * GET /incidents
   * Obtiene todas las incidencias con opciones de paginación y filtrado
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllIncidents(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('status') status?: IncidentStatus,
    @Query('priority') priority?: IncidentPriority,
    @Query('automationId', new ParseIntPipe({ optional: true }))
    automationId?: number,
    @Query('userId', new ParseIntPipe({ optional: true }))
    userId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<IPaginatedIncidents> {
    const filters: IIncidentFilters = {};

    if (status) {
      if (!Object.values(IncidentStatus).includes(status)) {
        throw new BadRequestException(`Estado inválido: ${status}`);
      }
      filters.status = status;
    }

    if (priority) {
      if (!Object.values(IncidentPriority).includes(priority)) {
        throw new BadRequestException(`Prioridad inválida: ${priority}`);
      }
      filters.priority = priority;
    }

    if (automationId) {
      filters.automationId = automationId;
    }

    if (userId) {
      filters.userId = userId;
    }

    if (startDate) {
      const date: Date = new Date(startDate);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Fecha de inicio inválida: ${startDate}`);
      }
      filters.startDate = date;
    }

    if (endDate) {
      const date: Date = new Date(endDate);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(`Fecha de fin inválida: ${endDate}`);
      }
      filters.endDate = date;
    }

    return await this.incidentsService.getAllIncidents(
      page ?? 1,
      pageSize ?? 10,
      filters,
    );
  }

  /**
   * GET /incidents/:id
   * Obtiene una incidencia por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getIncidentById(
    @Param('id', ParseIntPipe) incidentId: number,
  ): Promise<IIncidentResponse> {
    return await this.incidentsService.getIncidentById(incidentId);
  }

  /**
   * PATCH /incidents/:id
   * Actualiza la información de una incidencia
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateIncident(
    @Param('id', ParseIntPipe) incidentId: number,
    @Body(new ValidationPipe({ transform: true, skipMissingProperties: true }))
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<IIncidentResponse> {
    return await this.incidentsService.updateIncident(
      incidentId,
      updateIncidentDto,
    );
  }

  /**
   * PATCH /incidents/:id/status
   * Cambia el estado de una incidencia
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateIncidentStatus(
    @Param('id', ParseIntPipe) incidentId: number,
    @Body(new ValidationPipe({ transform: true }))
    updateStatusDto: UpdateIncidentStatusDto,
  ): Promise<IIncidentResponse> {
    return await this.incidentsService.updateIncidentStatus(
      incidentId,
      updateStatusDto,
    );
  }

  /**
   * PATCH /incidents/:id/priority
   * Cambia la prioridad de una incidencia
   */
  @Patch(':id/priority')
  @HttpCode(HttpStatus.OK)
  async updateIncidentPriority(
    @Param('id', ParseIntPipe) incidentId: number,
    @Body(new ValidationPipe({ transform: true }))
    updatePriorityDto: UpdateIncidentPriorityDto,
  ): Promise<IIncidentResponse> {
    return await this.incidentsService.updateIncidentPriority(
      incidentId,
      updatePriorityDto,
    );
  }

  /**
   * GET /incidents/history/all
   * Obtiene el historial de incidencias resueltas
   */
  @Get('history/all')
  @HttpCode(HttpStatus.OK)
  async getIncidentHistory(
    @Query('automationId', new ParseIntPipe({ optional: true }))
    automationId?: number,
  ): Promise<IIncidentHistoryItem[]> {
    return await this.incidentsService.getIncidentHistory(automationId);
  }

  /**
   * GET /incidents/automation/:automationId/active
   * Obtiene las incidencias activas de una automatización
   */
  @Get('automation/:automationId/active')
  @HttpCode(HttpStatus.OK)
  async getActiveIncidentsByAutomation(
    @Param('automationId', ParseIntPipe) automationId: number,
  ): Promise<IIncidentResponse[]> {
    return await this.incidentsService.getActiveIncidentsByAutomation(
      automationId,
    );
  }
}
