import { IsUUID } from 'class-validator';

export class DoctorIdDtoParam {
  @IsUUID()
  doctorId: string;
}
