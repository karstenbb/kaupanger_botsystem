import app from './app';
import { config } from './config';
import { startScheduler } from './services/scheduler';
import { seedDefaultFineTypes } from './services/seedFineTypes';

const start = async () => {
  try {
    // Seed bottypar viss tabellen er tom (første deploy)
    await seedDefaultFineTypes();

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);

      // Start automatiske bøter (cron-jobbar)
      startScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
