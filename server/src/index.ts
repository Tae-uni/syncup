import express from 'express';
import cors from 'cors';

import syncRoutes from './features/sync/routes';
import { errorHandler } from './middlewares/errorHandler';
import { startCleanupJob } from './jobs/cleanupExpiredSyncs';
import { setupSwagger } from './config/swagger';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json({ limit: "10kb" }));

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
