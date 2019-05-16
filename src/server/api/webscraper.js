import { getCloudant, newsapi } from '../ics';

const getWebscraperHosts = () => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  getCloudant().db.use('sa-meta').find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    resolve(result.docs[0]);
  });
});

const getWebscraperSources = () => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  getWebscraperHosts()
    .then(data => resolve(Object.keys(data).filter(key => key.indexOf('_') !== 0 && key !== 'type').reduce((acc, key) => {
      const selection = acc.filter(e => e.sourceID === data[key].sourceID);
      if (selection.length === 0) {
        const d = data[key];
        d.hostnames = [key];
        d.hostDeletions = [];
        acc.push(d);
      }
      else
        selection[0].hostnames.push(key);
      return acc;
    }, []).map(v => ({ key: v.sourceID, value: v.name }))))
    .catch(reject);
});

const updateWebscraperHost = host => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject(new Error('Cloudant'));
  getCloudant().db.use('sa-meta').find({ selector: { type: 'ws' } }, (err, result) => {
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
    getCloudant().db.use('sa-meta').insert(index, (err) => {
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

export default {
  getWebscraperHosts,
  updateWebscraperHost,
  getNewsSourceURLs,
  getWebscraperSources,
};
