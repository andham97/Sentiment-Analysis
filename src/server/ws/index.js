import { spawn } from 'child_process';
import appEnv from '../app-env';

const isJSON = (string) => {
  try {
    JSON.parse(string);
    return true;
  }
  catch (err) {
    return false;
  }
};

export default urls => new Promise((resolve) => {
  console.log('Starting scraping of valid URLs');
  const data = [];
  const ws = spawn('npm', ['run', (appEnv.isLocal ? 'ws' : 'prod-ws'), '--'].concat(urls));
  let buffer = '';
  let finished = false;

  ws.stdout.on('data', (buff) => {
    const text = buff.toString('utf-8');
    if (text[0] !== '{' && buffer === '')
      return;
    buffer += text;
    if (isJSON(buffer)) {
      data.push(JSON.parse(buffer));
      buffer = '';
      if (finished) {
        console.log('Scraping finished');
        resolve(data);
      }
    }
  });

  ws.stderr.on('data', buff => process.stderr.write(buff.toString('utf-8')));

  ws.on('close', () => {
    if (buffer !== '')
      finished = true;
    else {
      console.log('Scraping finished');
      resolve(data);
    }
  });
});
