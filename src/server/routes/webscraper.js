import { Router } from 'express';
import rp from 'request-promise';
import dotenv from 'dotenv';
import ws from '../ws';
import nluProcess from '../ws/nlu';
import API from '../api';
import { isWhitelisted } from './auth';

dotenv.config();

const router = new Router();

router.get('/hosts', (req, res) => {
  API.getWebscraperHosts().then((data) => {
    res.json(data);
  }).catch((err) => {
    console.log(err);
    res.status(500).send('ERROR');
  });
});

router.get('/urlCount', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  API.urlCount().then((data) => {
    res.json({ count: data });
  }).catch((err) => {
    console.log(err);
    res.status(500).send('ERROR');
  });
});

router.get('/termCount', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  API.termCount().then((data) => {
    res.json({ count: data });
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
  const requirements = ['hostnames', 'hostDeletions', 'name', 'headlines', 'body', 'sourceID', 'exclude', 'date.sel', 'date.function'];
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

router.post('/fetchNews', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  if (!req.body.sources)
    return res.status(400).send('No sources provided');
  API.getNewsSourceURLs(req.body.sources).then((urls) => {
    const len = urls.length;
    API.urlCheck(urls).then((list) => {
      console.log(`${list.length}/${len}`);
      res.status(200).send(`${list.length}/${len}`);
      if (list.length > 0) {
        ws(list, (data) => {
          if (!data)
            return;
          console.log('PROCESS');
          nluProcess(data, (err) => {
            if (err) {
              console.log('NLU');
              return console.error(JSON.stringify(err));
            }
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
  });
});

router.post('/', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  if (!req.body.urls)
    return res.status(400).send('No provided URLs');
  console.log('Performing URL validation');
  if (typeof req.body.urls === 'string')
    req.body.urls = [req.body.urls];
  if (req.body.urls.filter(url => typeof url !== 'string').length > 0)
    return res.status(400).send('Invalid URL');
  const len = req.body.urls.length;
  API.urlCheck(req.body.urls).then((list) => {
    console.log(`${list.length}/${len}`);
    if (list.length > 0) {
      ws(list, (data) => {
        if (!data)
          return;
        nluProcess(data, (err) => {
          if (err) {
            setTimeout(() => {
              if (!res.headersSent)
                res.status(500).send('Error');
            }, 500);
            return console.error(JSON.stringify(err));
          }
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
