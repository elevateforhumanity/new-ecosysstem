let prisma = null;
function getClient() {
  if (prisma) return prisma;
  try { const { PrismaClient } = require('@prisma/client'); prisma = new PrismaClient(); }
  catch { prisma = null; }
  return prisma;
}

async function saveDirectory(entry) {
  const client = getClient();
  if (!client) {
    (global.__directories || (global.__directories = new Map())).set(entry.id, entry);
    return entry;
  }
  return client.directoryListing.upsert({ where: { id: entry.id }, update: entry, create: entry });
}

async function getDirectory(id) {
  const client = getClient();
  if (!client) return (global.__directories && global.__directories.get(id)) || null;
  return client.directoryListing.findUnique({ where: { id } });
}

async function getDirectories() {
  const client = getClient();
  if (!client) return Array.from((global.__directories || new Map()).values());
  return client.directoryListing.findMany();
}

module.exports = { saveDirectory, getDirectory, getDirectories };
