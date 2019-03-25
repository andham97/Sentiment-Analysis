import { cloudant } from './ics';

const db = cloudant.db.use('sa-index');

export default () => new Promise((resolve) => {
  resolve('Default import not supported');
});

export const getWordCloud = () => new Promise((resolve, reject) => {
  db.search('searches', 'basic-search', {
    q: '*:*',
    counts: ['key'],
    limit: 1,
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

export const urlCheck = urls => new Promise((resolve, reject) => {
  let arr = urls;
  if (typeof arr === 'string')
    arr = [arr];

  db.view('searches', 'url-view', {
    group: true,
  }).then((data) => {
    const u = data.rows.map(row => row.key);
    for (let i = 0; i < arr.length; i += 1) {
      if (u.indexOf(arr[i]) > -1) {
        arr.splice(i, 1);
        i -= 1;
      }
    }
    resolve(arr);
  }).catch(reject);
});

export const search = (query, options) => new Promise((resolve, reject) => {
  db.search('searches', 'basic-search', {
    q: `key:${query}`,
    include_docs: true,
    limit: options.limit,
    bookmark: options.bookmark,
  }).then((data) => {
    resolve(data);
  }).catch(reject);
});

export const fetchAll = (query, options) => new Promise((resolve, reject) => {
  let data = [];
  options.limit = 200;
  const cb = (d) => {
    data = data.concat(d.rows);
    if (data.length === d.total_rows)
      return resolve(data);
    options.bookmark = d.bookmark;
    search(query, options).then(cb).catch(reject);
  };
  search(query, options).then(cb).catch(reject);
});