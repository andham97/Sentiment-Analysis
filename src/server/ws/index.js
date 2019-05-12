import ws, { loadIndex } from './webscraper';

export default (urls, cb) => {
  console.log('Starting scraping of valid URLs');
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
