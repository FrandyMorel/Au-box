import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, AutomationStatus, Automation } from '@prisma/client';
import type {
  CreateAutomationDto,
  UpdateAutomationDto,
  UpdateRequestedByDto,
  UpdateImplementationDateDto,
  UpdateStatusDto,
  SearchAndFilterDto,
} from './dto/automation.dto';
import type { IAutomationResponse } from './interfaces/automation.interface';

interface IAutomationWithRelations extends Automation {
  user: {
    id: number;
    name: string;
    email: string;
  };
  incidents: Array<{
    id: number;
    status: string;
  }>;
}

interface IStatisticsResponse {
  total: number;
  active: number;
  maintenance: number;
  discontinued: number;
  totalIncidents: number;
  openIncidents: number;
  requesters: string[];
}

interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface IDeleteResponse {
  message: string;
  id: number;
}

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Crear una nueva automatización
   */
  async create(
    createAutomationDto: CreateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    const { name, description, requestedBy, implementDate } =
      createAutomationDto;

    const automation = await this.prisma.automation.create({
      data: {
        name,
        description,
        requestedBy,
        implementDate: implementDate ? new Date(implementDate) : null,
        userId,
        status: AutomationStatus.ACTIVE,
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
  }

  /**
   * Obtener todas las automatizaciones con búsqueda y filtros
   */
  async findAll(
    query: SearchAndFilterDto,
  ): Promise<IPaginatedResponse<IAutomationResponse>> {
    const search: string | undefined = query.search;
    const status: AutomationStatus | undefined = query.status;
    const requestedBy: string | undefined = query.requestedBy;
    const page: number = query.page ?? 1;
    const limit: number = query.limit ?? 10;

    const skip: number = (page - 1) * limit;

    interface WhereInput {
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      status?: AutomationStatus;
      requestedBy?: { contains: string; mode: 'insensitive' };
    }

    const where: WhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (requestedBy) {
      where.requestedBy = { contains: requestedBy, mode: 'insensitive' };
    }

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
  }

  /**
   * Obtener una automatización por ID
   */
  async findOne(id: number): Promise<IAutomationResponse> {
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
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    return this.mapAutomationToResponse(automation);
  }

  /**
   * Actualizar información general de una automatización
   */
  async update(
    id: number,
    updateAutomationDto: UpdateAutomationDto,
    userId: number,
  ): Promise<IAutomationResponse> {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    if (automation.userId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para actualizar esta automatización',
      );
    }

    const updatedAutomation = await this.prisma.automation.update({
      where: { id },
      data: updateAutomationDto,
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
  }

  /**
   * Actualizar el solicitante de una automatización
   */
  async updateRequestedBy(
    id: number,
    updateRequestedByDto: UpdateRequestedByDto,
  ): Promise<IAutomationResponse> {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    const updatedAutomation = await this.prisma.automation.update({
      where: { id },
      data: {
        requestedBy: updateRequestedByDto.requestedBy,
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
  }

  /**
   * Actualizar la fecha de implementación
   */
  async updateImplementationDate(
    id: number,
    updateImplementationDateDto: UpdateImplementationDateDto,
  ): Promise<IAutomationResponse> {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    const updatedAutomation = await this.prisma.automation.update({
      where: { id },
      data: {
        implementDate: new Date(updateImplementationDateDto.implementDate),
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
  }

  /**
   * Cambiar el estado de una automatización
   */
  async updateStatus(
    id: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<IAutomationResponse> {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    const updatedAutomation = await this.prisma.automation.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
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
  }

  /**
   * Eliminar una automatización
   */
  async remove(id: number): Promise<IDeleteResponse> {
    const automation = await this.prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundException(`Automatización con ID ${id} no encontrada`);
    }

    await this.prisma.automation.delete({
      where: { id },
    });

    return {
      message: 'Automatización eliminada correctamente',
      id,
    };
  }

  /**
   * Obtener estadísticas de automatizaciones
   */
  async getStatistics(userId?: number): Promise<IStatisticsResponse> {
    interface WhereInput {
      userId?: number;
    }

    const where: WhereInput = userId ? { userId } : {};

    const [total, active, maintenance, discontinued, incidents] =
      await Promise.all([
        this.prisma.automation.count({ where }),
        this.prisma.automation.count({
          where: { ...where, status: AutomationStatus.ACTIVE },
        }),
        this.prisma.automation.count({
          where: { ...where, status: AutomationStatus.MAINTENANCE },
        }),
        this.prisma.automation.count({
          where: { ...where, status: AutomationStatus.DISCONTINUED },
        }),
        this.prisma.incident.findMany({
          where: userId ? { user: { id: userId } } : {},
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
    const requesters: string[] = Array.from(requestersSet);

    return {
      total,
      active,
      maintenance,
      discontinued,
      totalIncidents: incidents.length,
      openIncidents,
      requesters,
    };
  }

  /**
   * Mapear una automatización de Prisma a respuesta DTO
   */
  private mapAutomationToResponse(
    automation: IAutomationWithRelations,
  ): IAutomationResponse {
    const activeIncidents: number = automation.incidents.filter(
      (incident) => incident.status === 'OPEN',
    ).length;

    const response: IAutomationResponse = {
      id: automation.id,
      name: automation.name,
      description: automation.description,
      status: automation.status,
      requestedBy: automation.requestedBy,
      implementDate: automation.implementDate,
      createdAt: automation.createdAt,
      updatedAt: automation.updatedAt,
      createdByUser: {
        id: automation.user.id,
        name: automation.user.name,
        email: automation.user.email,
      },
      incidentCount: automation.incidents.length,
      activeIncidents,
    };

    return response;
  }
}
