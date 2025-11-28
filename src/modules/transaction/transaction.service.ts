import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";

export class TransactionService {
  prisma: PrismaService;
 

  constructor() {
    this.prisma = new PrismaService();
  }

  createTransaction = async (
    body: CreateTransactionDTO,
    authUserId: number
  ) => {
    const { eventId, quantity } = body;

    return this.prisma.$transaction(async (tx) => {
      // 1. cek event ada
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new ApiError("Event not found", 404);
      }

      // 2. cek seat cukup
      if (event.availableSeat < quantity) {
        throw new ApiError("Not enough available seats", 400);
      }

      // 3. create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: authUserId,
          eventId,
          quantity,
          price: event.price,
        },
      });

      // 4. decrement seat
      await tx.event.update({
        where: { id: eventId },
        data: {
          availableSeat: {
            decrement: quantity,
          },
        },
      });

      return transaction;
    });
  };
}