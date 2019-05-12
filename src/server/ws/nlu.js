import { nlu, getCloudant } from '../ics';

let excludes;
let cloudant;

const loadExclude = (cb) => {
  if (excludes === undefined)
    cloudant.db.use('sa-meta').find({ selector: { type: 'nlu' } }, (err, result) => {
      if (err)
        return cb(err);
      excludes = result.docs[0].excludeType.map(entry => entry.toLowerCase());
      cb();
    });
  else
    cb();
};

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
          const e = {
            text: entry.text,
            sentiment: entry.sentiment,
            relevance: entry.relevance,
            emotion: entry.emotion,
            count: entry.count,
          };
          cloudant.db.use('sa-index').insert({
            headline: page.headline,
            url: page.url,
            date: page.date,
            analysis: e,
            sourceID: page.sourceID,
          }, (err) => {
            if (err)
              console.log(err);
            else
              console.log(`Finished analysing page: ${e.text} ${page.url}`);
            cb(null);
          });
        });
    });
  });
};

export default (urlData, cb) => {
  cloudant = getCloudant();
  if (!cloudant)
    return cb(new Error('Cloudant not connected'));
  loadExclude((err) => {
    if (err)
      return cb(err);
    if (!urlData.slice)
      urlData = [urlData];
    console.log(`Analysing pages ${urlData.length}`);
    if (urlData.length === 0)
      return cb(null);
    analyze(urlData, cb);
  });
};
