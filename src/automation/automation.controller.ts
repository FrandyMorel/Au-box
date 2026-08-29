import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { AutomationsService } from './automation.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
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
  IStatisticsResponse,
  IDeleteResponse,
  IPaginatedResponse,
} from './interfaces/automation.interface';

/**
 * Controlador para gestionar automatizaciones, incluyendo búsqueda, filtros y control de estados
 * Estados disponibles: ACTIVE, COMPLETED, IN_INCIDENT
 */
@Controller('automations')
@UseGuards(JwtGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  /**
   * Crear una nueva automatización
   * POST /automations
   * @param createAutomationDto - Datos para crear la automatización
   * @param userId - ID del usuario autenticado
   * @returns Automatización creada con estado ACTIVE por defecto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAutomationDto: CreateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.automationsService.create(createAutomationDto, userId);
  }

  /**
   * Obtener estadísticas de automatizaciones
   * GET /automations/stats/overview
   * NOTA: Este endpoint debe estar ANTES de /:id para evitar conflictos de rutas
   * Estados: ACTIVE (activas), COMPLETED (completadas), IN_INCIDENT (con incidencia)
   * @param userId - ID del usuario (opcional) para filtrar por usuario específico
   * @returns Estadísticas: total, activas, completadas, con incidencia, incidentes totales y abiertos
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStatistics(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ): Promise<IStatisticsResponse> {
    return this.automationsService.getStatistics(userId);
  }

  /**
   * Obtener todas las automatizaciones con búsqueda y filtros avanzados
   * GET /automations
   * @param query - Parámetros de búsqueda, filtros y paginación
   *   - search: Busca en nombre y descripción (insensible a mayúsculas)
   *   - status: ACTIVE | COMPLETED | IN_INCIDENT
   *   - requestedBy: Filtro por solicitante (insensible a mayúsculas)
   *   - page: Número de página (default: 1)
   *   - limit: Elementos por página (default: 10, máx: 100)
   * @returns Automatizaciones paginadas con metadata
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: SearchAndFilterDto,
  ): Promise<IPaginatedResponse<IAutomationResponse>> {
    return this.automationsService.findAll(query);
  }

  /**
   * Obtener una automatización específica por ID
   * GET /automations/:id
   * @param id - ID de la automatización
   * @returns Automatización con detalles completos (usuario, incidentes, etc.)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.findOne(id);
  }

  /**
   * Actualizar información general de una automatización
   * PATCH /automations/:id
   * Solo el propietario puede actualizar su automatización
   * @param id - ID de la automatización
   * @param updateAutomationDto - Campos a actualizar (nombre, descripción, estado)
   * @param userId - ID del usuario autenticado (para verificar permisos)
   * @returns Automatización actualizada
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAutomationDto: UpdateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.automationsService.update(id, updateAutomationDto, userId);
  }

  /**
   * Actualizar el solicitante de una automatización
   * PATCH /automations/:id/requested-by
   * @param id - ID de la automatización
   * @param updateRequestedByDto - Nuevo nombre del solicitante
   * @returns Automatización actualizada
   */
  @Patch(':id/requested-by')
  @HttpCode(HttpStatus.OK)
  async updateRequestedBy(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequestedByDto: UpdateRequestedByDto,
  ): Promise<IAutomationResponse> {
    return this.automationsService.updateRequestedBy(id, updateRequestedByDto);
  }

  /**
   * Actualizar la fecha de implementación
   * PATCH /automations/:id/implementation-date
   * @param id - ID de la automatización
   * @param updateImplementationDateDto - Nueva fecha de implementación (ISO 8601)
   * @returns Automatización actualizada
   */
  @Patch(':id/implementation-date')
  @HttpCode(HttpStatus.OK)
  async updateImplementationDate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImplementationDateDto: UpdateImplementationDateDto,
  ): Promise<IAutomationResponse> {
    return this.automationsService.updateImplementationDate(
      id,
      updateImplementationDateDto,
    );
  }

  /**
   * Cambiar el estado de una automatización
   * PATCH /automations/:id/status
   * 🆕 Registra automáticamente la fecha del cambio en statusChangedAt
   *
   * Estados disponibles:
   * - ACTIVE: Automatización en ejecución
   * - COMPLETED: Automatización completada/terminada
   * - IN_INCIDENT: Automatización con problemas o incidencia
   *
   * @param id - ID de la automatización
   * @param updateStatusDto - Nuevo estado (ACTIVE | COMPLETED | IN_INCIDENT)
   * @returns Automatización actualizada con timestamp del cambio de estado
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ): Promise<IAutomationResponse> {
    return this.automationsService.updateStatus(id, updateStatusDto);
  }

  /**
   * Eliminar una automatización
   * DELETE /automations/:id
   * ⚠️ Al eliminar una automatización, todos los incidentes asociados se eliminan automáticamente (cascada)
   *
   * @param id - ID de la automatización a eliminar
   * @returns Respuesta con mensaje de confirmación e ID eliminado
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IDeleteResponse> {
    return this.automationsService.remove(id);
  }
}
