import uuid from 'uuid/v1';
import API from './api';
import ws from './ws';
import nluProcess from './ws/nlu';

const interval = 60;
let schedule = [];
let activeSchedule = [];
const ignoreIDs = [];
let selfInvoked = [];
const selfStop = [];
const toggle = {
  update: false,
  schedule: true,
  run: true,
};

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

  stop() {
    clearTimeout(this.id);
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
  console.log(`Executing ${item.id ? item.id : 'independent job'}`);
  if (item.recurring) {
    activeSchedule.push({
      id: item.id,
      timeout: new Timeout(run(item), getTimeToNextRun(item)),
      recurring: item.recurring,
      timestamp: new Date().getTime(),
    });
  }
  else if (item.id && selfInvoked.filter(i => item.id === i.id).length === 0) {
    API.deleteScheduleItem(item.id).then(() => {
      schedule = schedule.filter(i => i.id !== item.id);
    }).catch(() => {});
  }
  else if (item.id && selfInvoked.filter(i => item.id === i.id).length > 0) {
    selfInvoked = selfInvoked.filter(i => item.id !== i.id);
  }
  (() => {
    if (item.task === 'all')
      return new Promise(resolve => API.getWebscraperSources()
        .then(srcs => resolve(srcs.map(h => h.key)))
        .catch(() => resolve([])));
    return new Promise(resolve => resolve(item.task));
  })().then((sources) => {
    console.log(sources);
    API.getNewsSourceURLs(sources).then((urls) => {
      API.urlCheck(urls).then((list) => {
        if (cb)
          cb();
        else
          console.log(`Fetching ${list.length}/${urls.length} articles`);
        if (list.length > 0) {
          let count = 0;
          let err = 0;
          ws(list, (data) => {
            count++;
            if (count === list.length)
              console.log(`URLs processed: ${count} Number of errors: ${!data ? (err + 1) : err}`);
            if (!data) {
              err++;
              return;
            }
            nluProcess(data, () => {});
          });
        }
      }).catch((err) => {
        console.error(err);
      });
    });
  });
});

const update = (extra) => {
  activeSchedule.forEach((item) => {
    if (item.timeout.executed && !item.recurring)
      ignoreIDs.push(item.id);
  });
  activeSchedule = activeSchedule
    .filter(aItem => schedule
      .filter(item => item.id === aItem.id && !aItem.timeout.executed).length > 0);
  schedule
    .filter(item => activeSchedule
      .filter(aItem => aItem.id === item.id).length === 0
      && ignoreIDs.indexOf(item.id) === -1
      && selfStop.indexOf(item.id) === -1)
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
  if (toggle.update) {
    console.log(`Active scheduled items: ${activeSchedule.length}`);
    activeSchedule.forEach(item => console.log(`${item.id}\n\tTime until invocation: ${msToString((item.timeout.wait + item.timestamp) - new Date().getTime())}`));
  }
  API.getWebscraperHosts().then(() => {}).catch(console.error);
  if (!extra)
    setTimeout(update, interval * 1000);
};

