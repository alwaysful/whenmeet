import { IsString, Length } from 'class-validator';

export class InviteCodeDto {
  @IsString()
  @Length(6, 20)
  inviteCode: string;
}