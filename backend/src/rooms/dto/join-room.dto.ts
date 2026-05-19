import { IsString, Length } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @Length(6, 6)
  inviteCode: string;
}