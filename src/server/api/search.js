import stt from 'search-text-tokenizer';
import { getCloudant } from '../ics';

/**
 * Search for documents matchin given query
 *
 * @function search
 * @param  {string} query
 * @param  {Object} options
 * @returns {Promise<Object>}
 */
const search = (query, options) => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  query = query.replace(/[^a-zA-Z\s-]/g, '');
  if (query === '')
    return reject({ code: 400, err: new Error('Error: Empty query not supported') });
  const tokens = stt(query);
  const includes = tokens.filter(token => !token.exclude).map(token => token.term);
  const excludes = tokens.filter(token => token.exclude).map(token => token.term);
  const regex = includes.reduce((acc, val, i) => `${i === 0 ? '(' : ''}${acc + val}${i === includes.length - 1 ? ')' : '|'}`, '');
  const negRegex = excludes.reduce((acc, val, i) => `${i === 0 ? '(' : ''}${acc + val}${i === excludes.length - 1 ? ')' : '|'}`, '');
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
  }
  try {
    RegExp(sourceRegex);
    RegExp(regex);
    RegExp(negRegex);
  }
  catch (e) {
    return reject({ code: 400, err: new Error('Error: Invalid query parameters') });
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
      '_rev',
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
  if (options.intervalStart)
    opts.selector.$and.push({
      date: {
        $gte: Number(options.intervalStart),
      },
    });
  if (options.intervalEnd)
    opts.selector.$and.push({
      date: {
        $lte: Number(options.intervalEnd),
      },
    });
  if (negRegex !== '')
    opts.selector.$and.push({
      $not: {
        'analysis.text': {
          $regex: `(?i)${negRegex}`,
        },
      },
    });
  const find = () => {
    getCloudant().db.use('sa-index').find(opts).then((data) => {
      data.docs = data.docs.map((doc) => {
        if (doc.date < 0) {
          doc.date = new Date().getTime();
          getCloudant().db.use('sa-index').insert(doc).then(() => {}).catch(console.error);
        }
        delete doc._rev;
        return doc;
      });
      resolve({ ...data, params: includes });
    }).catch((err) => {
      if (!global.__DEV__)
        console.error(err);
      if (err.statusCode === 401 || (err.reason && err.reason.indexOf('_design')) || (err.reason && err.reason.indexOf('_reader')))
        find();
      else
        reject(err);
    });
  };
  find();
});

/**
 * Get all sources with indexed articles
 *
 * @function getSources
 * @returns {Array<Object>}
 */
const getSources = () => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  const find = () => {
    getCloudant().db.use('sa-index').view('searches', 'source-view', {
      group: true,
    }).then((data) => {
      const find2 = () => {
        getCloudant().db.use('sa-meta').find({ selector: { type: 'ws' } }).then(({ docs }) => {
          const hosts = Object.keys(docs[0]).filter(key => docs[0][key].sourceID);
          const keys = data.rows.map(e => e.key);
          resolve(keys.map(key => ({
            key,
            value: docs[0][hosts.filter(k => docs[0][k].sourceID === key)[0]].name,
          })));
        }).catch((err) => {
          if (!err.reason)
            return reject(err);
          if (err.statusCode === 401 || (err.reason && err.reason.indexOf('_design')) || (err.reason && err.reason.indexOf('_reader')))
            find2();
          else
            reject(err);
        });
      };
      find2();
    }).catch((err) => {
      if (err.statusCode === 401 || (err.reason && err.reason.indexOf('_design')) || (err.reason && err.reason.indexOf('_reader')))
        find();
      else
        reject(err);
    });
  };
  find();
});

export default { search, getSources };
