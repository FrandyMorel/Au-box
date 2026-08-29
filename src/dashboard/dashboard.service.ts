import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type {
  IDashboardOverview,
  IAutomationStats,
  IIncidentStats,
  IRequester,
  IIncidentResolutionStats,
  IAutomationCompletionStats,
  IIncidentTransitionStats,
  IPeriodStat,
  IPeriodParam,
} from './interface/dashboard.interface';

/**
 * Servicio de Dashboard
 * Maneja la lógica para todas las estadísticas e métricas del dashboard
 */
@Injectable()
export class DashboardService {
  private readonly logger: Logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Obtener overview general del dashboard
   * Retorna todos los datos principales en una sola respuesta
   * @returns IDashboardOverview con estadísticas generales
   */
  async getDashboardOverview(): Promise<IDashboardOverview> {
    try {
      const [automationStats, incidentStats, requesters] = await Promise.all([
        this.getAutomationStats(),
        this.getIncidentStats(),
        this.getRequesters(),
      ]);

      return {
        automationStats,
        incidentStats,
        requesters,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.handleError(error, 'obtener overview del dashboard');
    }
  }

  /**
   * Obtener estadísticas de automatizaciones
   * @returns IAutomationStats con conteos de automatizaciones por estado
   */
  async getAutomationStats(): Promise<IAutomationStats> {
    try {
      const [total, active, completed, inIncident] = await Promise.all([
        this.prisma.automation.count(),
        this.prisma.automation.count({ where: { status: 'ACTIVE' } }),
        this.prisma.automation.count({ where: { status: 'COMPLETED' } }),
        this.prisma.automation.count({ where: { status: 'IN_INCIDENT' } }),
      ]);

      return {
        total,
        active,
        completed,
        inIncident,
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas de automatizaciones');
    }
  }

  /**
   * Obtener estadísticas de incidencias
   * @returns IIncidentStats con conteos de incidencias por estado
   */
  async getIncidentStats(): Promise<IIncidentStats> {
    try {
      const [total, open, inProgress, resolved, closed] = await Promise.all([
        this.prisma.incident.count(),
        this.prisma.incident.count({ where: { status: 'OPEN' } }),
        this.prisma.incident.count({ where: { status: 'IN_PROGRESS' } }),
        this.prisma.incident.count({ where: { status: 'RESOLVED' } }),
        this.prisma.incident.count({ where: { status: 'CLOSED' } }),
      ]);

      return {
        total,
        open,
        inProgress,
        resolved,
        closed,
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas de incidencias');
    }
  }

  /**
   * Obtener lista de solicitantes con sus conteos
   * @returns IRequester[] lista de solicitantes ordenada por cantidad descendente
   */
  async getRequesters(): Promise<IRequester[]> {
    try {
      const automations = await this.prisma.automation.findMany({
        select: {
          requestedBy: true,
        },
      });

      const requesterMap: Map<string, number> = new Map();

      automations.forEach((automation) => {
        const requester: string = automation.requestedBy.trim();
        if (requester.length > 0) {
          const current: number = requesterMap.get(requester) ?? 0;
          requesterMap.set(requester, current + 1);
        }
      });

      const requesters: IRequester[] = Array.from(requesterMap.entries())
        .map(([name, count]) => ({
          name,
          automationCount: count,
        }))
        .sort((a, b) => b.automationCount - a.automationCount);

      return requesters;
    } catch (error) {
      this.handleError(error, 'obtener lista de solicitantes');
    }
  }

  /**
   * Obtener estadísticas de incidencias resueltas por período
   * Cuenta incidencias que cambiaron a RESOLVED o CLOSED en el período especificado
   * @param periodParam - Parámetros del período (year, month, week)
   * @returns IIncidentResolutionStats con datos desglosados por período
   */
  async getIncidentResolutionStats(
    periodParam: IPeriodParam,
  ): Promise<IIncidentResolutionStats> {
    try {
      this.validatePeriodParam(periodParam);

      const incidents = await this.prisma.incident.findMany({
        where: {
          status: {
            in: ['RESOLVED', 'CLOSED'],
          },
        },
        select: {
          resolvedAt: true,
        },
      });

      const validDates: Date[] = incidents
        .map((i) => i.resolvedAt)
        .filter((date): date is Date => date !== null);

      const data: IPeriodStat[] = this.aggregateDataByPeriod(
        validDates,
        periodParam,
      );

      const total: number = data.reduce((sum, item) => sum + item.count, 0);
      const average: number =
        data.length > 0 ? Math.round(total / data.length) : 0;

      return {
        period: periodParam.period,
        year: periodParam.year,
        month: periodParam.month,
        week: periodParam.week,
        data,
        total,
        average,
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas de incidencias resueltas');
    }
  }

  /**
   * Obtener estadísticas de automatizaciones completadas por período
   * Cuenta automatizaciones que cambiaron a COMPLETED en el período especificado
   * @param periodParam - Parámetros del período
   * @returns IAutomationCompletionStats con datos desglosados
   */
  async getAutomationCompletionStats(
    periodParam: IPeriodParam,
  ): Promise<IAutomationCompletionStats> {
    try {
      this.validatePeriodParam(periodParam);

      const automations = await this.prisma.automation.findMany({
        where: {
          status: 'COMPLETED',
        },
        select: {
          statusChangedAt: true,
        },
      });

      const validDates: Date[] = automations
        .map((a) => a.statusChangedAt)
        .filter((date): date is Date => date !== null);

      const data: IPeriodStat[] = this.aggregateDataByPeriod(
        validDates,
        periodParam,
      );

      const total: number = data.reduce((sum, item) => sum + item.count, 0);
      const average: number =
        data.length > 0 ? Math.round(total / data.length) : 0;

      return {
        period: periodParam.period,
        year: periodParam.year,
        month: periodParam.month,
        week: periodParam.week,
        data,
        total,
        average,
      };
    } catch (error) {
      this.handleError(
        error,
        'obtener estadísticas de automatizaciones completadas',
      );
    }
  }

  /**
   * Obtener estadísticas de transiciones de estado (ACTIVE -> IN_INCIDENT)
   * @param periodParam - Parámetros del período
   * @returns IIncidentTransitionStats con datos desglosados
   */
  async getIncidentTransitionStats(
    periodParam: IPeriodParam,
  ): Promise<IIncidentTransitionStats> {
    try {
      this.validatePeriodParam(periodParam);

      // Obtener automatizaciones que están en IN_INCIDENT y tienen statusChangedAt
      const automations = await this.prisma.automation.findMany({
        where: {
          status: 'IN_INCIDENT',
        },
        select: {
          statusChangedAt: true,
        },
      });

      const validDates: Date[] = automations
        .map((a) => a.statusChangedAt)
        .filter((date): date is Date => date !== null);

      const data: IPeriodStat[] = this.aggregateDataByPeriod(
        validDates,
        periodParam,
      );

      const total: number = data.reduce((sum, item) => sum + item.count, 0);
      const average: number =
        data.length > 0 ? Math.round(total / data.length) : 0;

      return {
        period: periodParam.period,
        year: periodParam.year,
        month: periodParam.month,
        week: periodParam.week,
        data,
        total,
        average,
      };
    } catch (error) {
      this.handleError(error, 'obtener estadísticas de transiciones de estado');
    }
  }

  /**
   * Agregar datos por período (año, mes, semana)
   * @param dates - Lista de fechas a agrupar
   * @param periodParam - Parámetros del período
   * @returns IPeriodStat[] datos agregados
   */
  private aggregateDataByPeriod(
    dates: Date[],
    periodParam: IPeriodParam,
  ): IPeriodStat[] {
    const periodMap: Map<string, number> = new Map();

    dates.forEach((date) => {
      const key: string = this.getPeriodKey(date, periodParam);
      const current: number = periodMap.get(key) ?? 0;
      periodMap.set(key, current + 1);
    });

    // Generar todas las claves posibles para el período
    const now: Date = new Date();
    const allKeys: string[] = this.generatePeriodKeys(periodParam, now);

    const data: IPeriodStat[] = allKeys.map((key) => {
      const count: number = periodMap.get(key) ?? 0;
      return {
        period: key,
        count,
        percentage:
          dates.length > 0 ? Math.round((count / dates.length) * 100) : 0,
      };
    });

    return data.sort((a, b) => {
      // Ordenar por el orden natural del período
      return this.comparePeriodKeys(a.period, b.period, periodParam);
    });
  }

  /**
   * Obtener clave de período para una fecha
   * @param date - Fecha a procesar
   * @param periodParam - Tipo de período
   * @returns string clave del período
   */
  private getPeriodKey(date: Date, periodParam: IPeriodParam): string {
    const year: number = date.getFullYear();
    const month: number = date.getMonth() + 1;
    const week: number = this.getWeekNumber(date);

    switch (periodParam.period) {
      case 'year':
        return year.toString();
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
      case 'week':
        return `${year}-W${week.toString().padStart(2, '0')}`;
      default:
        return '';
    }
  }

  /**
   * Generar todas las claves posibles para un período
   * @param periodParam - Parámetros del período
   * @param now - Fecha actual
   * @returns string[] lista de claves
   */
  private generatePeriodKeys(periodParam: IPeriodParam, now: Date): string[] {
    const keys: string[] = [];
    const currentYear: number = now.getFullYear();

    switch (periodParam.period) {
      case 'year': {
        // Últimos 5 años
        for (let i: number = 4; i >= 0; i--) {
          keys.push((currentYear - i).toString());
        }
        break;
      }

      case 'month': {
        // 12 meses del año especificado o actual
        const year: number = periodParam.year ?? currentYear;
        for (let m: number = 1; m <= 12; m++) {
          keys.push(`${year}-${m.toString().padStart(2, '0')}`);
        }
        break;
      }

      case 'week': {
        // 4 últimas semanas o semanas del año
        const weekYear: number = periodParam.year ?? currentYear;
        for (let w: number = 1; w <= 53; w++) {
          keys.push(`${weekYear}-W${w.toString().padStart(2, '0')}`);
        }
        break;
      }
    }

    return keys;
  }

  /**
   * Comparar dos claves de período para ordenamiento
   * @param keyA - Primera clave
   * @param keyB - Segunda clave
   * @param periodParam - Tipo de período
   * @returns número para ordenamiento
   */
  private comparePeriodKeys(
    keyA: string,
    keyB: string,
    periodParam: IPeriodParam,
  ): number {
    switch (periodParam.period) {
      case 'year':
        return parseInt(keyA, 10) - parseInt(keyB, 10);

      case 'month': {
        const [yearA, monthA] = keyA.split('-').map(Number);
        const [yearB, monthB] = keyB.split('-').map(Number);
        const dateA: Date = new Date(yearA, monthA - 1, 1);
        const dateB: Date = new Date(yearB, monthB - 1, 1);
        return dateA.getTime() - dateB.getTime();
      }

      case 'week': {
        const [yearA, weekStrA] = keyA.split('-W');
        const [yearB, weekStrB] = keyB.split('-W');
        const yearANum: number = parseInt(yearA, 10);
        const yearBNum: number = parseInt(yearB, 10);
        const weekANum: number = parseInt(weekStrA, 10);
        const weekBNum: number = parseInt(weekStrB, 10);

        if (yearANum !== yearBNum) {
          return yearANum - yearBNum;
        }
        return weekANum - weekBNum;
      }

      default:
        return 0;
    }
  }

  /**
   * Obtener número de semana ISO 8601
   * @param date - Fecha
   * @returns número de semana (1-53)
   */
  private getWeekNumber(date: Date): number {
    const d: Date = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum: number = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart: Date = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum: number = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return weekNum;
  }

  /**
   * Validar parámetros del período
   * @param periodParam - Parámetros a validar
   * @throws BadRequestException si los parámetros no son válidos
   */
  private validatePeriodParam(periodParam: IPeriodParam): void {
    const currentYear: number = new Date().getFullYear();

    if (
      periodParam.year &&
      (periodParam.year < 2000 || periodParam.year > currentYear)
    ) {
      throw new BadRequestException(
        `El año debe estar entre 2000 y ${currentYear}`,
      );
    }

    if (
      periodParam.month &&
      (periodParam.month < 1 || periodParam.month > 12)
    ) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    if (periodParam.week && (periodParam.week < 1 || periodParam.week > 53)) {
      throw new BadRequestException('La semana debe estar entre 1 y 53');
    }

    // Validar que si se especifica mes, también se especifique año
    if (
      periodParam.month &&
      !periodParam.year &&
      periodParam.period === 'month'
    ) {
      // Para mes sin año, usamos el año actual (es válido)
    }
  }

  /**
   * Manejar errores de forma consistente
   * @param error - Error capturado
   * @param operation - Nombre de la operación
   * @throws InternalServerErrorException siempre
   */
  private handleError(error: unknown, operation: string): never {
    const errorMessage: string =
      error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`Error al ${operation}: ${errorMessage}`);

    throw new InternalServerErrorException(
      `Error al ${operation}. Por favor, intenta más tarde.`,
    );
  }
}
