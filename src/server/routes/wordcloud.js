import { Router } from 'express';
import API from '../api';

const router = new Router();

router.get('/', (req, res) => {
  API.getWordcloud().then((data) => {
    if (req.query.length)
      res.json(data.slice(0, req.query.length));
    else
      res.json(data);
  }).catch((err) => {
    if (!global.__DEV__)
      console.error(err);
    res.status(500).send(JSON.stringify(err));
  });
});

export default router;
