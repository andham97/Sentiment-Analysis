import stt from 'search-text-tokenizer';
import { cloudant } from '../ics';

const db = cloudant.db.use('sa-index');

const search = (query, options) => new Promise((resolve, reject) => {
  if (query === '')
    return reject({ code: 400, err: new Error('Error: Empty query not supported') });
  const tokens = stt(query);
  const includes = tokens.filter(token => !token.exclude).map(token => token.term.replace(/[^a-zA-Z\s]/g, ''));
  const regex = includes.reduce((acc, val, i) => `${i === 0 ? '(' : ''}${acc + val}${i === includes.length - 1 ? ')' : '|'}`, '');
  try {
    RegExp(regex);
  }
  catch (e) {
    return reject({ code: 400, err: new Error('Error: Invalid query parameters') });
  }
  const opts = {
    selector: {
      $or: [
        {
          'analysis.text': {
            $regex: `(?i)${regex}`,
          },
        },
      ],
    },
    fields: [
      '_id',
      'date',
      'headline',
      'analysis',
      'url',
    ],
    sort: [
      {
        date: 'desc',
      },
    ],
    limit: 10000,
  };
  if (options.bookmark)
    opts.bookmark = options.bookmark;
  db.find(opts).then((data) => {
    console.log(`${regex} => ${data.docs.length}`);
    resolve({ ...data, params: includes });
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
