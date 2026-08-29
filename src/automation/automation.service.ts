import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AutomationStatus, Prisma } from '@prisma/client';
import type {
  CreateAutomationDto,
  UpdateAutomationDto,
  UpdateRequestedByDto,
  UpdateImplementationDateDto,
  UpdateStatusDto,
  SearchAndFilterDto,
} from './dto/automation.dto';
import type {
  IAutomationResponse,
  IAutomationWithRelations,
  IStatisticsResponse,
  IPaginatedResponse,
  IDeleteResponse,
} from './interfaces/automation.interface';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Servicio para gestionar automatizaciones, incluyendo búsqueda, filtros y control de estados
 * Estados disponibles: ACTIVE, COMPLETED, IN_INCIDENT
 */
@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva automatización
   * @param createAutomationDto - Datos para crear la automatización
   * @param userId - ID del usuario que crea la automatización
   * @returns Automatización creada
   */
  async create(
    createAutomationDto: CreateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    try {
      const { name, description, requestedBy, implementDate } =
        createAutomationDto;

      const automation = await this.prisma.automation.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          requestedBy: requestedBy.trim(),
          implementDate: implementDate ? new Date(implementDate) : null,
          userId,
          status: AutomationStatus.ACTIVE,
          statusChangedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return this.mapAutomationToResponse(automation);
    } catch (error) {
      this.handleDatabaseError(error, 'crear automatización');
    }
  }

  /**
   * Obtener todas las automatizaciones con búsqueda y filtros
   * @param query - Parámetros de búsqueda, filtros y paginación
   * @returns Respuesta paginada con automatizaciones
   */
  async findAll(
    query: SearchAndFilterDto,
  ): Promise<IPaginatedResponse<IAutomationResponse>> {
    try {
      const search: string | undefined = query.search?.trim();
      const status: AutomationStatus | undefined = query.status;
      const requestedBy: string | undefined = query.requestedBy?.trim();
      const page: number = query.page ?? 1;
      const limit: number = query.limit ?? 10;

      // Validar paginación
      if (page < 1) {
        throw new BadRequestException('La página debe ser mayor o igual a 1');
      }
      if (limit < 1 || limit > 100) {
        throw new BadRequestException(
          'El límite debe estar entre 1 y 100 elementos',
        );
      }

      const skip: number = (page - 1) * limit;

      const where: Prisma.AutomationWhereInput = this.buildWhereClause(
        search,
        status,
        requestedBy,
      );

      const [automations, total] = await Promise.all([
        this.prisma.automation.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            incidents: {
              select: {
                id: true,
                status: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.automation.count({ where }),
      ]);

      const totalPages: number = Math.ceil(total / limit);

      return {
        data: automations.map((automation) =>
          this.mapAutomationToResponse(automation as IAutomationWithRelations),
        ),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.handleDatabaseError(error, 'obtener automatizaciones');
    }
  }

  /**
   * Obtener una automatización por ID
   * @param id - ID de la automatización
   * @returns Automatización encontrada
   */
  async findOne(id: number): Promise<IAutomationResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      return this.mapAutomationToResponse(automation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'obtener automatización');
    }
  }

  /**
   * Actualizar información general de una automatización
   * @param id - ID de la automatización
   * @param updateAutomationDto - Datos a actualizar
   * @param userId - ID del usuario que realiza la actualización
   * @returns Automatización actualizada
   */
  async update(
    id: number,
    updateAutomationDto: UpdateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      if (automation.userId !== userId) {
        throw new BadRequestException(
          'No tienes permiso para actualizar esta automatización',
        );
      }

      const updateData: Record<string, unknown> = {};
      if (updateAutomationDto.name !== undefined) {
        updateData.name = updateAutomationDto.name.trim();
      }
      if (updateAutomationDto.description !== undefined) {
        updateData.description = updateAutomationDto.description.trim();
      }
      if (updateAutomationDto.status !== undefined) {
        updateData.status = updateAutomationDto.status;
      }

      const updatedAutomation = await this.prisma.automation.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return this.mapAutomationToResponse(updatedAutomation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'actualizar automatización');
    }
  }

  /**
   * Actualizar el solicitante de una automatización
   * @param id - ID de la automatización
   * @param updateRequestedByDto - Nuevo solicitante
   * @returns Automatización actualizada
   */
  async updateRequestedBy(
    id: number,
    updateRequestedByDto: UpdateRequestedByDto,
  ): Promise<IAutomationResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      const updatedAutomation = await this.prisma.automation.update({
        where: { id },
        data: {
          requestedBy: updateRequestedByDto.requestedBy.trim(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return this.mapAutomationToResponse(updatedAutomation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'actualizar solicitante');
    }
  }

  /**
   * Actualizar la fecha de implementación
   * @param id - ID de la automatización
   * @param updateImplementationDateDto - Nueva fecha de implementación
   * @returns Automatización actualizada
   */
  async updateImplementationDate(
    id: number,
    updateImplementationDateDto: UpdateImplementationDateDto,
  ): Promise<IAutomationResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      const implementDate: Date = new Date(
        updateImplementationDateDto.implementDate,
      );
      if (isNaN(implementDate.getTime())) {
        throw new BadRequestException(
          'La fecha de implementación no es válida',
        );
      }

      const updatedAutomation = await this.prisma.automation.update({
        where: { id },
        data: {
          implementDate,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return this.mapAutomationToResponse(updatedAutomation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'actualizar fecha de implementación');
    }
  }

  /**
   * Cambiar el estado de una automatización
   * @param id - ID de la automatización
   * @param updateStatusDto - Nuevo estado
   * @returns Automatización actualizada
   */
  async updateStatus(
    id: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<IAutomationResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      const updatedAutomation = await this.prisma.automation.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
          statusChangedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          incidents: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      return this.mapAutomationToResponse(updatedAutomation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'actualizar estado');
    }
  }

  /**
   * Eliminar una automatización
   * @param id - ID de la automatización a eliminar
   * @returns Respuesta con mensaje de confirmación
   */
  async remove(id: number): Promise<IDeleteResponse> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestException('El ID debe ser un número positivo');
      }

      const automation = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!automation) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      await this.prisma.automation.delete({
        where: { id },
      });

      return {
        message: 'Automatización eliminada correctamente',
        id,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, 'eliminar automatización');
    }
  }

  /**
   * Obtener estadísticas de automatizaciones
   * @param userId - ID del usuario (opcional, para filtrar por usuario)
   * @returns Estadísticas de automatizaciones
   */
  async getStatistics(userId?: number): Promise<IStatisticsResponse> {
    try {
      interface WhereInput {
        readonly userId?: number;
      }

      const where: WhereInput = userId ? { userId } : {};

      const [total, active, completed, inIncident, incidents] =
        await Promise.all([
          this.prisma.automation.count({ where }),
          this.prisma.automation.count({
            where: { ...where, status: AutomationStatus.ACTIVE },
          }),
          this.prisma.automation.count({
            where: { ...where, status: AutomationStatus.COMPLETED },
          }),
          this.prisma.automation.count({
            where: { ...where, status: AutomationStatus.IN_INCIDENT },
          }),
          this.prisma.incident.findMany({
            where: userId ? { userId } : {},
            select: {
              status: true,
            },
          }),
        ]);

      const openIncidents: number = incidents.filter(
        (incident) => incident.status === 'OPEN',
      ).length;

      const automations = await this.prisma.automation.findMany({
        where,
        select: {
          requestedBy: true,
        },
      });

      const requestersSet: Set<string> = new Set(
        automations.map((a) => a.requestedBy),
      );
      const requesters: string[] = Array.from(requestersSet).filter(
        (req) => req && req.trim().length > 0,
      );

      return {
        total,
        active,
        completed,
        inIncident,
        totalIncidents: incidents.length,
        openIncidents,
        requesters,
      };
    } catch (error) {
      this.handleDatabaseError(error, 'obtener estadísticas');
    }
  }

  /**
   * Construir la cláusula WHERE para búsqueda y filtros
   * Usa tipos de Prisma directamente para compatibilidad total
   */
  private buildWhereClause(
    search: string | undefined,
    status: AutomationStatus | undefined,
    requestedBy: string | undefined,
  ): Prisma.AutomationWhereInput {
    const andConditions: Prisma.AutomationWhereInput[] = [];

    if (search && search.trim().length > 0) {
      andConditions.push({
        OR: [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
        ],
      });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (requestedBy && requestedBy.trim().length > 0) {
      andConditions.push({
        requestedBy: {
          contains: requestedBy.trim(),
          mode: 'insensitive',
        },
      });
    }

    if (andConditions.length === 0) {
      return {};
    }

    if (andConditions.length === 1) {
      return andConditions[0];
    }

    return { AND: andConditions };
  }

  /**
   * Mapear una automatización de Prisma a respuesta DTO
   */
  private mapAutomationToResponse(
    automation: IAutomationWithRelations,
  ): IAutomationResponse {
    const incidents = automation.incidents ?? [];
    const activeIncidents: number = incidents.filter(
      (incident) => incident.status === 'OPEN',
    ).length;

    const response: IAutomationResponse = {
      id: automation.id,
      name: automation.name,
      description: automation.description,
      status: automation.status,
      requestedBy: automation.requestedBy,
      implementDate: automation.implementDate,
      statusChangedAt: automation.statusChangedAt,
      createdAt: automation.createdAt,
      updatedAt: automation.updatedAt,
      createdByUser: {
        id: automation.user?.id ?? 0,
        name: automation.user?.name ?? '',
        email: automation.user?.email ?? '',
      },
      incidentCount: incidents.length,
      activeIncidents,
    };

    return response;
  }

  /**
   * Manejar errores de base de datos
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error durante ${operation}:`, errorMessage);

    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error al ${operation}. Por favor, intenta más tarde.`,
    );
  }
}
