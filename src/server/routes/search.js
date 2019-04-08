import { Router } from 'express';
import API from '../api';

const router = new Router();

router.get('/', (req, res) => {
  if (req.query.q && !req.query.query)
    req.query.query = req.query.q;
  if (!req.query.limit)
    req.query.limit = 10;
  API.search(req.query.query, req.query)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify(err));
    });
});

export default router;
