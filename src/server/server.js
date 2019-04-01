import express from 'express';
import path from 'path';
import Wordcloud from './api/wordcloud';
import Search from './api/search';
import WebScraper from './api/webscraper';

const app = express();

app.use(express.static(path.resolve(process.cwd(), 'build/client')));
app.use(express.json());

app.use('/api/wordcloud', Wordcloud);

app.use('/api/search', Search);

app.use('/api/ws', WebScraper);

app.use('/api', (req, res) => {
  res.status(404).send('API endpoint not found');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/src/client/index.html'));
});

const server = app.listen(process.env.PORT || 3000, () => {
  process.stdout.write(`listening on port ${process.env.PORT || 3000}\n`);
});

export default server;
