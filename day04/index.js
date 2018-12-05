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
        const [, year, month, day, time, detail] = line.match(pattern);
        return {
          year, month, day, time, detail,
        };
      }),
    )
    .sortBy(['year', 'month', 'day', 'time'])
    .value();

  console.log(processed);

  return 0;
});
