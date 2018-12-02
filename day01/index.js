const fs = require('fs');
const yargs = require('yargs')

  // input (i)
  .alias('i', 'input')
  .describe('i', 'Input file for parsing')
  .nargs('i', 1)

  // part (p)
  .alias('p', 'part')
  .describe('p', 'Part 01/02 selection')
  .nargs('p', 1)

  // other yargs config
  .demandOption(['i', 'p'])
  .help('help')
  .argv;

fs.readFile(yargs.input, 'utf8', (err, data) => {
  if (err) {
    return console.log(`Error: ${err}`);
  }

  if (yargs.part === 1) {
    return console.log(
      data
        .split('\n')
        .map(item => Number.parseInt(item, 10))
        .reduce((item, sum) => sum + item),
    );
  }

  if (yargs.part === 2) {
    const processed = data
      .split('\n')
      .map(item => Number.parseInt(item, 10));

    let freq = 0;
    let index = 0;
    let found;
    const search = [];

    while (found === undefined) {
      freq += processed[index % processed.length];

      if (search.includes(freq)) {
        found = freq;
      } else {
        search.push(freq);
      }

      index += 1;
    }

    return console.log(found);
  }
});
