import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleType, User } from '@prisma/client';
import { AdminUsersService } from '../services/admin.users.service';
import { JwtAuthGuard } from '@app/security';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly _adminUsersService: AdminUsersService) {}

  @Get()
  async listUsers(): Promise<User[]> {
    return this._adminUsersService.listUsers();
  }
}
