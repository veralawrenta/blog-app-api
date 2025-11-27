import { ApiError } from "../../utils/api-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { sign } from "jsonwebtoken";

export class AuthService {
  prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService(); // karna itu kelas jadi di constructor jadi new prismaservice
  }
  register = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (user) throw new ApiError("email is already exist", 400);

    const hashedPassword = await hashPassword(body.password);

    await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
      },
    });

    return { message: "register success" };
  };

  login = async (body: LoginDTO) => {
    //1. cek dulu emailnya ada di db atau ga
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    //2. kalo ga ada, throw error
    if (!user) throw new ApiError("invalid credentials", 400);

    //3. kalo ada, cocokin passwordnya
    const isPasswordValid = await comparePassword(body.password, user.password);

    //4. kalo ga cocok, throw error
    if (!isPasswordValid) throw new ApiError("invalid credentials", 400); //buatin return sama supaya hacker gatau

    //5. kalo cocok, generate token menggunakan jwt // jwt juga bisa ke transaction
    const payload = { id: user.id }; //biasanya diisi antara id dan role.
    const accessToken = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    //6. return data user beserta access token
    const { password, ...userWithoutPassword } = user; //supaya password ga ke return
    return { ...userWithoutPassword, accessToken };
  };
}
