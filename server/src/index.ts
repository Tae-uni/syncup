import express from 'express';

const app = express();
const PORT = process.env.PORT || 5002;

app.get('/', (_req, res) => {
  res.send("TypeScript Express Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
