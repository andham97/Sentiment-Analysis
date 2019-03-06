import express from 'express';
import path from 'path';

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));

app.get('/test', (req, res) => {
  res.send('test ok').end();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000, () => {
  process.stdout.write(`listening on port ${process.env.PORT || 3000}`);
});

export default server;
