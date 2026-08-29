import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AutomationStatus } from '@prisma/client';
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
  IAutomationWhereInput,
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
          statusChangedAt: new Date(), // 🆕 Registrar fecha de creación como primer cambio
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

      // Construir donde cláusula
      const where: IAutomationWhereInput = this.buildWhereClause(
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
   * 🆕 Registra automáticamente la fecha del cambio en statusChangedAt
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

      // 🆕 Registrar la fecha del cambio de estado
      const updatedAutomation = await this.prisma.automation.update({
        where: { id },
        data: {
          status: updateStatusDto.status,
          statusChangedAt: new Date(), // 🆕 Registrar timestamp del cambio
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
   * Estados: ACTIVE, COMPLETED, IN_INCIDENT
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
        completed, // 🆕 Renombrado de maintenance
        inIncident, // 🆕 Renombrado de discontinued
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
   * ✅ CORREGIDO: Usar spread operator para evitar asignación a propiedades readonly
   * @param search - Término de búsqueda
   * @param status - Estado a filtrar
   * @param requestedBy - Solicitante a filtrar
   * @returns Objeto WHERE para Prisma
   */
  private buildWhereClause(
    search: string | undefined,
    status: AutomationStatus | undefined,
    requestedBy: string | undefined,
  ): IAutomationWhereInput {
    // ✅ CORREGIDO: Construir el objeto de forma segura sin asignar a propiedades readonly
    const whereConditions: IAutomationWhereInput = {};

    // Construir objeto OR si hay búsqueda
    if (search && search.length > 0) {
      const orCondition = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
      Object.assign(whereConditions, { OR: orCondition });
    }

    // Agregar filtro de estado
    if (status) {
      Object.assign(whereConditions, { status });
    }

    // Agregar filtro de solicitante
    if (requestedBy && requestedBy.length > 0) {
      const requestedByCondition = {
        contains: requestedBy,
        mode: 'insensitive' as const,
      };
      Object.assign(whereConditions, { requestedBy: requestedByCondition });
    }

    return whereConditions;
  }

  /**
   * Mapear una automatización de Prisma a respuesta DTO
   * @param automation - Automatización con relaciones
   * @returns Automatización mapeada a IAutomationResponse
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
      statusChangedAt: automation.statusChangedAt, // 🆕 Incluir en respuesta
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
   * ✅ CORREGIDO: Tipo unknown en catch para evitar unsafe assignment
   * @param error - Error capturado (tipo unknown)
   * @param operation - Nombre de la operación
   * @throws InternalServerErrorException con mensaje genérico
   */
  private handleDatabaseError(error: unknown, operation: string): never {
    console.error(`Error durante ${operation}:`, error);

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
