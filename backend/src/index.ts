import app from './app';
import { config } from './config';
import { startScheduler } from './services/scheduler';
import { seedDefaultFineTypes } from './services/seedFineTypes';
import { seedAdmins } from './services/seedAdmins';
import { connectDatabase, disconnectDatabase } from './services/prisma';

const start = async () => {
  try {
    // Koble til databasen tidleg — sparar ~2-3s på første request
    await connectDatabase();

    // Seed bottypar viss tabellen er tom (første deploy)
    await seedDefaultFineTypes();

    // Sikre at alle admin-brukarar finst
    await seedAdmins();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);

      // Start automatiske bøter (cron-jobbar)
      startScheduler();
    });

    // Graceful shutdown — rydd opp DB-tilkopling
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} mottatt, avsluttar…`);
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