const processInput = (data) => {
  data = data.toString('utf-8').split(' ')
    .filter(s => s !== '').join(' ')
    .split('\n')
    .filter(cmd => cmd !== '');
  data.forEach((line) => {
    if (line.split(' ')[0] === 's')
      line = `schedule ${line.split(' ').slice(1).join(' ')}`;
    else if (line.split(' ')[0] === 'r')
      line = `run ${line.split(' ').slice(1).join(' ')}`;
    else if (line.split(' ')[0] === 't')
      line = `toggle ${line.split(' ').slice(1).join(' ')}`;
    if (line.indexOf('schedule') === 0) {
      const command = line.split(' ')[1];
      const options = line.split(' ').slice(2);
      switch (command) {
        case 'get':
          if (toggle.schedule)
            console.log('Fetching new updated schedule');
          API.getSchedule().then((ns) => {
            const curIDs = schedule.map(item => item.id);
            ns.filter(item => curIDs.indexOf(item.id) === -1).forEach(item => schedule.push(item));
            update(true);
            if (toggle.schedule)
              console.log('Schedule updated');
          }).catch(() => console.log('Not possible to get schedule'));
          break;
        case 'delete':
          if (schedule.filter(item => item.id === options[0]).length === 0
            && selfInvoked.filter(ii => ii.id === options[0]).length === 0)
            console.log('ID not recognized');
          else if (selfInvoked.filter(ii => ii.id === options[0]).length > 0) {
            if (toggle.schedule)
              console.log('Deleting job');
            selfInvoked.forEach((item) => {
              if (item.id === options[0])
                item.timeout.stop();
            });
            selfInvoked = selfInvoked.filter(item => item.id !== options[0]);
            console.log('Job deleted');
          }
          else {
            if (toggle.schedule)
              console.log('Deleting job');
            API.deleteScheduleItem(options[0]).then(() => {
              activeSchedule.forEach((item) => {
                if (item.id === options[0])
                  item.timeout.stop();
              });
              activeSchedule = activeSchedule.filter(item => item.id !== options[0]);
              console.log('Job deleted');
            }).catch(() => console.log('Deletion not possible'));
          }
          break;
        case 'add':
          if (options[1] !== 'true' && options[1] !== 'false')
            console.log('recurring option must be true or false');
          else if (options.slice(2, 5)
            .filter(num => isNaN(num) || Number(num) > 59 || Number(num) < 0).length > 0
            || Number(options[2]) > 23
            || Number(options[2]) < 0)
            console.log('Parameter 3, 4 and 5 must be numbers and between 0 0 0 and 23 59 59');
          else {
            API.addScheduleItem({
              recurring: options[1] === 'true',
              task: options[0],
              occurences: [{
                hour: Number(options[2]),
                minute: Number(options[3]),
                second: Number(options[4]),
              }],
            }).then((item) => {
              console.log('Item addded');
              if (toggle.schedule)
                console.log(item);
            }).catch((err) => {
              console.log('Item not added');
              console.log(err);
            });
          }
          break;
        case 'show':
          if (options.length > 0 && options[0] === 'all') {
            console.log(`All central scheduled jobs: ${schedule.length}`);
            schedule.forEach(item => console.log(`${item.id}\n\t${item.occurences.map(i => `${i.hour < 10 ? `0${i.hour}` : i.hour}:${i.minute < 10 ? `0${i.minute}` : i.minute}:${i.second < 10 ? `0${i.second}` : i.second}`).join('\n\t')}`));
          }
          else {
            console.log(`Active scheduled jobs: ${activeSchedule.length}`);
            activeSchedule.forEach(item => console.log(`${item.id}\n\tTime until invocation: ${msToString((item.timeout.wait + item.timestamp) - new Date().getTime())}`));
          }
          break;
        case 'help':
        case 'h':
          console.log(
            `Usage:
\t- schedule get (force a fetch of the central schedule)
\t- schedule add <task> <recurring (true | false)> <hour> <minute> <second> (add task to central schedule)
\t- schedule delete <job-id> (delete the specified task from local and remote schedule)
\t- schedule help (show this command description)`,
          );
          break;
        default:
          console.log('Command not recognized');
      }
    }
    else if (line.indexOf('run') === 0 && line.split(' ').length > 1) {
      const options = line.split(' ').slice(1);
      const items = schedule.filter(item => item.id === options[0]);
      if (items.length > 0) {
        items.forEach(item => run(item)());
        console.log('Job invoked');
      }
      else if (options.length === 4) {
        if (options.slice(1, 4)
          .filter(num => isNaN(num) || Number(num) > 59 || Number(num) < 0).length > 0
          || Number(options[1]) > 23
          || Number(options[1]) < 0)
          console.log('Parameter 2, 3 and 4 must be numbers and between 0 0 0 and 23 59 59');
        else {
          const nItem = {
            id: uuid(),
            recurring: false,
            task: options[0],
            occurences: [{
              hour: Number(options[1]),
              minute: Number(options[2]),
              second: Number(options[3]),
            }],
          };
          selfInvoked.push({
            id: nItem.id,
            recurring: nItem.recurring,
            timestamp: new Date().getTime(),
            timeout: new Timeout(run(nItem), getTimeToNextRun(nItem)),
          });
          console.log(`Added item:\n${toggle.run ? JSON.stringify(nItem, null, 2) : ''}\n`);
        }
      }
      else if (options.length === 2 && options[1] === 'now') {
        run({
          task: options[0],
        })();
        console.log('Task invoked');
      }
      else if (options.length === 2 && options[0] === 'stop') {
        if (options[1] === 'show')
          selfStop.forEach(id => console.log(id));
        else if (activeSchedule.filter(item => item.id === options[1]).length > 0) {
          const item = activeSchedule.filter(i => i.id === options[1])[0];
          item.timeout.stop();
          activeSchedule = activeSchedule.filter(i => item.id !== i.id);
          selfStop.push(item.id);
          console.log('Job stopped');
        }
      }
      else if (options.length === 2 && options[0] === 'start') {
        if (options[1] === 'show')
          selfStop.forEach(id => console.log(id));
        else if (selfStop.indexOf(options[1]) > -1) {
          const item = schedule.filter(i => i.id === options[1])[0];
          activeSchedule.push({
            id: item.id,
            timeout: new Timeout(run(item), getTimeToNextRun(item)),
            recurring: item.recurring,
            timestamp: new Date().getTime(),
          });
          console.log('Job started');
        }
      }
      else if (options.length === 1 && options[0] === 'show') {
        console.log(`Locally scheduled items: ${selfInvoked.length}\n`);
        selfInvoked.forEach(item => console.log(`${item.id}\n\tTime until invocation: ${msToString((item.timeout.wait + item.timestamp) - new Date().getTime())}`));
        console.log('');
      }
      else if (options.length === 1 && (options[0] === 'help' || options[0] === 'h')) {
        console.log(
          `Usage:
\t- run <job-id> (run the job with the ID provided now)
\t- run <task> now (run the specified task now)
\t- run <task> <hour> <minute> <second> (schedule a local task at the specified time)
\t- run start <job-id> (start the specified job)
\t- run stop <job-id> (stop the specified job from running locally)
\t- run start show (print central jobs stopped locally)
\t- run stop show (print central jobs stopped locally)
\t- run show (print the locally scheduled jobs)
\t- run help (show this command description)`,
        );
      }
      else if (options.length === 1)
        console.log('ID not recognized');
      else if (options.length < 4 || options.length > 5)
        console.log('Command not recognized');
    }
    else if (line.indexOf('help') === 0 || line.split(' ')[0] === 'h') {
      console.log(
        `Commands (for usage pass 'help' as first parameter to command)
\t- schedule
\t- run
\t- toggle
\t- help`,
      );
    }
    else if (line.indexOf('toggle') === 0) {
      const label = line.split(' ')[1];
      if (label === 'help' || label === 'h')
        console.log(`
          Usage:
\t- toggle <label> (toggles the output label)
\t\t- update (the ongoing update)
\t\t- schedule
\t\t- run
\t\t- all (toggle all labels)
\t- toggle help (display this help section)`);
      else if (label === 'all') {
        const tk = Object.keys(toggle).filter(key => !toggle[key]).length > 0;
        Object.keys(toggle).forEach((key) => {
          toggle[key] = tk;
        });
        console.log(`All labels set to ${tk}`);
      }
      else if (label === 'show')
        console.log(toggle);
      else if (toggle[label] || toggle[label] === false) {
        toggle[label] = !toggle[label];
        console.log(`${label} set to ${toggle[label]}`);
      }
    }
    else
      console.log('Command not recognized, try \'help\' command');
    update(true);
  });
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
      console.log('Scheduler commandline tool is ready:');
      process.stdin.on('data', processInput);
    }).catch(() => {
      if (schedule.length === 0)
        setTimeout(ft, 2000);
    });
  };
  setTimeout(ft, 2000);
};

export default start;
