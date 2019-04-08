import { cloudant } from '../ics';

const db = cloudant.db.use('sa-meta');

const addWebscraperHost = entry => new Promise((resolve, reject) => {
  db.find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    const index = result.docs[0];
    if (index[entry.hostname])
      return reject(new Error('Error: Hostname already exsists'));
    index[entry.hostname] = {
      headline: entry.headline,
      body: entry.body,
      exclude: entry.exclude,
      sourceID: entry.sourceID,
      date: entry.date,
    };
    db.insert(index, (err) => {
      if (err)
        return reject(err);
      resolve();
    });
  });
});

const getWebscraperHosts = () => new Promise((resolve, reject) => {
  db.find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    resolve(result.docs[0]);
  });
});

const updateWebscraperHost = host => new Promise((resolve, reject) => {
  db.find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return reject(err);
    const index = result.docs[0];
    if (!index[host.hostname])
      return reject(new Error('Error: Hostname not recognized'));
    Object.keys(host).filter(e => e !== 'hostname').forEach((key) => {
      index[host.hostname][key] = host[key];
    });
    db.insert(index, (err) => {
      if (err)
        return reject(err);
      resolve();
    });
  });
});

export default { addWebscraperHost, getWebscraperHosts, updateWebscraperHost };
