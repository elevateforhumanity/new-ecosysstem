import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function saveAffiliate(entry) {
  return await prisma.affiliate.upsert({
    where: { code: entry.code },
    update: entry,
    create: entry
  });
}

export async function getAffiliate(code) {
  return await prisma.affiliate.findUnique({ where: { code } });
}

export async function getAffiliates() {
  return await prisma.affiliate.findMany();
}
