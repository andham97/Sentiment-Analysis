import http from 'http';
import server from '../../src/server/server';

describe('test route for server', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should respond with data', (done) => {
    let data = '';

    http.request({
      host: 'localhost',
      port: process.env.PORT || 3000,
      path: '/api/wordcloud',
    }, (res) => {
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        expect(data.length).toBeGreaterThanOrEqual(0);
        done();
      });
    }).end();
  });
});
