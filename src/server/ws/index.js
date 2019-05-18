import ws, { loadIndex } from './webscraper';

/**
 * Scrape the provided URLs
 *
 * @function scraper
 * @param  {Array<string>}   urls
 * @param  {Function} cb
 */
export default (urls, cb) => {
  loadIndex(() => {
    urls.forEach((url) => {
      ws(url, (err, data) => {
        if (err)
          cb();
        else
          cb(data);
      });
    });
  });
};
