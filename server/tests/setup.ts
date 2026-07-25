import { afterAll, beforeEach } from "vitest";
import prisma from "../src/config/prisma";

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Vote", "Participant", "TimeOption", "Sync" RESTART IDENTITY CASCADE;'
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});