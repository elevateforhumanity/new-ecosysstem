import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function saveLead(entry) {
  // entry: { name, email, ... }
  return await prisma.lead.create({ data: entry });
}

export async function getLeads() {
  return await prisma.lead.findMany();
}

// Extend with update/delete as needed
