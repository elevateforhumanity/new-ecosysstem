// Converted to CommonJS for compatibility with simple-server.cjs test harness
let prisma = null;
function getClient() {
  if (prisma) return prisma;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  } catch { prisma = null; }
  return prisma;
}

async function saveLead(entry) {
  const client = getClient();
  if (!client) {
    // Fallback: in-memory noop
    return { id: 'memory', ...entry };
  }
  return client.lead.create({ data: entry });
}

async function getLeads() {
  const client = getClient();
  if (!client) return [];
  return client.lead.findMany();
}

module.exports = { saveLead, getLeads };
