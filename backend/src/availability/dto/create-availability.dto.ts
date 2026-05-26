import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsDate, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum PreferenceType {
  GOOD = 'GOOD',
  NEUTRAL = 'NEUTRAL',
  BAD = 'BAD',
}

export class DatePreferenceItemDto {
  @ApiProperty({ description: '날짜', example: '2024-01-15' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ enum: PreferenceType, example: 'GOOD' })
  @IsEnum(PreferenceType)
  preference: PreferenceType;
}

export class CreateAvailabilityDto {
  @ApiProperty({ description: '방 ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ type: [DatePreferenceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DatePreferenceItemDto)
  preferences: DatePreferenceItemDto[];
}
