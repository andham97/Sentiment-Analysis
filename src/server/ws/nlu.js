import { nlu, cloudant } from '../ics';

const db = cloudant.db.use('sa-meta');
const dbIndex = cloudant.db.use('sa-index');

let excludes;

const loadExclude = (cb) => {
  if (excludes === undefined)
    db.find({ selector: { type: 'nlu' } }, (err, result) => {
      if (err)
        return cb(err);
      excludes = result.docs[0].excludeType.map(entry => entry.toLowerCase());
      cb();
    });
  else
    cb();
};

export default (urlData, cb) => {
  loadExclude((err) => {
    if (err)
      return cb(err);
    console.log(`Analysing pages ${urlData.length}`);
    if (urlData.length === 0)
      return cb(null);
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
            const e = {
              text: entry.text,
              sentiment: entry.sentiment,
              relevance: entry.relevance,
              emotion: entry.emotion,
              count: entry.count,
            };
            dbIndex.insert({
              headline: page.headline,
              url: page.url,
              analysis: e,
            }, (err) => {
              if (err)
                console.log(err);
              else
                console.log(`Finished analysing page: ${e.text} ${page.url}`);
            });
          });
        cb(null);
      });
    });
  });
};
