import { cloudant } from './ics';

const db = cloudant.db.use('sa-index');

const cache = {};

export default {
  wordcloud: {
    get: () => new Promise((resolve, reject) => {
      db.view('views', 'search-view').then((cachable) => {
        if (cache.wordcloud && cachable.rows && cachable.rows.length > 0
           && cache.wordcloud.value === cachable.rows[0].value)
          return resolve(cache.wordcloud.data);
        db.view('views', 'search-view', {
          reduce: false,
        }).then((body) => {
          db.view('views', 'search-view', {
            keys: body.rows.map(val => val.key),
            group: true,
          }).then((res) => {
            const arr = res.rows.slice();
            const result = [];

            for (let i = 0; i < arr.length; i += 1) {
              const elem = arr[i];
              for (let j = i + 1; j < arr.length; j += 1) {
                if (elem.key === arr[j].key) {
                  elem.value += arr[j].value;
                  arr.splice(j, 1);
                }
              }
              result.push(elem);
            }
            result.sort((a, b) => {
              if (a.value < b.value)
                return 1;
              if (a.value > b.value)
                return -1;
              if (a.key < b.key)
                return -1;
              if (a.key > b.key)
                return 1;
              return 0;
            });
            if (cachable.rows && cachable.rows.length > 0)
              cache.wordcloud = {
                value: cachable.rows[0].value,
                data: result,
              };
            resolve(result);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    }),
  },
};
