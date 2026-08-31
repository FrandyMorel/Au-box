import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AutomationStatus, IncidentStatus } from '@prisma/client';
import {
  IAutomationResponse,
  IPaginatedResponse,
  IDeleteResponse,
  IStatisticsResponse,
  IAutomationWhereInput,
} from './interfaces/automation.interface';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { SearchAndFilterDto } from './dto/search-filter.dto';

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva automatización
   */
  async create(
    createAutomationDto: CreateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    try {
      if (
        !createAutomationDto.name ||
        !createAutomationDto.description ||
        !createAutomationDto.requestedBy
      ) {
        throw new BadRequestException(
          'Nombre, descripción y solicitante son requeridos',
        );
      }

      const automation = await this.prisma.automation.create({
        data: {
          name: createAutomationDto.name,
          description: createAutomationDto.description,
          requestedBy: createAutomationDto.requestedBy,
          implementDate: createAutomationDto.implementDate
            ? new Date(createAutomationDto.implementDate)
            : null,
          userId,
          status: AutomationStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
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
   * Obtener todas las automatizaciones con filtros y paginación
   */
  async findAll(
    query: SearchAndFilterDto,
    userId: number,
  ): Promise<IPaginatedResponse<IAutomationResponse>> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, query.limit || 10);
      const skip = (page - 1) * limit;

      // Construir cláusula WHERE
      const where = this.buildWhereClause(query);

      console.log('🔍 DEBUG - Query params:', {
        search: query.search,
        status: query.status,
        requestedBy: query.requestedBy,
        department: query.department,
        page,
        limit,
        skip,
        userId,
      });
      console.log('🔍 DEBUG - Where clause:', JSON.stringify(where, null, 2));

      // Ejecutar queries en paralelo
      const [automations, total] = await Promise.all([
        this.prisma.automation.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
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

      console.log('✅ DEBUG - Automations encontradas:', automations.length);

      if (!automations || automations.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      const mappedData = automations.map((automation) =>
        this.mapAutomationToResponse(automation),
      );

      const totalPages = Math.ceil(total / limit);

      return {
        data: mappedData,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('❌ ERROR COMPLETO en findAll:', error);
      this.handleDatabaseError(error, 'obtener automatizaciones');
    }
  }

  /**
   * Obtener una automatización por ID
   */
  async findOne(id: number, userId: number): Promise<IAutomationResponse> {
    try {
      const automation = await this.prisma.automation.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
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

      // Verificar que el usuario tenga acceso
      if (automation.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para acceder a esta automatización',
        );
      }

      return this.mapAutomationToResponse(automation);
    } catch (error) {
      this.handleDatabaseError(error, 'obtener automatización');
    }
  }

  /**
   * Actualizar automatización
   */
  async update(
    id: number,
    updateAutomationDto: UpdateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    try {
      // Verificar que existe y pertenece al usuario
      const existing = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      if (existing.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para actualizar esta automatización',
        );
      }

      const automation = await this.prisma.automation.update({
        where: { id },
        data: {
          ...(updateAutomationDto.name && {
            name: updateAutomationDto.name,
          }),
          ...(updateAutomationDto.description && {
            description: updateAutomationDto.description,
          }),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
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
      this.handleDatabaseError(error, 'actualizar automatización');
    }
  }

  /**
   * Actualizar estado de automatización
   */
  async updateStatus(
    id: number,
    status: string,
    userId: number,
  ): Promise<IAutomationResponse> {
    try {
      const validStatuses = Object.values(AutomationStatus);
      if (!validStatuses.includes(status as AutomationStatus)) {
        throw new BadRequestException(
          `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
        );
      }

      const existing = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      if (existing.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para actualizar esta automatización',
        );
      }

      const automation = await this.prisma.automation.update({
        where: { id },
        data: {
          status: status as AutomationStatus,
          statusChangedAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
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
      this.handleDatabaseError(error, 'actualizar estado de automatización');
    }
  }

  /**
   * Eliminar automatización
   */
  async delete(id: number, userId: number): Promise<IDeleteResponse> {
    try {
      const existing = await this.prisma.automation.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Automatización con ID ${id} no encontrada`,
        );
      }

      if (existing.userId !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para eliminar esta automatización',
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
      this.handleDatabaseError(error, 'eliminar automatización');
    }
  }

  /**
   * Obtener estadísticas de automatizaciones
   */
  async getStatistics(userId: number): Promise<IStatisticsResponse> {
    try {
      const [
        total,
        active,
        completed,
        inIncident,
        totalIncidents,
        openIncidents,
      ] = await Promise.all([
        this.prisma.automation.count({ where: { userId } }),
        this.prisma.automation.count({
          where: { userId, status: AutomationStatus.ACTIVE },
        }),
        this.prisma.automation.count({
          where: { userId, status: AutomationStatus.COMPLETED },
        }),
        this.prisma.automation.count({
          where: { userId, status: AutomationStatus.IN_INCIDENT },
        }),
        this.prisma.incident.count({ where: {} }),
        this.prisma.incident.count({
          where: { status: IncidentStatus.OPEN },
        }),
      ]);

      const requesters = await this.prisma.automation.findMany({
        where: { userId },
        select: { requestedBy: true },
        distinct: ['requestedBy'],
      });

      const departments = await this.prisma.user.findMany({
        select: { department: true },
        distinct: ['department'],
      });

      return {
        total,
        active,
        completed,
        inIncident,
        totalIncidents,
        openIncidents,
        requesters: requesters.map((r) => r.requestedBy),
        departments: departments.map((d) => d.department),
      };
    } catch (error) {
      this.handleDatabaseError(error, 'obtener estadísticas');
    }
  }

  /**
   * Construir cláusula WHERE para búsqueda y filtros
   * ✅ ARREGLADO: Construye el objeto sin propiedades readonly
   */
  private buildWhereClause(query: SearchAndFilterDto): IAutomationWhereInput {
    // ✅ Construir el objeto con todas las propiedades en un solo paso
    const whereConditions: Record<string, unknown> = {};

    // Búsqueda por nombre o descripción
    if (query.search && query.search.trim()) {
      whereConditions.OR = [
        {
          name: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filtro por estado
    if (query.status && query.status.trim()) {
      const validStatuses = Object.values(AutomationStatus);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      if (validStatuses.includes(query.status as AutomationStatus)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        whereConditions.status = query.status as AutomationStatus;
      }
    }

    // Filtro por solicitante
    if (query.requestedBy && query.requestedBy.trim()) {
      whereConditions.requestedBy = {
        contains: query.requestedBy.trim(),
        mode: 'insensitive',
      };
    }

    // Filtro por departamento (relación con user)
    if (query.department && query.department.trim()) {
      whereConditions.user = {
        department: {
          equals: query.department.trim(),
          mode: 'insensitive',
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return whereConditions as IAutomationWhereInput;
  }

  /**
   * Mapear Automation de BD a IAutomationResponse de forma segura
   */
  private mapAutomationToResponse(automation: {
    id: number;
    name: string;
    description: string;
    status: AutomationStatus;
    requestedBy: string;
    implementDate: Date | null;
    statusChangedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
      department: string;
    } | null;
    incidents: Array<{
      id: number;
      status: string;
    }>;
  }): IAutomationResponse {
    // ✅ VALIDAR QUE EL USUARIO EXISTE (CRÍTICO)
    if (!automation.user) {
      throw new InternalServerErrorException(
        `Usuario no encontrado para automatización ID ${automation.id}`,
      );
    }

    // ✅ CONTAR INCIDENTES ACTIVOS DE FORMA SEGURA
    const activeIncidents =
      automation.incidents && automation.incidents.length > 0
        ? automation.incidents.filter(
            (incident) => incident.status === IncidentStatus.OPEN,
          ).length
        : 0;

    return {
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
        id: automation.user.id,
        name: automation.user.name,
        email: automation.user.email,
        department: automation.user.department,
      },
      incidentCount: automation.incidents?.length || 0,
      activeIncidents,
    };
  }

  /**
   * Manejo centralizado de errores de BD
   */
  private handleDatabaseError(error: unknown, context: string): never {
    console.error(`❌ ERROR en ${context}:`, error);

    if (error instanceof BadRequestException) {
      throw error;
    }
    if (error instanceof NotFoundException) {
      throw error;
    }
    if (error instanceof ForbiddenException) {
      throw error;
    }
    if (error instanceof InternalServerErrorException) {
      throw error;
    }

    // Manejo de errores de Prisma
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code: string; message?: string };

      if (prismaError.code === 'P2025') {
        throw new NotFoundException('Registro no encontrado');
      }

      if (prismaError.code === 'P2002') {
        throw new ConflictException('El registro ya existe');
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido';

    throw new InternalServerErrorException(
      `Error al ${context}: ${errorMessage}`,
    );
  }
}
