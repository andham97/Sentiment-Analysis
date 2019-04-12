import { getCloudant } from '../ics';

const getWordcloud = () => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    reject();
  const find = () => {
    cloudant.db.use('sa-index').search('searches', 'basic-search', {
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
    }).catch((err) => {
      if (err.statusCode === 401 || err.reason.indexOf('_design') || err.reason.indexOf('_reader'))
        find();
      else
        reject(err);
    });
  };
  find();
});

export default { getWordcloud };
