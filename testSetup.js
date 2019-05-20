import ST from 'supertest'; // eslint-disable-line import/no-extraneous-dependencies
import { app } from './src/server/server';

jest.mock('request-promise');
jest.mock('./src/server/ics');
jest.setTimeout(100000);

global.ST = ST;
global.app = app;
global.jsonParse = (st, status, type) => st
  .expect(status || 200)
  .expect('Content-Type', type)
  .then(data => new Promise((resolve) => {
    if ('application/json'.search(type) > -1)
      resolve(JSON.parse(data.res.text));
    else
      resolve(data.res.text);
  }));

global.json = (opts) => {
  const keys = ['method', 'status', 'type', 'data', 'inject'];
  const vals = ['get', 200, /json/, {}, req => req];
  keys.forEach((key, i) => {
    opts[key] = opts[key] ? opts[key] : vals[i];
  });
  switch (opts.method.toLowerCase()) {
    case 'get':
      return global.jsonParse(global.ST(global.app).get(opts.url), opts.status, opts.type);
    case 'post':
      return global
        .jsonParse(opts
          .inject(global.ST(global.app).post(opts.url))
          .send(opts.data), opts.status, opts.type);
    case 'delete':
      return global
        .jsonParse(opts
          .inject(global.ST(global.app).delete(opts.url))
          .send(opts.data), opts.status, opts.type);
    default:
      throw new Error('Invalid method');
  }
};
