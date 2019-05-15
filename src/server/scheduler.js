import API from './api';
import ws from './ws';
import nluProcess from './ws/nlu';

const interval = 60;
let schedule = [];
let activeSchedule = [];
const ignoreIDs = [];

const msToString = (ms) => {
  const hrs = Math.floor(ms / (60 * 60 * 1000));
  ms -= hrs * 60 * 60 * 1000;
  return `${hrs}h ${Math.floor(ms / (60 * 1000))}min`;
};

class Timeout {
  constructor(fn, wait) {
    this.wait = wait;
    if (wait === -1)
      return;
    this.executed = false;
    this.id = setTimeout(() => {
      fn(() => {
        this.executed = true;
      });
    }, wait);
  }
}

const getTimeToNextRun = (item) => {
  const ref = new Date();
  return item.occurences.map((val) => {
    const occ = new Date(Date.UTC(
      ref.getUTCFullYear(),
      ref.getUTCMonth(),
      ref.getUTCDate(),
      val.hour,
      val.minute,
      val.second,
    ));
    return occ.getTime() + (occ.getTime() <= ref.getTime() ? (24 * 60 * 60 * 1000) : 0);
  }).sort((a, b) => a - b)[0] - ref.getTime();
};

const run = item => ((cb) => {
  console.log(`Executing ${item.id}`);
  (() => {
    if (item.task === 'all')
      return new Promise(resolve => API.getSources()
        .then(srcs => resolve(srcs.map(h => h.key)))
        .catch(() => resolve([])));
    return new Promise(resolve => resolve(item.task));
  })().then((sources) => {
    API.getNewsSourceURLs(sources).then((urls) => {
      const len = urls.length;
      API.urlCheck(urls).then((list) => {
        cb();
        if (item.recurring) {
          activeSchedule.push({
            id: item.id,
            timeout: new Timeout(run(item), getTimeToNextRun(item)),
            recurring: item.recurring,
            timestamp: new Date().getTime(),
          });
        }
        else {
          API.deleteScheduleItem(item.id).then(() => {
            schedule = schedule.filter(i => i.id !== item.id);
          }).catch(() => {});
        }
        if (list.length > 0) {
          ws(list, (data) => {
            if (!data)
              return;
            nluProcess(data, (err) => {
              if (err)
                return console.error(err);
            });
          });
        }
      }).catch((err) => {
        console.error(err);
      });
    });
  });
});

const update = () => {
  activeSchedule.forEach((item) => {
    if (item.timeout.executed && !item.recurring)
      ignoreIDs.push(item.id);
  });
  activeSchedule = activeSchedule
    .filter(aItem => schedule
      .filter(item => item.id === aItem.id && !aItem.timeout.executed).length > 0);
  schedule
    .filter(item => activeSchedule
      .filter(aItem => aItem.id === item.id).length === 0 && ignoreIDs.indexOf(item.id) === -1)
    .forEach((item) => {
      activeSchedule.push({
        id: item.id,
        timeout: new Timeout(run(item), getTimeToNextRun(item)),
        recurring: item.recurring,
        timestamp: new Date().getTime(),
      });
    });
  ignoreIDs.forEach((id) => {
    API.deleteScheduleItem(id).then(() => {
      ignoreIDs.splice(ignoreIDs.indexOf(id), 1);
      schedule = schedule.filter(item => item.id !== id);
    }).catch(() => {});
  });
  console.log(`Active scheduled items: ${activeSchedule.length}\n`);
  activeSchedule.forEach(item => console.log(`${item.id}\n\tTime until invocation: ${msToString((item.timeout.wait + item.timestamp) - new Date().getTime())}`));
  console.log('');
  setTimeout(update, interval * 1000);
};

const start = () => {
  console.log('Starting scheduler');
  API.registerScheduleListener((items) => {
    if (!items)
      return;
    schedule = items;
  });
  const ft = () => {
    API.getSchedule().then((data) => {
      data.forEach(item => schedule.push(item));
      update();
    }).catch(() => {
      if (schedule.length === 0)
        setTimeout(ft, 10000);
    });
  };
  setTimeout(ft, 2000);
};

export default start;
