import cheerio from 'cheerio';
import rp from 'request-promise';
import url from 'url';
import Module from 'module';
import { getCloudant } from '../ics';

/**
 * Database instance
 * @type {Cloudant}
 */
let db;

/**
 * Host index
 * @type {Object}
 */
let index;

/**
 * Load index from databse
 *
 * @function loadIndex
 * @param  {Function} cb
 */
const loadIndex = (cb) => {
  if (!db)
    db = getCloudant().use('sa-meta');
  db.find({ selector: { type: 'ws' } }, (err, result) => {
    if (err)
      return cb(err);
    index = result.docs[0];
    cb();
  });
};

/**
 * Scrape the givven url (path)
 *
 * @function ws
 * @param  {string}   path
 * @param  {Function} cb
 */
const ws = (path, cb) => {
  db = getCloudant().use('sa-meta');
  let hostname = url.parse(path).hostname;
  if (index[hostname] === undefined) {
    Object.keys(index).forEach((key) => {
      if (key.indexOf(hostname) > -1)
        hostname = key;
    });
    if (index[hostname] === undefined)
      return cb(`Error: Hostname not recognized '${hostname}'`);
  }
  rp(path).then((html) => {
    const page = cheerio.load(html);
    const host = index[hostname];
    let headline = '';
    for (let i = 0; i < host.headlines.length; i++) {
      headline = page(host.headlines[i]).text();
      if (headline.length > 0)
        break;
    }
    const m = new Module();
    m._compile(`module.exports = ${index[hostname].date.fn}`, '');
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'Desember'];
    let element;
    let tmp = '';
    let config;
    for (let i = 0; i < host.date.sel.length; i++) {
      if (host.date.sel[i].attr === '')
        tmp = page(host.date.sel[i].sel).text();
      else
        tmp = page(host.date.sel[i].sel).attr(host.date.sel[i].attr);
      if (tmp.length > 0) {
        config = host.date.sel[i];
        break;
      }
    }
    let date;
    if (config)
      try {
        date = m.exports(host.date.attribute
          ? element.attr(host.date.attribute)
          : element.text(), months);
      }
      catch (e) {
        date = new Date().getTime();
      }
    else
      date = new Date().getTime();
    if (!date || isNaN(date) || date < 0) // eslint-disable-line no-restricted-globals
      date = new Date().getTime();
    if (typeof date !== 'number')
      date = date.getTime ? date.getTime() : new Date().getTime();
    let p;
    for (let i = 0; i < host.body.length; i++) {
      const test = page(host.body[i]).text();
      if (test.length > 0) {
        p = page(host.body[i]);
        break;
      }
    }
    if (!p)
      return cb(`Error: Not sufficient text to analyze: ${path}`);
    host.exclude.forEach((sel) => {
      p = p.not(sel);
    });
    let body = '';
    p.text((i, text) => {
      if (body.length > 9000)
        return;
      body += text;
      if (i < p.length - 1) {
        body += ' ';
      }
    });
    if (body.length < 500)
      return cb(`Error: Not sufficient text to analyze: ${path}`);
    cb(null, {
      headline,
      body,
      url: path,
      sourceID: index[hostname].sourceID,
      date,
    });
  }).catch((err) => {
    cb(`Error: ${err}`);
  });
};

export default ws;
export { loadIndex };
