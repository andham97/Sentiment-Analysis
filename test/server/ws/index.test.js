import url from 'url';
import ws from '../../../src/server/ws';
import { cloudant } from '../../../src/server/ics';

let index;
const path = 'https://www.bbc.co.uk/news/technology-46790221';

describe('testing of the webscraper', () => {
  beforeAll((done) => {
    cloudant.use('sa-index').find({ selector: { type: 'ws' } }, (err, result) => {
      if (!err)
        index = result.docs[0];
      done();
    });
  });

  it('should check the hostname if it is indexed', () => {
    const hostname = url.parse(path).hostname;
    expect(Object.keys(index).filter((key) => {
      if (key.indexOf(hostname) > -1)
        return true;
      return false;
    }).length).toBeGreaterThan(0);
  });

  it('should fetch the content of the article', (done) => {
    ws([path]).then((data) => {
      expect(data.length).toBe(1);
      expect(data[0].url).toBe(path);
      done();
    });
  });
});
