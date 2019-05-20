import uuid from 'uuid/v1';
import fs from 'fs';

const nluAnalysis = JSON.parse(fs.readFileSync(`${__dirname}/../../../nlu.json`));
const newsAPI = JSON.parse(fs.readFileSync(`${__dirname}/../../../newsapi.json`));
const metaDb = JSON.parse(fs.readFileSync(`${__dirname}/../../../meta.json`));
const indexDb = JSON.parse(fs.readFileSync(`${__dirname}/../../../index.json`));

const metaFunc = {
  find: opts => new Promise((resolve) => {
    resolve({
      docs: metaDb.filter(doc => doc.type === opts.selector.type),
    });
  }),
  insert: doc => new Promise((resolve) => {
    const index = metaDb.reduce((acc, d, i) => {
      if (d._id === doc._id)
        acc = i;
      return acc;
    }, -1);
    if (index > -1)
      metaDb.splice(index, 1);
    else
      doc._id = uuid();
    metaDb.push(doc);
    resolve(doc);
  }),
};

const indexFunc = {
  search: () => new Promise((resolve) => {
    const wc = indexDb
      .map(doc => doc.analysis.text)
      .reduce((acc, val) => {
        if (!acc[val])
          acc[val] = 1;
        else
          acc[val]++;
        return acc;
      }, {});
    resolve({
      counts: {
        key: Object.keys(wc)
          .sort((a, b) => wc[b] - wc[a])
          .reduce((acc, val) => {
            acc[val] = wc[val];
            return acc;
          }, {}),
      },
    });
  }),
  find: opts => new Promise((resolve) => {
    const s = indexDb.filter(doc => opts.selector.$and.filter((val) => {
      const key = Object.keys(val)[0];
      if (key === '$not') {
        const nkey = Object.keys(val[key])[0];
        const pattern = nkey.split('.');
        const dval = pattern.reduce((acc, k) => acc[k], doc);
        return dval.search(RegExp(val.$not[nkey].$regex.slice(4), 'i')) > -1;
      }
      const pattern = key.split('.');
      const dval = pattern.reduce((acc, k) => acc[k], doc);
      if (val[key].$regex)
        return dval.search(RegExp(val[key].$regex.slice(4), 'i')) === -1;
      if (val[key].$gte)
        return dval < val[key].$gte;
      if (val[key].$lte)
        return dval > val[key].$lte;
      return true;
    }).length === 0);
    resolve({
      docs: s.sort((a, b) => {
        const av = a[Object.keys(opts.sort[0])[0]];
        const bv = b[Object.keys(opts.sort[0])[0]];
        if (opts.sort[0][Object.keys(opts.sort[0])[0]] === 'desc')
          return bv - av;
        return av - bv;
      }),
    });
  }),
  insert: doc => new Promise((resolve) => {
    const index = indexDb.reduce((acc, d, i) => {
      if (d._id === doc._id)
        acc = i;
      return acc;
    }, -1);
    if (index > -1)
      indexDb.splice(index, 1);
    else
      doc._id = uuid();
    indexDb.push(doc);
    resolve(doc);
  }),
  view: (_doc, type) => new Promise((resolve) => {
    if (type === 'source-view')
      resolve({
        rows: Object.keys(indexDb.reduce((acc, val) => {
          acc[val.sourceID] = true;
          return acc;
        }, {})).map(key => ({ key, value: true })),
      });
    else if (type === 'url-view')
      resolve({
        rows: Object.keys(indexDb.reduce((acc, val) => {
          acc[val.url] = true;
          return acc;
        }, {})).map(key => ({ key, value: true })),
      });
    else
      throw new Error('Unknown view');
  }),
};

const cloudant = {
  db: {
    use: db => (db === 'sa-meta' ? metaFunc : indexFunc),
  },
};

const nlu = {
  analyze: (_opts, cb) => cb(null, nluAnalysis),
};

const newsapi = {
  v2: {
    everything: opts => new Promise((resolve) => {
      const articles = newsAPI.articles
        .filter(article => opts.sources.indexOf(article.source.id) > -1);
      resolve({
        status: 'ok',
        totalResults: articles.length,
        articles,
      });
    }),
  },
};

const getCloudant = () => cloudant;

const connectCloudant = () => {};

export {
  nlu, getCloudant, newsapi, connectCloudant,
};
