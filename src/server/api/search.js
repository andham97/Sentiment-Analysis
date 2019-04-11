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
  let sources = '';
  let sourceRegex = '';
  if (options && options.sources && typeof options.sources === 'string') {
    sources = options.sources;
    sources = sources.split(',').join(' ');
  }
  else if (options && options.sources && options.sources.join)
    sources = options.sources.join(' ');
  if (sources === '')
    sourceRegex = '.+';
  else {
    const sTokens = stt(sources);
    const sourceList = sTokens.filter(token => !token.exclude).map(token => token.term.replace(/[^a-zA-Z-]/g, ''));
    sourceRegex = sourceList.reduce((acc, val, i) => `${i === 0 ? '(' : ''}${acc + val}${i === sourceList.length - 1 ? ')' : '|'}`, '');
    try {
      RegExp(sourceRegex);
    }
    catch (e) {
      return reject({ code: 400, err: new Error('Error: Invalid query parameters') });
    }
  }
  const opts = {
    selector: {
      $and: [
        {
          'analysis.text': {
            $regex: `(?i)${regex}`,
          },
        },
        {
          sourceID: {
            $regex: `(?i)${sourceRegex}`,
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
      'sourceID',
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
  const find = () => {
    db.find(opts).then((data) => {
      resolve({ ...data, params: includes });
    }).catch((err) => {
      console.log(err);
      if (err.statusCode === 401 || err.reason.indexOf('_design') || err.reason.indexOf('_reader'))
        find();
      else
        reject(err);
    });
  };
  find();
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
