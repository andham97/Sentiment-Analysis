import { Router } from 'express';
import stt from 'search-text-tokenizer';
import API from '../api';

const router = new Router();

router.get('/sources', (req, res) => {
  API.getSources().then((data) => {
    res.json(data);
  }).catch((err) => {
    console.error(err);
    res.status(err.code || 500).send(err.err ? (err.err.message || 'ERROR') : 'ERROR');
  });
});

router.get('/', (req, res) => {
  if (req.query.q && !req.query.query)
    req.query.query = req.query.q;
  if (!req.query.query || stt(req.query.query).length === 0)
    return res.status(400).send('No search provided');
  API.search(req.query.query, req.query)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(err.code || 500).send(err.err ? (err.err.message || 'ERROR') : 'ERROR');
    });
});

export default router;
