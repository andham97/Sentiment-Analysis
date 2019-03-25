import express from 'express';
import path from 'path';
import ws from './ws';
import nluProcess from './ws/nlu';
import { getWordCloud, search, urlCheck } from './api';

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));
app.use(express.json());

app.get('/api/wordcloud', (req, res) => {
  getWordCloud().then((data) => {
    res.json(data);
  }).catch((err) => {
    res.status(500).send(JSON.stringify(err));
  });
});

app.get('/api/search', (req, res) => {
  search(req.query.query, req.query)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(`ERROR: ${JSON.stringify(err, null, 2)}`);
      res.status(500).send(JSON.stringify(err));
    });
});

app.post('/api/ws', (req, res) => {
  console.log('Performing URL validation');
  const len = req.body.urls.length;
  urlCheck(req.body.urls).then((list) => {
    console.log(`${list.length}/${len}`);
    if (list.length > 0) {
      ws(list).then((data) => {
        nluProcess(data, (err) => {
          if (err)
            console.error(JSON.stringify(err));
          console.log('NLU processing finished');
        });
      });
    }
    else {
      console.log('No new articles');
    }
  }).catch((err) => {
    console.error(err);
  });
  res.status(200).send('Success');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000, () => {
  process.stdout.write(`listening on port ${process.env.PORT || 3000}\n`);
});

export default server;
