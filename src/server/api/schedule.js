import uuid from 'uuid/v4';
import { getCloudant } from '../ics';

const listeners = [];

const objectEqual = (a, b) => {
  let ret = true;
  Object.keys(a).forEach((key) => {
    if (!ret)
      return;
    if (typeof a[key] === 'object' && typeof b[key] === 'object') {
      ret = objectEqual(a[key], b[key]) ? ret : false;
    }
    else
      ret = a[key] === b[key] ? ret : false;
  });
  ret = Object.keys(a).length === Object.keys(b).length ? ret : false;
  return ret;
};

const getSchedule = () => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  cloudant.db.use('sa-meta').find({ selector: { type: 'schedule' }, fields: ['schedule'] }).then((data) => {
    if (data && data.docs && data.docs.length > 0 && data.docs[0].schedule)
      resolve(data.docs[0].schedule);
    else
      resolve([]);
  }).catch(reject);
});

const registerScheduleListener = (listener) => {
  if (listener instanceof Function)
    listeners.push(listener);
};

const deleteScheduleItem = id => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  cloudant.db.use('sa-meta').find({ selector: { type: 'schedule' } }).then((data) => {
    if (data && data.docs && data.docs.length > 0 && data.docs[0].schedule) {
      const doc = data.docs[0];
      if (doc.schedule.filter(item => item.id === id).length === 0)
        return resolve();
      doc.schedule = doc.schedule.filter(item => item.id !== id);
      listeners.forEach(listener => listener(doc.schedule));
      cloudant.db.use('sa-meta').insert(doc).then(() => resolve(id)).catch(reject);
    }
  }).catch(reject);
});

const addScheduleItem = item => new Promise((resolve, reject) => {
  if (!item
    || (!item.recurring && item.recurring !== false)
    || (!item.task || item.task === '')
    || (!item.occurences || item.occurences.length === 0))
    return reject();
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  cloudant.db.use('sa-meta').find({ selector: { type: 'schedule' } }).then((data) => {
    if (data && data.docs && data.docs.length > 0 && data.docs[0].schedule) {
      const doc = data.docs[0];
      if (!doc.schedule.reduce((acc, val) => {
        if (!acc)
          return acc;
        return objectEqual(item, val);
      }, true)) {
        const nItem = { id: uuid(), ...item };
        doc.schedule.push(nItem);
        listeners.forEach(listener => listener(doc.schedule));
        cloudant.db.use('sa-meta').insert(doc).then(() => resolve(nItem)).catch(reject);
      }
      else
        reject();
    }
  }).catch(reject);
});

export default {
  getSchedule, deleteScheduleItem, addScheduleItem, registerScheduleListener,
};
