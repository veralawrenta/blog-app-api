import cron from "node-cron";
import { TransactionStatus } from "../generated/prisma/client";
import { PrismaService } from "../modules/prisma/prisma.service";

export const checkExpiredTransactionScheduler = () => {
  const prisma = new PrismaService();

  cron.schedule("*/30 * * * * *", async () => {
    console.log("[CRON] Checking expired transactions...");

    const TWO_HOURS = 1000 * 60 * 60 * 2;
    const now = Date.now();

    try {
      // 1. Ambil transaksi WAITING_FOR_PAYMENT
      const waitingTransactions = await prisma.transaction.findMany({
        where: { status: TransactionStatus.WAITING_FOR_PAYMENT },
        select: { id: true, eventId: true, quantity: true, createdAt: true },
      });

      if (waitingTransactions.length === 0) {
        console.log("[CRON] No waiting transactions found.");
        return;
      }

      // 2. Filter yg lewat 2 jam
      const expiredTransactions = waitingTransactions.filter((trx) => {
        return now - trx.createdAt.getTime() > TWO_HOURS;
      });

      if (expiredTransactions.length === 0) {
        console.log("[CRON] No expired transactions.");
        return;
      }

      const expiredIds = expiredTransactions.map((t) => t.id);

      // 3. Update status menjadi EXPIRED
      await prisma.transaction.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: TransactionStatus.EXPIRED },
      });

      // 4. Kembalikan seat ke Event
      //    Group by eventId untuk menghindari update berkali-kali
      const seatRestoreMap: Record<number, number> = {};

      expiredTransactions.forEach((trx) => {
        if (!seatRestoreMap[trx.eventId]) seatRestoreMap[trx.eventId] = 0;
        seatRestoreMap[trx.eventId] += trx.quantity;
      });

      // Update seat satu per eventId
      const eventIds = Object.keys(seatRestoreMap).map(Number);
      for (const eventId of eventIds) {
        const qtyToRestore = seatRestoreMap[eventId];

        await prisma.event.update({
          where: { id: eventId },
          data: {
            availableSeat: {
              increment: qtyToRestore,
            },
          },
        });

        console.log(
          `[CRON] Restored ${qtyToRestore} seats to eventId=${eventId}`
        );
      }

      console.log(
        `[CRON] Marked ${expiredIds.length} transactions as EXPIRED and restored seats.`
      );
    } catch (error) {
      console.error("[CRON ERROR] Failed to check expired transactions", error);
    }
  });
};