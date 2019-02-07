import express from 'express';
import path from 'path';
// import NaturalLanguageUnderstandingV1
// from 'watson-developer-cloud/natural-language-understanding/v1';

// const nlu = new NaturalLanguageUnderstandingV1({ version: '2018-11-16' });

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));

app.get('/test', (req, res) => {
  res.send('test ok').end();
});

app.get('/a', (req, res) => {
  /* nlu.analyse({
    url: 'www.ibm.com',
    features: {
      categories: {
        limit: 50,
      },
    },
  }, (err, data) => {
    if (err) res.status(500).send(JSON.stringify(err));
    else res.status(200).send(JSON.stringify(data, null, 2));
  }); */
  res.status(200).send(process.env.VCAP_SERVICES);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000);

export default server;
