import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createUser({ email, password, name, role }) {
  return await prisma.lmsUser.create({ data: { email, password, name, role } });
}

export async function getUserByEmail(email) {
  return await prisma.lmsUser.findUnique({ where: { email } });
}

export async function updateUser(email, data) {
  return await prisma.lmsUser.update({ where: { email }, data });
}
