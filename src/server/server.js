import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.send('test ok').end();
});

const server = app.listen(process.env.PORT || 3000);

export default server;
