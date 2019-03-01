import cheerio from 'cheerio';
import rp from 'request-promise';
import url from 'url';
import { cloudant } from '../ics';

const db = cloudant.use('sa-index');

let index;

const EventEmitter = require('events');

const loadIndex = (cb) => {
  if (index === undefined)
    db.find({ selector: { type: 'ws' } }, (err, result) => {
      if (err)
        return cb(err);
      index = result.docs[0];
      cb();
    });
  else
    cb();
};

const ws = (path, cb) => {
  loadIndex((err) => {
    if (err)
      return cb(err);
    let hostname = url.parse(path).hostname;
    if (index[hostname] === undefined) {
      Object.keys(index).forEach((key) => {
        if (key.indexOf(hostname) > -1)
          hostname = key;
      });
      if (index[hostname] === undefined)
        cb(new Error(`Error: Hostname not recognized '${hostname}' `));
    }
    rp(path).then((html) => {
      const page = cheerio.load(html);
      const headline = page(index[hostname].headline).text();
      let p = page(index[hostname].body);
      index[hostname].exclude.forEach((sel) => {
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
        return cb(new Error('Error: Not sufficient text to analyze'));
      cb(null, {
        headline,
        body,
        url: path,
      });
    }).catch((err) => {
      cb(new Error(`Error: ${err}`));
    });
  });
};

const EE = new EventEmitter();

EE.on('data', (data) => {
  process.stdout.write(JSON.stringify(data));
});

EE.on('end', () => {
  EE.removeAllListeners();
});

const processInput = (i) => {
  if (i >= process.argv.length)
    return EE.emit('end');
  ws(process.argv[i], (err, data) => {
    if (err)
      process.stderr.write(JSON.stringify(err));
    else
      EE.emit('data', data);
    processInput(i + 1);
  });
};

processInput(2);

export default ws;
