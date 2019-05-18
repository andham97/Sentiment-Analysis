import { getCloudant } from '../ics';

/**
 * Check urls if they are already indexed
 *
 * @function urlCheck
 * @param  {Arrray<string>} urls
 * @returns {Promise<Array<string>>}
 */
const urlCheck = urls => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  let arr = urls;
  if (typeof arr === 'string')
    arr = [arr];
  const find = () => {
    getCloudant().db.use('sa-index').view('searches', 'url-view', {
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

/**
 * Count number of indexed urls
 *
 * @function urlCount
 * @returns {number}
 */
const urlCount = () => new Promise((resolve, reject) => {
  if (!getCloudant())
    return reject();
  const find = () => {
    getCloudant().db.use('sa-index').view('searches', 'url-view', {
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
