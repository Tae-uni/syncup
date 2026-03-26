import cron from "node-cron"
import prisma from "../config/prisma"

export const startCleanupJob = () => {
  cron.schedule('0 2 * * 0', async() => {
    const result = await prisma.sync.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[CleanUp] Deleted ${result.count} expired syncs`);
  });

  console.log(`[CleanUp] Sync expiration cleanup job scheduled`);
};