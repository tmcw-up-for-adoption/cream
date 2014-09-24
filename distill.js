var fs = require('fs'),
  through = require('through2'),
  url = require('url'),
  _ = require('lodash'),
  concat = require('concat-stream'),
  csvParse = require('csv-parser');

fs.createReadStream('./companies/Companies-Table 1.csv')
  .pipe(csvParse())
  .pipe(through({ objectMode: true }, function(data, enc, callback) {
    var val = parseFloat(data.funding_total_usd.replace(',', ''));
    if (isNaN(val)) return callback();
    var subset = _.pick(data, ['permalink', 'homepage_url', 'name']);
    subset.permalink = subset.permalink.replace('/organization', '');
    var parts = url.parse(subset.homepage_url);
    if (!parts) return callback();
    subset.homepage_url = parts.host;
    subset.funding = val;
    this.push(subset);
    callback();
  }))
  .pipe(concat(function(data) {
    console.log(data);
    fs.writeFileSync('companies-distilled.json', JSON.stringify(data));
  }));
