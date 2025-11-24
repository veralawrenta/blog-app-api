
import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../utils/password";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDTO } from "./dto/register.dto";


export class AuthService {
    prisma: PrismaService;


    constructor() {
        this.prisma = new PrismaService; // karna itu kelas jadi di constructor jadi new prismaservice
    }
    register = async (body: RegisterDTO) => {
        const user = await this.prisma.user.findUnique({
            where: {
                email: body.email}
            })
            if (user) throw new ApiError ("email is already exist", 400);

            const hashedPassword = await hashPassword(body.password);

              await this.prisma.user.create({
        data: {
        ...body,
        password: hashedPassword,
        },
    });
        return { message: "register success"}
    }
}