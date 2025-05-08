import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserPayload } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

@Controller('/questions')
export class CreateQuestionController {
  constructor(private db: PrismaService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async handle(
    @Body(new ZodValidationPipe(createQuestionBodySchema))
    body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body;
    const authorId = user.sub;

    const slug = this.convertSlug(title);

    await this.db.question.create({
      data: {
        authorId,
        title,
        content,
        slug,
      },
    });
  }

  convertSlug(text: string): string {
    return text
      .normalize('NFKD')
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+/g, '-')
      .replace(/_+/g, '-')
      .replace(/-$/, '');
  }
}
