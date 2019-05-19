import ST from 'supertest'; // eslint-disable-line import/no-extraneous-dependencies
import { app } from './src/server/server';

jest.mock('request-promise');
jest.mock('./src/server/ics');

global.ST = ST;
global.app = app;
global.jsonParse = st => st
  .expect(200)
  .expect('Content-Type', /json/)
  .then(data => new Promise(resolve => resolve(JSON.parse(data.res.text))));

global.json = (url, method, inject) => {
  switch (method.toLowerCase()) {
    case 'get':
      return global.jsonParse(global.ST(global.app).get(url));
    case 'post':
      return global.jsonParse(inject(global.ST(global.app).post(url)));
    case 'delete':
      return global.jsonParse(inject(global.ST(global.app).delete(url)));
    default:
      throw new Error('Invalid method');
  }
};
