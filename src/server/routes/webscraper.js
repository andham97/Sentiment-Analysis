import { Router } from 'express';
import rp from 'request-promise';
import dotenv from 'dotenv';
import Schedule from './ws/schedule';
import ws from '../ws';
import nluProcess from '../ws/nlu';
import API from '../api';
import { isWhitelisted } from './auth';

dotenv.config();

const router = new Router();

router.use('/schedule', (req, res, next) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  next();
});

router.use('/schedule', Schedule);

router.get('/hosts', (req, res) => {
  API.getWebscraperHosts().then((data) => {
    res.json(data);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('ERROR');
  });
});

router.get('/sources', (req, res) => {
  API.getWebscraperSources()
    .then(data => res.json(data))
    .catch(() => res.status(500).send('ERROR'));
});

router.get('/urlCount', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  API.urlCount().then((data) => {
    res.json({ count: data });
  }).catch((err) => {
    console.error(err);
    res.status(500).send('ERROR');
  });
});

router.get('/load', (req, res) => {
  if (!req.query.url)
    return res.status(400).send('');
  rp(req.query.url)
    .then(data => res.status(200).json({ statusCode: 200, data }))
    .catch(err => res.status(err.statusCode || 500).json(err));
});

/**
 * Clone the provided object
 *
 * @function clone
 * @param  {Object} object
 * @returns {Object}
 */
const clone = object => JSON.parse(JSON.stringify(object));

/**
 * Get value from object pattern
 *
 * @function patternExists
 * @param  {Object}      object
 * @param  {string}      pattern
 * @returns {*}
 */
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
  const requirements = ['hostnames', 'hostDeletions', 'name', 'headlines', 'body', 'sourceID', 'exclude', 'date.sel', 'date.fn', 'validationURL'];
  if (requirements.filter(e => !patternExists(req.body, e)).length !== 0)
    return res.status(400).send('Error: requires hostname, headline, body, sourceID and date');
  if (!req.body.exclude)
    req.body.exclude = [];
  rp(req.body.validationURL)
    .then(() => API.updateWebscraperHost(req.body)
      .then(data => res.json(data))
      .catch(err => res.status(400).send(JSON.stringify(err))))
    .catch(err => res.status(err.statusCode || 500).json(err));
});

router.post('/fetchNews', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  if (!req.body.sources)
    return res.status(400).send('No sources provided');
  API.getNewsSourceURLs(req.body.sources).then((urls) => {
    API.urlCheck(urls).then((list) => {
      res.status(200).json(list.length);
      if (list.length > 0) {
        ws(list, (data) => {
          if (!data)
            return;
          nluProcess(data, (err) => {
            if (err)
              return console.error(err);
          });
        });
      }
    }).catch((err) => {
      console.error(err);
      setTimeout(() => {
        if (!res.headersSent)
          res.status(200).send('Success');
      }, 500);
    });
  }).catch(() => {
    setTimeout(() => {
      if (!res.headersSent)
        res.status(200).send('Success');
    }, 500);
  });
});

router.post('/', (req, res) => {
  if (!isWhitelisted(req) && req.headers.api_key !== process.env.SCRAPER_API_KEY)
    return res.status(403).send('Access denied');
  if (!req.body.urls)
    return res.status(400).send('No provided URLs');
  if (typeof req.body.urls === 'string')
    req.body.urls = [req.body.urls];
  if (req.body.urls.filter(url => typeof url !== 'string').length > 0)
    return res.status(400).send('Invalid URL');
  API.urlCheck(req.body.urls).then((list) => {
    res.status(200).send(list.length);
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
            return console.error(err);
          }
        });
      });
    }
    else {
      setTimeout(() => {
        if (!res.headersSent)
          res.status(200).send('Success');
      }, 500);
    }
  }).catch((err) => {
    console.error(err);
    setTimeout(() => {
      if (!res.headersSent)
        res.status(200).send('Success');
    }, 500);
  });
});

export default router;
