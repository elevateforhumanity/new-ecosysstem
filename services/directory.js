import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function saveDirectory(entry) {
  return await prisma.directoryListing.upsert({
    where: { id: entry.id },
    update: entry,
    create: entry
  });
}

export async function getDirectory(id) {
  return await prisma.directoryListing.findUnique({ where: { id } });
}

export async function getDirectories() {
  return await prisma.directoryListing.findMany();
}
