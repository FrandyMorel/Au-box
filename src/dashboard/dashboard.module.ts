import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

/**
 * Módulo de Dashboard
 * Encapsula toda la lógica relacionada con estadísticas e métricas del dashboard
 *
 * Proporciona:
 * - Estadísticas generales de automatizaciones e incidencias
 * - Análisis por período (año, mes, semana)
 * - Listados de solicitantes
 * - Historial de transiciones de estado
 *
 * Requiere autenticación JWT para todos los endpoints
 */
@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
