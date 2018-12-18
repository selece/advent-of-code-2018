const fs = require('fs');
const lodash = require('lodash');
const yargs = require('yargs')

  // input (i)
  .alias('i', 'input')
  .describe('i', 'Input file for parsing')
  .nargs('i', 1)

  // other yargs config
  .demandOption(['i'])
  .help('help')
  .argv;

fs.readFile(yargs.input, 'utf8', (err, data) => {
  if (err) {
    return console.log(`Error: ${err}`);
  }

  const pattern = /^\[(\d*)-(\d*)-(\d*) (\d\d:\d\d)\] (Guard #\d*|falls|wakes)/;
  const processed = lodash._(
    data
      .split('\n')
      .map((line) => {
        const [, year, month, day, timestamp, detail] = line.match(pattern);
        return {
          year, month, day, timestamp, detail,
        };
      }),
  )
    .sortBy(['year', 'month', 'day', 'timestamp'])
    .value();

  const guards = processed.reduce((acc, {
    detail, year, month, day, timestamp,
  }) => {
    const ymd = `${year}-${month}-${day}`;

    // case 1: guard starts shift, change active id to current declared id
    // "Guard #192 begins shift"
    if (detail[0] === 'G') {
      const [, id] = detail.match(/Guard #(\d*)/) || [null, null];
      acc.active = id;

      // if guard is new, init his schedule data
      if (acc[id] === undefined) {
        acc[id] = {};
      }
    }

    // case 2: guard falls asleep, mark "now" until end as asleep
    // "falls asleep"
    if (detail[0] === 'f') {
      const index = Number.parseInt(timestamp.match(/\d\d:(\d\d)/)[1], 10);

      // edge case: if today doesn't exist, make new record and ALL awake (new)
      if (acc[acc.active][ymd] === undefined) {
        acc[acc.active][ymd] = Array(60).fill(0);
      }

      acc[acc.active][ymd].fill(1, index);
    }

    // case 3: guard wakes up, mark "now" until end as awake
    // "wakes up"
    if (detail[0] === 'w') {
      const index = Number.parseInt(timestamp.match(/\d\d:(\d\d)/)[1], 10);
      acc[acc.active][ymd].fill(0, index);
    }

    return acc;
  }, {});

  delete guards.active;

  const sleepData = Object.entries(guards).reduce((guardTotal, schedule) => {
    const [id, days] = schedule;
    const sleeping = Object.entries(days).reduce((dayTotal, day) => {
      const [, minutes] = day;
      const dayMinutes = minutes.reduce((acc, val) => acc + val, 0);
      return dayMinutes + dayTotal;
    }, 0);
    guardTotal[id] = sleeping; // eslint-disable-line no-param-reassign
    return guardTotal;
  }, {});

  const sleepyGuard = Object.keys(sleepData).reduce(
    (acc, elem) => (sleepData[acc] > sleepData[elem] ? acc : elem),
  );

  console.log(`sleepiest guard id: ${sleepyGuard}`);

  const sleepyMap = lodash._(
    Object.entries(guards)
    // if the id is equal to the most sleepy guard
      .filter(elem => elem[0] === sleepyGuard)

    // get the top entry
      .pop()

    // drop the id part, keep the schedule
      .pop(),
  )
    // calculate the heatgraph for sleepytime
    .reduce(
      (acc, minutes) => {
        acc.forEach((elem, i) => { acc[i] += minutes[i]; });
        return acc;
      },
      Array(60).fill(0),
    );

  const sleepyMinute = Object.keys(sleepyMap).reduce(
    (acc, elem) => (sleepyMap[acc] > sleepyMap[elem] ? acc : elem),
  );

  console.log(`sleepiest minute is: ${sleepyMinute}`);
  console.log(`puzzle solution: ${sleepyGuard * sleepyMinute}`);
  return 0;
});
