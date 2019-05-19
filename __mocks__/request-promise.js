import fs from 'fs';

export default url => new Promise((resolve, reject) => {
  url = `${url.replace(/(:|\/|\.)/g, '').slice(0, -4)}.html`;
  if (fs.existsSync(`${__dirname}/../articles/${url}`))
    resolve(fs.readFileSync(`${__dirname}/../articles/${url}`).toString('utf-8'));
  else
    reject(404);
});
