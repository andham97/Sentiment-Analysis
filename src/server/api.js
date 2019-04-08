import Scraper from './api/webscraper';
import Wordcloud from './api/wordcloud';
import Utils from './api/utils';

export default { ...Scraper, ...Wordcloud, ...Utils };
