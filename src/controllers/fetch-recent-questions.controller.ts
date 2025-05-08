import { Controller, Get, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('/recents')
export class FetchRecentQuestionsController {
  constructor(private db: PrismaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async handle() {
    const questions = await this.db.question.findMany({
      take: 1,
    });

    return {
      questions,
    };
  }
}
