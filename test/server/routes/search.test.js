import fs from 'fs';

describe('Search API', () => {
  test('/api/search/sources', (done) => {
    global.json({
      url: '/api/search/sources',
    }).then((sources) => {
      const check = Object.keys(JSON.parse(fs.readFileSync(`${__dirname}/../../../index.json`).toString('utf-8')).map(val => val.sourceID)
        .reduce((acc, val) => {
          acc[val] = 1;
          return acc;
        }, {}));
      expect(sources.length).toBe(check.length);
      expect(sources.filter(val => check.indexOf(val.key) === -1).length).toBe(0);
      done();
    });
  });

  test('/api/search - 400', (done) => {
    global.json({
      url: '/api/search',
      status: 400,
      type: /text/,
    }).then(() => {
      done();
    });
  });

  test('/api/search', (done) => {
    global.json({
      url: '/api/search?q=cnn',
    }).then((data) => {
      expect(data.docs.filter(doc => doc.analysis.text.search(/(cnn)/i) === -1).length).toBe(0);
      done();
    });
  });

  test('/api/search - not', (done) => {
    global.json({
      url: '/api/search?q=e%20-cnn',
    }).then((data) => {
      expect(data.docs.filter(doc => doc.analysis.text.indexOf('cnn') > -1).length).toBe(0);
      done();
    });
  });

  test('/api/search - empty', (done) => {
    global.json({
      url: '/api/search?q=',
      status: 400,
      type: /text/,
    }).then(() => {
      done();
    });
  });

  test('/api/search - invalid characters', (done) => {
    global.json({
      url: '/api/search?q=.*',
      status: 400,
      type: /text/,
    }).then(() => {
      done();
    });
  });

  test('/api/search - not only', (done) => {
    global.json({
      url: '/api/search?q=-cnn',
    }).then(() => {
      done();
    });
  });

  test('/api/search - sources', (done) => {
    global.json({
      url: '/api/search?q=cnn&sources=cnn',
    }).then(() => {
      done();
    });
  });

  test('/api/search - start interval', (done) => {
    global.json({
      url: '/api/search?q=e&intervalStart=1556779213229',
    }).then((data) => {
      expect(data.docs.filter(doc => doc.date > 1556779213229).length).toBe(data.docs.length);
      done();
    });
  });

  test('/api/search - end interval', (done) => {
    global.json({
      url: '/api/search?q=e&intervalEnd=1556779213229',
    }).then((data) => {
      expect(data.docs.filter(doc => doc.date < 1556779213229).length).toBe(data.docs.length);
      done();
    });
  });
});
