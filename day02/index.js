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
    const processed = data

      // split input into an array of strings
      .split('\n')

      // split each string into array of chars
      .map(item => Array.from(item))

      // transform each char-array into a char-count object
      .map(item => item.reduce(
        (acc, chr) => {
          acc[chr] = (acc[chr] || 0) + 1;
          return acc;
        }, {},
      ))

      // filter char-count objects for 2-counts & 3-counts
      .reduce(
        (acc, obj) => {
          acc['2-count'] += Object.keys(obj).some(item => obj[item] === 2) ? 1 : 0;
          acc['3-count'] += Object.keys(obj).some(item => obj[item] === 3) ? 1 : 0;

          return acc;
        }, { '2-count': 0, '3-count': 0 },
      );

    // calculate checksum (2-count * 3-count)
    const checksum = processed['2-count'] * processed['3-count'];
    return console.log(checksum);
  }

  if (yargs.part === 2) {
    const hamming = (base, comparison) => {
      let distance = 0;
      let position;

      [...base].forEach((chr, i) => {
        if (chr !== [...comparison][i]) {
          distance += 1;
          position = i;
        }
      });

      return { distance, position };
    };

    const findHamming = ({ arr, dist }) => {
      let search;
      arr.forEach((base, iter) => {
        arr
          .slice(iter + 1, arr.length)
          .forEach((subject) => {
            const { distance, position } = hamming(base, subject);

            if (distance === dist) {
              search = base.substring(0, position) + base.substring(position + 1, base.length);
            }
          });
      });

      return search;
    };

    return console.log(
      findHamming({ arr: data.split('\n'), dist: 1 }),
    );
  }

  return console.log('Invalid mode!');
});
