import { Router } from 'express';
import { getWordCloud } from '../api';

const router = new Router();

router.get('/', (req, res) => {
  getWordCloud().then((data) => {
    if (req.query.length)
      res.json(data.slice(0, req.query.length));
    else
      res.json(data);
  }).catch((err) => {
    res.status(500).send(JSON.stringify(err));
  });
});

export default router;
