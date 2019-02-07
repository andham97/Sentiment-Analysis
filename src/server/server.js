import express from 'express';
import path from 'path';
import NLUV1 from 'watson-developer-cloud/natural-language-understanding/v1';
import cfenv from 'cfenv';
import fs from 'fs';

const appEnv = cfenv.getAppEnv();

let nluParameters;
if (appEnv.isLocal) {
  nluParameters = JSON.parse(fs.readFileSync('.ibm-credentials', 'utf8'))['natural-language-understanding'][0].credentials;
}
else {
  nluParameters = process.env.VCAP_SERVICES['natural-language-understanding'][0].credentials;
}
nluParameters.version = '2018-11-16';
nluParameters.iam_apikey = nluParameters.apikey;

const nlu = new NLUV1(nluParameters);

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));

app.get('/test', (req, res) => {
  res.send('test ok').end();
});

app.get('/a', (req, res) => {
  nlu.analyze({
    url: 'https://edition.cnn.com/2019/02/05/middleeast/john-cantlie-isis-alive-intl/index.html',
    features: {
      keywords: {
        limit: 50,
      },
    },
  }, (err, data) => {
    if (err) res.status(500).send(JSON.stringify(err));
    else res.status(200).send(JSON.stringify(data, null, 2));
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on port ${process.env.PORT || 3000}`);
});

export default server;
