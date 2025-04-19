import express from 'express';
import cors from 'cors';

import syncRoutes from './features/sync/routes';

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.use('/api/sync', syncRoutes);

app.get('/', (_req, res) => {
  res.send("TypeScript Express Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
