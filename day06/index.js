const fs = require('fs');
const _ = require('lodash');
const yargs = require('yargs')

  // input (i)
  .alias('i', 'input')
  .describe('i', 'Input file for parsing')
  .nargs('i', 1)

  // other yargs config
  .demandOption(['i'])
  .help('help')
  .argv;

const manhattan = (p1, p2) => Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);

fs.readFile(yargs.input, 'utf8', (err, data) => {
  if (err) {
    return console.log(`Error: ${err}`);
  }

  const points = data
    .split('\n')
    .map((e) => {
      const [, x, y] = e.match(/(\d*), (\d*)/);
      return { x: parseInt(x, 10), y: parseInt(y, 10) };
    });

  const limits = _.reduce(points, (acc, point) => {
    acc.maxX = point.x > acc.maxX ? point.x : acc.maxX;
    acc.maxY = point.y > acc.maxY ? point.y : acc.maxY;
    acc.minX = point.x < acc.minX ? point.x : acc.minX;
    acc.minY = point.y < acc.minY ? point.y : acc.minY;

    return acc;
  }, {
    minX: Infinity, minY: Infinity, maxX: -1, maxY: -1,
  });

  const shiftedPoints = points.map(
    point => ({
      x: point.x - limits.minX,
      y: point.y - limits.minY,
    }),
  );

  const shiftedLimits = {
    minX: 0,
    minY: 0,
    maxX: limits.maxX - limits.minX,
    maxY: limits.maxY - limits.minY,
  };

  return 0;
});
