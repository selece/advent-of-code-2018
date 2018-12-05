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

  const pattern = /^#(\d*) @ (\d*),(\d*): (\d*)x(\d*)$/;

  const init = size => Array.from(
    { length: size },
    () => Array.from({ length: size }, () => 0),
  );

  const write = (arr, {
    _x, _y, _w, _h,
  }) => arr.map((row, y) => {
    // while we are inside the HEIGHT
    if (y >= _y && y < _y + _h) {
      return row.map((val, x) => {
        // while we are inside the WIDTH
        if (x >= _x && x < _x + _w) {
          return val + 1;
        }
        return val;
      });
    }

    return row;
  });

  const calc = (arr) => {
    let result = 0;
    arr.forEach((row) => {
      row.forEach((val) => { result += val > 1 ? 1 : 0; });
    });

    return result;
  };

  const overlaps = (arr, {
    _x, _y, _w, _h,
  }) => {
    const contains = [];
    arr.slice(_y, _y + _h).forEach((row) => { contains.push(row.slice(_x, _x + _w)); });

    if (contains.some(row => row.some(elem => elem > 1))) {
      return true;
    }

    return false;
  };

  if (yargs.part === 1) {
    const processed = data

      // split input into an array of strings
      .split('\n')

      // regexp extraction & cleanup
      .map((line) => {
        const [, id, x, y, w, h] = line.match(pattern);
        return {
          id,
          x: Number.parseInt(x, 10),
          y: Number.parseInt(y, 10),
          w: Number.parseInt(w, 10),
          h: Number.parseInt(h, 10),
        };
      });

    const grid = init(1001);

    let result = grid;
    processed.forEach((claim) => {
      const {
        x, y, w, h,
      } = claim;
      result = write(
        result,
        {
          _x: x, _y: y, _w: w, _h: h,
        },
        true,
      );
    });

    return console.log(calc(result));
  }

  if (yargs.part === 2) {
    const processed = data

      // split input into an array of strings
      .split('\n')

      // regexp extraction & cleanup
      .map((line) => {
        const [, id, x, y, w, h] = line.match(pattern);
        return {
          id,
          x: Number.parseInt(x, 10),
          y: Number.parseInt(y, 10),
          w: Number.parseInt(w, 10),
          h: Number.parseInt(h, 10),
        };
      });

    const grid = init(1001);

    let result = grid;
    processed.forEach((claim) => {
      const {
        x, y, w, h,
      } = claim;
      result = write(
        result,
        {
          _x: x, _y: y, _w: w, _h: h,
        },
      );
    });

    processed.forEach((claim) => {
      const {
        id, x, y, w, h,
      } = claim;

      if (!overlaps(result, {
        _x: x, _y: y, _w: w, _h: h,
      })) {
        console.log(`claim ${id} has no overlaps`);
      }
    });

    return 0;
  }

  return console.log('Invalid mode!');
});
