import http from 'http';
import server from '../../src/server/server';

describe('test route for server', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should respond with ok', (done) => {
    let data = '';

    http.request({
      host: 'localhost',
      port: process.env.PORT || 3000,
      path: '/test',
    }, (res) => {
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        expect(data).toBe('test ok');
        done();
      });
    }).end();
  });
});
