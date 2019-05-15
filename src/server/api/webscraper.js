import { getCloudant, newsapi } from '../ics';

const getWebscraperHosts = () => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  cloudant.db.use('sa-meta').find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    resolve(result.docs[0]);
  });
});

const updateWebscraperHost = host => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject(new Error('Cloudant'));
  cloudant.db.use('sa-meta').find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    const index = result.docs[0];
    host.hostnames.forEach((hostname) => {
      if (!index[hostname])
        index[hostname] = {};
      Object.keys(host).filter(e => e !== 'hostnames' && e !== 'hostDeletions').forEach((key) => {
        index[hostname][key] = host[key];
      });
    });
    host.hostDeletions.forEach((hostname) => {
      if (index[hostname])
        delete index[hostname];
    });
    cloudant.db.use('sa-meta').insert(index, (err) => {
      if (err)
        return reject(err);
      resolve();
    });
  });
});

const getNewsSourceURLs = sources => new Promise((resolve, reject) => {
  if (typeof sources === 'string')
    sources = sources.split(',');
  if (!sources.length || sources.length === 0)
    return resolve([]);
  getWebscraperHosts().then((hsts) => {
    const hosts = Object.keys(hsts).filter(key => key.indexOf('_') !== 0 && key !== 'type').map(key => hsts[key].sourceID);
    sources = sources.filter(source => hosts.indexOf(source) > -1);
    Promise.all(sources.map((source) => {
      const opts = {
        language: 'en',
        sources: source,
        pageSize: 100,
      };

      return newsapi.v2.everything(opts);
    }).map(promise => promise.then(val => val, () => ({ articles: [] })))).then((data) => {
      resolve(data.reduce((acc, val) => {
        val.articles.map(a => a.url).forEach(url => acc.push(url));
        return acc;
      }, []));
    }).catch(reject);
  });
});

export default { getWebscraperHosts, updateWebscraperHost, getNewsSourceURLs };
