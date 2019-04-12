import Scraper from './api/webscraper';
import Wordcloud from './api/wordcloud';
import Search from './api/search';
import Utils from './api/utils';

export default {
  ...Scraper, ...Wordcloud, ...Utils, ...Search,
};
