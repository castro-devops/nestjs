import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

type TCreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

@Controller('/accounts')
export class CreateAccountController {
  constructor(private db: PrismaService) {}
  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: TCreateAccountBodySchema) {
    const { name, email, password } = body;

    const userWithSameEmail = await this.db.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new ConflictException(
        `Você é o ${userWithSameEmail.name}? Realize login caso essa seja a sua conta.`,
      );
    }

    const hashedPassword = await hash(password, 8);

    await this.db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  }
}
