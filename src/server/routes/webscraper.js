import { Router } from 'express';
import rp from 'request-promise';
import ws from '../ws';
import nluProcess from '../ws/nlu';
import API from '../api';
import { isWhitelisted } from './auth';

const router = new Router();

router.get('/hosts', (req, res) => {
  API.getWebscraperHosts().then((data) => {
    res.json(data);
  }).catch((err) => {
    console.log(err);
    res.status(500).send('ERROR');
  });
});

router.get('/load/:url', (req, res) => {
  rp(req.params.url)
    .then(data => res.status(200).send(data))
    .catch(err => res.status(400).send(err));
});

const clone = object => JSON.parse(JSON.stringify(object));

const patternExists = (object, pattern) => {
  let temp = clone(object);
  pattern.split('.').forEach((key) => {
    if (!temp)
      return;
    temp = temp[key];
  });
  return temp;
};

router.post('/hosts', (req, res) => {
  const requirements = ['hostnames', 'hostDeletions', 'name', 'headline', 'body', 'sourceID', 'exclude', 'date.sel', 'date.function'];
  if (requirements.filter(e => !patternExists(req.body, e)).length !== 0)
    return res.status(400).send('Error: requires hostname, headline, body, sourceID and date');
  if (!req.body.exclude)
    req.body.exclude = [];
  API.updateWebscraperHost(req.body)
    .then(data => res.json(data))
    .catch((err) => {
      console.log(err);
      res.status(400).send(JSON.stringify(err));
    });
});

router.post('/', (req, res) => {
  if (!req.user || !isWhitelisted(req.user))
    return res.status(403).send('Access denied');
  console.log('Performing URL validation');
  const len = req.body.urls.length;
  API.urlCheck(req.body.urls).then((list) => {
    console.log(`${list.length}/${len}`);
    if (list.length > 0) {
      ws(list).then((data) => {
        nluProcess(data, (err) => {
          if (err)
            return console.error(JSON.stringify(err));
          console.log('NLU processing finished');
          setTimeout(() => {
            if (!res.headersSent)
              res.status(200).send('Success');
          }, 500);
        });
      });
    }
    else {
      console.log('No new articles');
      setTimeout(() => {
        if (!res.headersSent)
          res.status(200).send('Success');
      }, 500);
    }
  }).catch((err) => {
    console.error(err);
  });
});

export default router;
