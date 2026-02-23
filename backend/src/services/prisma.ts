import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/** Koble til databasen tidleg slik at første request ikkje må vente */
export async function connectDatabase() {
  const start = Date.now();
  await prisma.$connect();
  console.log(`🗄️  Database tilkopla (${Date.now() - start}ms)`);
}

/** Graceful disconnect */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🗄️  Database fråkopla');
}

export default prisma;
