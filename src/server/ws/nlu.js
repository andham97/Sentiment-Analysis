import { nlu, getCloudant, connectCloudant } from '../ics';

/**
 * Exclude types
 * @type {Array}
 */
let excludes;

/**
 * Get the exclude types from database
 *
 * @function loadExclude
 * @param  {Function}  cb
 */
const loadExclude = (cb) => {
  if (excludes === undefined)
    getCloudant().db.use('sa-meta').find({ selector: { type: 'nlu' } }).then((result) => {
      excludes = result.docs[0].excludeType.map(entry => entry.toLowerCase());
      cb();
    }).catch(cb);
  else
    cb();
};

/**
 * Analyze provided URL data
 *
 * @function analyze
 * @param  {Object}   urlData
 * @param  {Function} cb
 */
const analyze = (urlData, cb) => {
  urlData.forEach((page) => {
    nlu.analyze({
      text: page.body,
      features: {
        entities: {
          sentiment: true,
          emotion: true,
        },
      },
    }, (err, data) => {
      if (err)
        return cb(err);
      data.entities.filter(entry => excludes
        .indexOf(entry.type.toLowerCase()) === -1)
        .forEach((entry) => {
          const doc = {
            headline: page.headline,
            url: page.url,
            date: page.date,
            analysis: {
              text: entry.text,
              sentiment: entry.sentiment,
              relevance: entry.relevance,
              emotion: entry.emotion,
              count: entry.count,
            },
            sourceID: page.sourceID,
          };
          const ins = (d) => {
            getCloudant().db.use('sa-index').insert(d).then(() => {
              cb(null);
            }).catch((err) => {
              if (err.statusCode === 401) {
                if (getCloudant())
                  connectCloudant();
              }
              else if (err.statusCode && err.statusCode !== 429)
                console.error(err);
              setTimeout(() => {
                ins(doc);
              }, 400);
            });
          };
          ins(doc);
        });
    });
  });
};

/**
 * Load exclude and analyze provided data
 *
 * @function nlu
 * @param  {Object}   urlData
 * @param  {Function} cb
 */
export default (urlData, cb) => {
  if (!getCloudant())
    return cb(new Error('Cloudant not connected'));
  loadExclude((err) => {
    if (err)
      return cb(err);
    if (!urlData.slice)
      urlData = [urlData];
    if (urlData.length === 0)
      return cb(null);
    analyze(urlData, cb);
  });
};
