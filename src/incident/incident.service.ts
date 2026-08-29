import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
import { Incident, AutomationStatus, IncidentStatus } from '@prisma/client';

@Injectable()
export class IncidentsService {
  private readonly logger: Logger = new Logger(IncidentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva incidencia asociada a una automatización
   * Cambia el estado de la automatización a IN_INCIDENT
   */
  async createIncident(
    createIncidentDto: CreateIncidentDto,
  ): Promise<IIncidentResponse> {
    try {
      this.logger.debug(`Creando incidencia: ${createIncidentDto.name}`);

      // Validar que la automatización existe y está en estado ACTIVE
      const automation = await this.prisma.automation.findUnique({
        where: { id: createIncidentDto.automationId },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${createIncidentDto.automationId} no encontrada`,
        );
      }

      if (automation.status !== AutomationStatus.ACTIVE) {
        throw new BadRequestException(
          `La automatización debe estar en estado ACTIVE para registrar una incidencia. Estado actual: ${automation.status}`,
        );
      }

      // Validar que el usuario existe
      const user = await this.prisma.user.findUnique({
        where: { id: createIncidentDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `Usuario con ID ${createIncidentDto.userId} no encontrado`,
        );
      }

      // Crear la incidencia y cambiar el estado de la automatización
      const incident = await this.prisma.$transaction(async (prisma) => {
        // Crear incidencia
        const newIncident = await prisma.incident.create({
          data: {
            name: createIncidentDto.name,
            description: createIncidentDto.description,
            automationId: createIncidentDto.automationId,
            userId: createIncidentDto.userId,
            status: IncidentStatus.OPEN,
            reportedAt: new Date(),
          },
        });

        // Cambiar estado de la automatización a IN_INCIDENT
        await prisma.automation.update({
          where: { id: createIncidentDto.automationId },
          data: {
            status: AutomationStatus.IN_INCIDENT,
            statusChangedAt: new Date(),
          },
        });

        return newIncident;
      });

      this.logger.log(`Incidencia creada con ID: ${incident.id}`);
      return this.mapIncidentToResponse(incident);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error creando incidencia: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al crear la incidencia. Por favor, intente más tarde.',
      );
    }
  }

  /**
   * Obtiene todas las incidencias con opciones de paginación y filtrado
   */
  async getAllIncidents(
    page: number = 1,
    pageSize: number = 10,
    filters?: IIncidentFilters,
  ): Promise<IPaginatedIncidents> {
    try {
      const skip: number = (page - 1) * pageSize;
      const validPageSize: number = Math.min(pageSize, 100);

      // Construir el objeto de filtros dinámicamente
      const where: Record<string, unknown> = {};

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.priority) {
        where.priority = filters.priority;
      }

      if (filters?.automationId) {
        where.automationId = filters.automationId;
      }

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.reportedAt = {};
        if (filters.startDate) {
          (where.reportedAt as Record<string, Date>).gte = filters.startDate;
        }
        if (filters.endDate) {
          (where.reportedAt as Record<string, Date>).lte = filters.endDate;
        }
      }

      const [incidents, total] = await Promise.all([
        this.prisma.incident.findMany({
          where,
          skip,
          take: validPageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            automation: {
              select: { id: true, name: true, status: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        this.prisma.incident.count({ where }),
      ]);

      const incidentResponses: IIncidentResponse[] = incidents.map((incident) =>
        this.mapIncidentToResponse(incident as Incident),
      );

      return {
        data: incidentResponses,
        total,
        page,
        pageSize: validPageSize,
        totalPages: Math.ceil(total / validPageSize),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error obteniendo incidencias: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al obtener las incidencias.',
      );
    }
  }

  /**
   * Obtiene una incidencia por su ID
   */
  async getIncidentById(incidentId: number): Promise<IIncidentResponse> {
    try {
      const incident = await this.prisma.incident.findUnique({
        where: { id: incidentId },
        include: {
          automation: {
            select: { id: true, name: true, status: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!incident) {
        throw new NotFoundException(
          `Incidencia con ID ${incidentId} no encontrada`,
        );
      }

      return this.mapIncidentToResponse(incident);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error obteniendo incidencia por ID: ${errorMessage}`);

      throw new InternalServerErrorException('Error al obtener la incidencia.');
    }
  }

  /**
   * Actualiza la información de una incidencia
   */
  async updateIncident(
    incidentId: number,
    updateIncidentDto: UpdateIncidentDto,
  ): Promise<IIncidentResponse> {
    try {
      // Validar que la incidencia existe
      const existingIncident = await this.prisma.incident.findUnique({
        where: { id: incidentId },
      });

      if (!existingIncident) {
        throw new NotFoundException(
          `Incidencia con ID ${incidentId} no encontrada`,
        );
      }

      const updatedIncident = await this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          name: updateIncidentDto.name ?? existingIncident.name,
          description:
            updateIncidentDto.description ?? existingIncident.description,
          updatedAt: new Date(),
        },
        include: {
          automation: {
            select: { id: true, name: true, status: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      this.logger.log(`Incidencia ${incidentId} actualizada`);
      return this.mapIncidentToResponse(updatedIncident);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error actualizando incidencia: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al actualizar la incidencia.',
      );
    }
  }

  /**
   * Cambia el estado de una incidencia
   * Si se resuelve, la automatización vuelve a ACTIVE
   */
  async updateIncidentStatus(
    incidentId: number,
    updateStatusDto: UpdateIncidentStatusDto,
  ): Promise<IIncidentResponse> {
    try {
      // Validar que la incidencia existe
      const existingIncident = await this.prisma.incident.findUnique({
        where: { id: incidentId },
        include: { automation: true },
      });

      if (!existingIncident) {
        throw new NotFoundException(
          `Incidencia con ID ${incidentId} no encontrada`,
        );
      }

      // Validar transiciones de estado válidas
      this.validateStatusTransition(
        existingIncident.status,
        updateStatusDto.status,
      );

      const resolvedAt: Date | null =
        updateStatusDto.status === IncidentStatus.RESOLVED ||
        updateStatusDto.status === IncidentStatus.CLOSED
          ? updateStatusDto.resolvedAt
            ? new Date(updateStatusDto.resolvedAt)
            : new Date()
          : null;

      const updatedIncident = await this.prisma.$transaction(async (prisma) => {
        // Actualizar el estado de la incidencia
        const incident = await prisma.incident.update({
          where: { id: incidentId },
          data: {
            status: updateStatusDto.status,
            resolvedAt: resolvedAt,
            updatedAt: new Date(),
          },
          include: {
            automation: {
              select: { id: true, name: true, status: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Si la incidencia se resuelve y todas las incidencias están resueltas/cerradas,
        // cambiar el estado de la automatización a ACTIVE
        if (
          updateStatusDto.status === IncidentStatus.RESOLVED ||
          updateStatusDto.status === IncidentStatus.CLOSED
        ) {
          const openIncidents = await prisma.incident.count({
            where: {
              automationId: existingIncident.automationId,
              status: {
                in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS],
              },
            },
          });

          if (openIncidents === 0) {
            await prisma.automation.update({
              where: { id: existingIncident.automationId },
              data: {
                status: AutomationStatus.ACTIVE,
                statusChangedAt: new Date(),
              },
            });

            this.logger.log(
              `Automatización ${existingIncident.automationId} vuelve a ACTIVE`,
            );
          }
        }

        return incident;
      });

      this.logger.log(
        `Incidencia ${incidentId} cambió a ${updateStatusDto.status}`,
      );
      return this.mapIncidentToResponse(updatedIncident);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error actualizando estado: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al actualizar el estado de la incidencia.',
      );
    }
  }

  /**
   * Cambia la prioridad de una incidencia
   */
  async updateIncidentPriority(
    incidentId: number,
    updatePriorityDto: UpdateIncidentPriorityDto,
  ): Promise<IIncidentResponse> {
    try {
      // Validar que la incidencia existe
      const existingIncident = await this.prisma.incident.findUnique({
        where: { id: incidentId },
      });

      if (!existingIncident) {
        throw new NotFoundException(
          `Incidencia con ID ${incidentId} no encontrada`,
        );
      }

      const updatedIncident = await this.prisma.incident.update({
        where: { id: incidentId },
        data: {
          priority: updatePriorityDto.priority,
          updatedAt: new Date(),
        },
        include: {
          automation: {
            select: { id: true, name: true, status: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      this.logger.log(
        `Prioridad de incidencia ${incidentId} actualizada a ${updatePriorityDto.priority}`,
      );
      return this.mapIncidentToResponse(updatedIncident);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error actualizando prioridad: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al actualizar la prioridad de la incidencia.',
      );
    }
  }

  /**
   * Obtiene el historial de incidencias (resueltas y cerradas)
   */
  async getIncidentHistory(
    automationId?: number,
  ): Promise<IIncidentHistoryItem[]> {
    try {
      const where: Record<string, unknown> = {
        status: {
          in: [IncidentStatus.RESOLVED, IncidentStatus.CLOSED],
        },
      };

      if (automationId) {
        where.automationId = automationId;
      }

      const incidents = await this.prisma.incident.findMany({
        where,
        orderBy: { resolvedAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          priority: true,
          reportedAt: true,
          resolvedAt: true,
        },
      });

      return incidents.map((incident) => ({
        id: incident.id,
        name: incident.name,
        description: incident.description,
        priority: incident.priority,
        reportedAt: incident.reportedAt,
        resolvedAt: incident.resolvedAt,
        resolutionTime: incident.resolvedAt
          ? this.calculateResolutionTime(
              incident.reportedAt,
              incident.resolvedAt,
            )
          : undefined,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error obteniendo historial: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Error al obtener el historial de incidencias.',
      );
    }
  }

  /**
   * Obtiene las incidencias activas de una automatización
   */
  async getActiveIncidentsByAutomation(
    automationId: number,
  ): Promise<IIncidentResponse[]> {
    try {
      // Validar que la automatización existe
      const automation = await this.prisma.automation.findUnique({
        where: { id: automationId },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${automationId} no encontrada`,
        );
      }

      const incidents = await this.prisma.incident.findMany({
        where: {
          automationId,
          status: {
            in: [IncidentStatus.OPEN, IncidentStatus.IN_PROGRESS],
          },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          automation: {
            select: { id: true, name: true, status: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return incidents.map((incident) =>
        this.mapIncidentToResponse(incident as Incident),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error obteniendo incidencias activas: ${errorMessage}`,
      );

      throw new InternalServerErrorException(
        'Error al obtener las incidencias activas.',
      );
    }
  }

  /**
   * Valida las transiciones de estado permitidas
   */
  private validateStatusTransition(
    currentStatus: IncidentStatus,
    newStatus: IncidentStatus,
  ): void {
    const validTransitions: Record<IncidentStatus, IncidentStatus[]> = {
      [IncidentStatus.OPEN]: [
        IncidentStatus.IN_PROGRESS,
        IncidentStatus.RESOLVED,
      ],
      [IncidentStatus.IN_PROGRESS]: [
        IncidentStatus.RESOLVED,
        IncidentStatus.CLOSED,
      ],
      [IncidentStatus.RESOLVED]: [IncidentStatus.CLOSED],
      [IncidentStatus.CLOSED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transición de estado no válida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  /**
   * Mapea una incidencia de Prisma a una respuesta tipada
   */
  private mapIncidentToResponse(incident: Incident): IIncidentResponse {
    if (!incident) {
      throw new InternalServerErrorException('Incidencia inválida');
    }

    return {
      id: incident.id,
      name: incident.name,
      description: incident.description,
      status: incident.status,
      priority: incident.priority,
      reportedAt: incident.reportedAt,
      resolvedAt: incident.resolvedAt,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      automationId: incident.automationId,
      userId: incident.userId,
    };
  }

  /**
   * Calcula el tiempo de resolución entre dos fechas
   */
  private calculateResolutionTime(reportedAt: Date, resolvedAt: Date): string {
    const diffMs: number = resolvedAt.getTime() - reportedAt.getTime();
    const diffHours: number = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays: number = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} día(s) y ${diffHours % 24} hora(s)`;
    }
    return `${diffHours} hora(s)`;
  }
}
