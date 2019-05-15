import ws, { loadIndex } from './webscraper';

export default (urls, cb) => {
  loadIndex(() => {
    urls.forEach((url) => {
      ws(url, (err, data) => {
        if (err) {
          console.error(err);
          cb();
        }
        else
          cb(data);
      });
    });
  });
};
