import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findOneById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
