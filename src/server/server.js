import express from 'express';
import path from 'path';
import ws from './ws';
import nluProcess from './ws/nlu';
import search from './search';

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));
app.use(express.json());

app.get('/api/wordcloud', (req, res) => {
  search.wordcloud.get().then((data) => {
    res.json(data);
  }).catch((err) => {
    res.status(500).send(JSON.stringify(err));
  });
});

app.get('/api/ws', (req, res) => {
  ws([req.query.url]).then((data) => {
    nluProcess(data, (err, result) => {
      if (err)
        return res.status(500).send(JSON.stringify(err));
      res.json(result);
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000, () => {
  process.stdout.write(`listening on port ${process.env.PORT || 3000}\n`);
});

export default server;
