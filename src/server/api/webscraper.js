import { getCloudant } from '../ics';

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
    console.log(host);
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

export default { getWebscraperHosts, updateWebscraperHost };
