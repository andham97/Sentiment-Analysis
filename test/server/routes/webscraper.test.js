import fs from 'fs';

describe('Web scraper API', () => {
  test('/api/ws/hosts', (done) => {
    global.json('/api/ws/hosts', 'get')
      .then((data) => {
        expect(data.length).toBe(undefined);
        expect(data.type).toBe('ws');
        expect(data['www.bbc.com']).not.toBe(undefined);
        done();
      });
  });

  test('/api/ws/sources', (done) => {
    global.json('/api/ws/sources', 'get')
      .then((sources) => {
        global.json('/api/ws/hosts', 'get')
          .then((hosts) => {
            const ids = Object.keys(hosts)
              .filter(key => key !== 'type')
              .map(key => hosts[key].sourceID);
            expect(sources.filter(source => ids.indexOf(source.key) === -1).length).toBe(0);
            done();
          });
      });
  });

  test('/api/ws/urlCount', (done) => {
    global.json('/api/ws/urlCount', 'get')
      .then((data) => {
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
    global.json('/api/ws/load?url=https://abcnews.go.com/Entertainment/wireStory/ap-top-entertainment-news-534-edt-63133356', 'get')
      .then((data) => {
        expect(data.data).toBe(fs.readFileSync(`${__dirname}/../../../articles/httpsabcnewsgocomEntertainmentwireStoryap-top-entertainment-news-534-edt-6313.html`).toString('utf-8'));
        done();
      });
  });
});
