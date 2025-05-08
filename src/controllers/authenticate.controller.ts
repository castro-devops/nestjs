import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type TAuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/authenticate')
export class AuthenticateController {
  constructor(
    private db: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async auth(@Body() body: TAuthenticateBodySchema) {
    const { email, password } = body;

    const user = await this.db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        `Não conseguimos encontrar um cadastro para o e-mail ${email}. Que tal criar uma conta agora?`,
      );
    }

    const passwordValid = await compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException(
        `O ${user.name} é você? Não conseguimos identificar a senha informada.`,
      );
    }

    const accessToken = this.jwt.sign({ sub: user.id });

    return {
      access_token: accessToken,
    };
  }
}
