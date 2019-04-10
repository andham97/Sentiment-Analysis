import { Router } from 'express';
import ws from '../ws';
import nluProcess from '../ws/nlu';
import API from '../api';

const router = new Router();

router.get('/', (req, res) => {
  API.getWebscraperHosts().then((data) => {
    res.json(data);
  });
});

router.put('/', (req, res) => {
  const requirements = ['hostname', 'headline', 'body', 'sourceID', 'date'];
  if (requirements.filter(e => !req.body[e]).length !== 0)
    return res.status(400).send('Error: requires hostname, headline, body, sourceID and date');
  if (typeof req.body.date !== 'object' || !req.body.date.sel || !req.body.date.function)
    return res.status(400).send('Error: date need to be an object {sel: \'css selector\', function: \'returns date object from date string from selector\'}');
  if (!req.body.exclude)
    req.body.exclude = [];
  API.addWebscraperHost(req.body)
    .then(data => res.json(data))
    .catch(err => res.status(400).send(JSON.stringify(err)));
});

router.post('/', (req, res) => {
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
