import { getCloudant } from '../ics';

const urlCheck = urls => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  let arr = urls;
  if (typeof arr === 'string')
    arr = [arr];
  const find = () => {
    cloudant.db.use('sa-index').view('searches', 'url-view', {
      group: true,
    }).then((data) => {
      const u = data.rows.map(row => row.key);
      for (let i = 0; i < arr.length; i += 1) {
        if (u.indexOf(arr[i]) > -1) {
          arr.splice(i, 1);
          i -= 1;
        }
      }
      resolve(arr);
    }).catch((err) => {
      if (err.statusCode === 401 || err.reason.indexOf('_design') || err.reason.indexOf('_reader'))
        find();
      else
        reject(err);
    });
  };
  find();
});

const urlCount = () => new Promise((resolve, reject) => {
  const cloudant = getCloudant();
  if (!cloudant)
    return reject();
  const find = () => {
    cloudant.db.use('sa-index').view('searches', 'url-view', {
      group: true,
    }).then((data) => {
      resolve(data.rows.length);
    }).catch((err) => {
      if (err.statusCode === 401 || err.reason.indexOf('_design') || err.reason.indexOf('_reader'))
        find();
      else
        reject(err);
    });
  };
  find();
});

export default { urlCheck, urlCount };
