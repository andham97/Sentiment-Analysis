import { getCloudant } from '../ics';
import API from '../api';

/**
 * Get the words for the wordcloud
 *
 * @function getWordcloud
 * @returns {Array<Object>}
 */
const getWordcloud = () => new Promise((resolve, reject) => {
  if (!getCloudant())
    reject();
  const find = () => {
    getCloudant().db.use('sa-index').search('searches', 'basic-search', {
      q: '*:*',
      counts: ['key'],
      limit: 0,
    }).then((data) => {
      API.getSources().then((sources) => {
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
        resolve(result
          .filter(o => sources
            .filter(source => source.key === o.key || source.value === o.key).length === 0));
      });
    }).catch((err) => {
      if (err.statusCode === 401 || (err.reason && err.reason.indexOf('_design')) || (err.reason && err.reason.indexOf('_reader')))
        find();
      else
        reject(err);
    });
  };
  find();
});

export default { getWordcloud };
