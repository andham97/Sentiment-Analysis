import { cloudant } from '../ics';

const db = cloudant.db.use('sa-index');

const getWordcloud = () => new Promise((resolve, reject) => {
  db.search('searches', 'basic-search', {
    q: '*:*',
    counts: ['key'],
    limit: 0,
  }).then((data) => {
    const arr = data.counts.key;
    const result = [];

    Object.entries(arr).forEach((entry) => {
      result.push({ key: entry[0], value: entry[1] });
    });
    result.sort((a, b) => {
      if (a.value < b.value)
        return 1;
      if (a.value > b.value)
        return -1;
      if (a.key < b.key)
        return -1;
      if (a.key > b.key)
        return 1;
      return 0;
    });
    resolve(result);
  }).catch(reject);
});

export default { getWordcloud };
