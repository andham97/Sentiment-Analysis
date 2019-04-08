import { cloudant } from '../ics';

const db = cloudant.db.use('sa-index');

const search = (query, options) => new Promise((resolve, reject) => {
  db.search('searches', 'basic-search', {
    q: `key:${query}`,
    include_docs: true,
    limit: options.limit,
    bookmark: options.bookmark,
  }).then((data) => {
    resolve(data);
  }).catch(reject);
});

const fetchAll = (query, options) => new Promise((resolve, reject) => {
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

export default { search, fetchAll };
