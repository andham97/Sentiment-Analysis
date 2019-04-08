import { cloudant } from '../ics';

const db = cloudant.db.use('sa-index');

const urlCheck = urls => new Promise((resolve, reject) => {
  let arr = urls;
  if (typeof arr === 'string')
    arr = [arr];

  db.view('searches', 'url-view', {
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
  }).catch(reject);
});

export default { urlCheck };
