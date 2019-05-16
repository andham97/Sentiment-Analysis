/**
 * @module TODO?
 */
import Scraper from './api/webscraper';
import Wordcloud from './api/wordcloud';
import Search from './api/search';
import Utils from './api/utils';
import Schedule from './api/schedule';

export default {
  ...Scraper, ...Wordcloud, ...Utils, ...Search, ...Schedule,
};
