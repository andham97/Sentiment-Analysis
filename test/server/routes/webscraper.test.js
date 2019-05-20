import fs from 'fs';

describe('Web scraper API', () => {
  test('/api/ws/hosts', (done) => {
    global.json({
      method: 'get',
      url: '/api/ws/hosts',
      status: 200,
    }).then((data) => {
      expect(data.length).toBe(undefined);
      expect(data.type).toBe('ws');
      expect(data['www.bbc.com']).not.toBe(undefined);
      done();
    });
  });

  test('/api/ws/sources', (done) => {
    global.json({
      method: 'get',
      url: '/api/ws/sources',
      status: 200,
    })
      .then((sources) => {
        global.json({
          method: 'get',
          url: '/api/ws/hosts',
          status: 200,
        }).then((hosts) => {
          const ids = Object.keys(hosts)
            .filter(key => key !== 'type')
            .map(key => hosts[key].sourceID);
          expect(sources.filter(source => ids.indexOf(source.key) === -1).length).toBe(0);
          done();
        });
      });
  });

  test('/api/ws/urlCount', (done) => {
    global.json({
      method: 'get',
      url: '/api/ws/urlCount',
      status: 200,
    }).then((data) => {
      expect(typeof data.count).toBe('number');
      expect(data.count).toBe(141);
      done();
    });
  });

  test('/api/ws/load - 400', (done) => {
    global.ST(global.app).get('/api/ws/load')
      .expect(400)
      .end(done);
  });

  test('/api/ws/load', (done) => {
    global.json({
      method: 'get',
      url: '/api/ws/load?url=https://abcnews.go.com/Entertainment/wireStory/ap-top-entertainment-news-534-edt-63133356',
      status: 200,
    }).then((data) => {
      expect(data.data).toBe(fs.readFileSync(`${__dirname}/../../../articles/httpsabcnewsgocomEntertainmentwireStoryap-top-entertainment-news-534-edt-6313.html`).toString('utf-8'));
      done();
    });
  });

  test('/api/ws/hosts - POST', (done) => {
    global.json({
      method: 'get',
      url: '/api/ws/hosts',
      status: 200,
    }).then((hosts) => {
      expect(hosts['test.com']).toBe(undefined);
      global.ST(global.app).post('/api/ws/hosts')
        .send({
          hostnames: ['test.com'],
          hostDeletions: [],
          name: 'Test',
          headlines: [],
          body: [],
          sourceID: 'test',
          date: {
            sel: [],
            fn: '(date, month) => {\n  return new Date();\n}',
          },
          validationURL: 'https://abcnews.go.com/Entertainment/wireStory/ap-top-entertainment-news-534-edt-63133356',
        })
        .then(() => {
          global.json({
            method: 'get',
            url: '/api/ws/hosts',
            status: 200,
          }).then((nhosts) => {
            expect(nhosts['test.com']).not.toBe(undefined);
            done();
          });
        });
    });
  });

  test('/api/ws/fetchNews', (done) => {
    global.json({
      method: 'get',
      url: '/api/search?q=cnn',
      status: 200,
    }).then((search) => {
      global.json({
        method: 'post',
        url: '/api/ws/fetchNews',
        status: 200,
        inject: req => req.send({
          sources: 'cnn',
        }),
      }).then(() => {
        global.json({
          method: 'get',
          url: '/api/search?q=cnn',
          status: 200,
        }).then((nsearch) => {
          expect(nsearch.docs.length).toBeGreaterThan(search.docs.length);
          done();
        });
      });
    });
  });

  test('/api/ws', (done) => {
    global.json({
      method: 'get',
      url: '/api/search?q=cnn',
      status: 200,
    }).then((search) => {
      global.ST(global.app)
        .post('/api/ws')
        .send({
          urls: 'https://www.bbc.co.uk/news/uk-england-lincolnshire-48326572',
        })
        .expect(200)
        .then(() => {
          global.json({
            method: 'get',
            url: '/api/search?q=cnn',
            status: 200,
          }).then((nsearch) => {
            expect(nsearch.docs.length).toBeGreaterThan(search.docs.length);
            done();
          });
        });
    });
  });

  test('/api/ws - 400', (done) => {
    global.ST(global.app)
      .post('/api/ws')
      .expect(400)
      .end(done);
  });
});
