import { Router } from 'express';
import API from '../../api';

const router = new Router();

router.get('/', (req, res) => {
  API.getSchedule().then((data) => {
    res.json(data);
  }).catch((err) => {
    if (!global.__DEV__)
      console.error(err);
    res.status(500).send('ERROR');
  });
});

router.post('/', (req, res) => {
  const { task, recurring, occurences } = req.body;
  if (!task
    || typeof task !== 'string'
    || (!recurring && recurring !== false)
    || typeof recurring !== 'boolean'
    || !occurences
    || typeof occurences !== 'object'
    || !occurences.filter
    || occurences.filter(item => (!item.hour && item.hour !== 0)
      || (!item.minute && item.minute !== 0)
      || (!item.second && item.second !== 0)).length > 0)
    return res.status(400).send('Invalid request');
  API.addScheduleItem({
    task,
    recurring,
    occurences,
  }).then((item) => {
    res.json(item);
  }).catch((err) => {
    if (!global.__DEV__)
      console.error(err);
    res.status(500).send('ERROR');
  });
});

router.delete('/:id', (req, res) => {
  API.deleteScheduleItem(req.params.id).then((uid) => {
    res.json(uid);
  }).catch((err) => {
    if (!global.__DEV__)
      console.error(err);
    res.status(500).send('ERROR');
  });
});

export default router;
