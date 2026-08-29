import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateIncidentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  readonly description?: string;

  constructor(name?: string, description?: string) {
    this.name = name;
    this.description = description;
  }
}
