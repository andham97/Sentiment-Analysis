import { Router } from 'express';
import ws from '../ws';
import nluProcess from '../ws/nlu';
import { addWebScraperHost, urlCheck } from '../api';

const router = new Router();

router.put('/api/ws', (req, res) => {
  const requirements = ['hostname', 'headline', 'body', 'sourceID', 'date'];
  if (requirements.filter(e => !req.body[e]).length !== 0)
    return res.status(400).send('Error: requires hostname, headline, body, sourceID and date');
  if (typeof req.body.date !== 'object' || !req.body.date.sel || !req.body.date.function)
    return res.status(400).send('Error: date need to be an object {sel: \'css selector\', function: \'returns date object from date string from selector\'}');
  if (!req.body.exclude)
    req.body.exclude = [];
  addWebScraperHost(req.body)
    .then(data => res.json(data))
    .catch(err => res.status(400).send(JSON.stringify(err)));
});

router.post('/api/ws', (req, res) => {
  console.log('Performing URL validation');
  const len = req.body.urls.length;
  urlCheck(req.body.urls).then((list) => {
    console.log(`${list.length}/${len}`);
    if (list.length > 0) {
      ws(list).then((data) => {
        nluProcess(data, (err) => {
          if (err)
            console.error(JSON.stringify(err));
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
  res.status(200).send('Success');
});

export default router;
