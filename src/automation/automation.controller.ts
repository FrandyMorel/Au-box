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
import type { IAutomationResponse } from './interfaces/automation.interface';

@Controller('automations')
@UseGuards(JwtGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  /**
   * Crear una nueva automatización
   * POST /automations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAutomationDto: CreateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    if (!userId) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.automationsService.create(createAutomationDto, userId);
  }

  /**
   * Obtener todas las automatizaciones con búsqueda y filtros
   * GET /automations
   */
  @Get()
  async findAll(@Query() query: SearchAndFilterDto): Promise<{
    data: IAutomationResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.automationsService.findAll(query);
  }

  /**
   * Obtener una automatización por ID
   * GET /automations/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.findOne(id);
  }

  /**
   * Actualizar información general de una automatización
   * PATCH /automations/:id
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAutomationDto: UpdateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.update(id, updateAutomationDto, userId);
  }

  /**
   * Actualizar el solicitante de una automatización
   * PATCH /automations/:id/requested-by
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
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string; id: number }> {
    return this.automationsService.remove(id);
  }

  /**
   * Obtener estadísticas de automatizaciones
   * GET /automations/stats/overview
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStatistics(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
  ): Promise<{
    total: number;
    active: number;
    maintenance: number;
    discontinued: number;
    totalIncidents: number;
    openIncidents: number;
    requesters: string[];
  }> {
    return this.automationsService.getStatistics(userId);
  }
}
