let prisma = null;
function getClient() {
  if (prisma) return prisma;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch { prisma = null; }
  return prisma;
}

async function createUser({ email, password, name, role }) {
  const client = getClient();
  if (!client) {
    // memory fallback
    const rec = { id: 'mem-' + Date.now(), email, password, name, role };
    (global.__users || (global.__users = new Map())).set(email, rec);
    return rec;
  }
  return client.lmsUser.create({ data: { email, password, name, role } });
}

async function getUserByEmail(email) {
  const client = getClient();
  if (!client) return (global.__users && global.__users.get(email)) || null;
  return client.lmsUser.findUnique({ where: { email } });
}

async function updateUser(email, data) {
  const client = getClient();
  if (!client) {
    if (global.__users && global.__users.has(email)) {
      const cur = global.__users.get(email);
      const updated = { ...cur, ...data };
      global.__users.set(email, updated);
      return updated;
    }
    return null;
  }
  return client.lmsUser.update({ where: { email }, data });
}

module.exports = { createUser, getUserByEmail, updateUser };
