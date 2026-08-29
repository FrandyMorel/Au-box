import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PeriodQueryDto } from './dto/dashboard.dto';
import type {
  IDashboardOverview,
  IAutomationStats,
  IIncidentStats,
  IRequester,
  IIncidentResolutionStats,
  IAutomationCompletionStats,
  IIncidentTransitionStats,
  IPeriodParam,
} from './interface/dashboard.interface';

/**
 * Controlador de Dashboard
 * Proporciona endpoints para todas las estadísticas e métricas del dashboard
 * Requiere autenticación JWT
 */
@Controller('dashboard')
@UseGuards(JwtGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/overview
   * Obtener el resumen general del dashboard con todas las estadísticas principales
   * @param userId - ID del usuario autenticado (validación)
   * @returns IDashboardOverview con estadísticas generales
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  async getDashboardOverview(
    @GetUser('sub') userId: number,
  ): Promise<IDashboardOverview> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.dashboardService.getDashboardOverview();
  }

  /**
   * GET /dashboard/automations/stats
   * Obtener estadísticas de automatizaciones (total, activas, completadas, en incidente)
   * @param userId - ID del usuario autenticado
   * @returns IAutomationStats con conteos por estado
   */
  @Get('automations/stats')
  @HttpCode(HttpStatus.OK)
  async getAutomationStats(
    @GetUser('sub') userId: number,
  ): Promise<IAutomationStats> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.dashboardService.getAutomationStats();
  }

  /**
   * GET /dashboard/incidents/stats
   * Obtener estadísticas de incidencias (total, abiertas, resueltas, cerradas, en progreso)
   * @param userId - ID del usuario autenticado
   * @returns IIncidentStats con conteos por estado
   */
  @Get('incidents/stats')
  @HttpCode(HttpStatus.OK)
  async getIncidentStats(
    @GetUser('sub') userId: number,
  ): Promise<IIncidentStats> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.dashboardService.getIncidentStats();
  }

  /**
   * GET /dashboard/requesters
   * Obtener lista de solicitantes con sus conteos de automatizaciones
   * @param userId - ID del usuario autenticado
   * @returns IRequester[] lista de solicitantes ordenada por cantidad
   */
  @Get('requesters')
  @HttpCode(HttpStatus.OK)
  async getRequesters(@GetUser('sub') userId: number): Promise<IRequester[]> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.dashboardService.getRequesters();
  }

  /**
   * GET /dashboard/incidents/resolution
   * Obtener estadísticas de incidencias resueltas por período
   * Cuenta incidencias que cambiaron a RESOLVED o CLOSED
   *
   * Query params:
   * - period: 'year' | 'month' | 'week' (obligatorio)
   * - year: Año específico (opcional, default: año actual)
   * - month: Mes específico 1-12 (opcional, para period=month)
   * - week: Semana específica 1-53 (opcional, para period=week)
   *
   * @param userId - ID del usuario autenticado
   * @param periodQuery - Parámetros del período
   * @returns IIncidentResolutionStats con datos desglosados
   */
  @Get('incidents/resolution')
  @HttpCode(HttpStatus.OK)
  async getIncidentResolutionStats(
    @GetUser('sub') userId: number,
    @Query() periodQuery: PeriodQueryDto,
  ): Promise<IIncidentResolutionStats> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    if (!periodQuery.period) {
      throw new BadRequestException(
        'El parámetro "period" es obligatorio (year, month, week)',
      );
    }

    const periodParam: IPeriodParam = {
      period: periodQuery.period,
      year: periodQuery.year ?? new Date().getFullYear(),
      month: periodQuery.month,
      week: periodQuery.week,
    };

    return this.dashboardService.getIncidentResolutionStats(periodParam);
  }

  /**
   * GET /dashboard/automations/completion
   * Obtener estadísticas de automatizaciones completadas por período
   * Cuenta automatizaciones que cambiaron a COMPLETED
   *
   * Query params:
   * - period: 'year' | 'month' | 'week' (obligatorio)
   * - year: Año específico (opcional, default: año actual)
   * - month: Mes específico 1-12 (opcional, para period=month)
   * - week: Semana específica 1-53 (opcional, para period=week)
   *
   * @param userId - ID del usuario autenticado
   * @param periodQuery - Parámetros del período
   * @returns IAutomationCompletionStats con datos desglosados
   */
  @Get('automations/completion')
  @HttpCode(HttpStatus.OK)
  async getAutomationCompletionStats(
    @GetUser('sub') userId: number,
    @Query() periodQuery: PeriodQueryDto,
  ): Promise<IAutomationCompletionStats> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    if (!periodQuery.period) {
      throw new BadRequestException(
        'El parámetro "period" es obligatorio (year, month, week)',
      );
    }

    const periodParam: IPeriodParam = {
      period: periodQuery.period,
      year: periodQuery.year ?? new Date().getFullYear(),
      month: periodQuery.month,
      week: periodQuery.week,
    };

    return this.dashboardService.getAutomationCompletionStats(periodParam);
  }

  /**
   * GET /dashboard/automations/incident-transition
   * Obtener estadísticas de transiciones ACTIVE -> IN_INCIDENT
   * Cuenta automatizaciones que transitaron a IN_INCIDENT
   *
   * Query params:
   * - period: 'year' | 'month' | 'week' (obligatorio)
   * - year: Año específico (opcional, default: año actual)
   * - month: Mes específico 1-12 (opcional, para period=month)
   * - week: Semana específica 1-53 (opcional, para period=week)
   *
   * @param userId - ID del usuario autenticado
   * @param periodQuery - Parámetros del período
   * @returns IIncidentTransitionStats con datos desglosados
   */
  @Get('automations/incident-transition')
  @HttpCode(HttpStatus.OK)
  async getIncidentTransitionStats(
    @GetUser('sub') userId: number,
    @Query() periodQuery: PeriodQueryDto,
  ): Promise<IIncidentTransitionStats> {
    if (!userId || !Number.isInteger(userId)) {
      throw new BadRequestException('Usuario no identificado');
    }

    if (!periodQuery.period) {
      throw new BadRequestException(
        'El parámetro "period" es obligatorio (year, month, week)',
      );
    }

    const periodParam: IPeriodParam = {
      period: periodQuery.period,
      year: periodQuery.year ?? new Date().getFullYear(),
      month: periodQuery.month,
      week: periodQuery.week,
    };

    return this.dashboardService.getIncidentTransitionStats(periodParam);
  }
}
