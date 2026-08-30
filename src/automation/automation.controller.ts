import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AutomationsService } from './automation.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import {
  IAutomationResponse,
  IPaginatedResponse,
  IDeleteResponse,
  IStatisticsResponse,
} from './interfaces/automation.interface';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { SearchAndFilterDto } from './dto/search-filter.dto';

@Controller('automations')
@UseGuards(JwtGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  async create(
    @Body() createAutomationDto: CreateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.create(createAutomationDto, userId);
  }

  @Get()
  async findAll(
    @Query() query: SearchAndFilterDto,
    @GetUser('sub') userId: number,
  ): Promise<IPaginatedResponse<IAutomationResponse>> {
    return this.automationsService.findAll(query, userId);
  }

  @Get('statistics')
  async getStatistics(
    @GetUser('sub') userId: number,
  ): Promise<IStatisticsResponse> {
    return this.automationsService.getStatistics(userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.findOne(Number(id), userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAutomationDto: UpdateAutomationDto,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.update(
      Number(id),
      updateAutomationDto,
      userId,
    );
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser('sub') userId: number,
  ): Promise<IAutomationResponse> {
    return this.automationsService.updateStatus(Number(id), status, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetUser('sub') userId: number,
  ): Promise<IDeleteResponse> {
    return this.automationsService.delete(Number(id), userId);
  }
}
