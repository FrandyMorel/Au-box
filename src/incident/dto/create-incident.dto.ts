import {
  IsString,
  IsInt,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

//IsOptional,

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  readonly description: string;

  @IsInt()
  @IsNotEmpty()
  readonly automationId: number;

  @IsInt()
  @IsNotEmpty()
  readonly userId: number;

  constructor(
    name: string,
    description: string,
    automationId: number,
    userId: number,
  ) {
    this.name = name;
    this.description = description;
    this.automationId = automationId;
    this.userId = userId;
  }
}
