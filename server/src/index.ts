import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import syncRoutes from './features/sync/routes';
import { errorHandler } from './middlewares/errorHandler';
import { globalRateLimit } from './middlewares/rateLimiters';
import { startCleanupJob } from './jobs/cleanupExpiredSyncs';
import { setupSwagger } from './config/swagger';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: "10kb" }));
app.use(globalRateLimit);

app.use('/api/sync', syncRoutes);
setupSwagger(app);
app.use(errorHandler);
app.get('/', (_req, res) => {
  res.send("TypeScript Express Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  startCleanupJob();
});
