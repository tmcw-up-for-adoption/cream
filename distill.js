var fs = require('fs'),
  through = require('through2'),
  url = require('url'),
  _ = require('lodash'),
  concat = require('concat-stream'),
  csvParse = require('csv-parser');

fs.createReadStream('./companies/Companies-Table 1.csv')
  .pipe(csvParse())
  .pipe(through({ objectMode: true }, function(data, enc, callback) {
    var val = parseFloat(data.funding_total_usd.replace(/,/g, ''));
    if (isNaN(val)) return callback();
    var subset = _.pick(data, ['permalink', 'homepage_url', 'name']);
    subset.permalink = subset.permalink.replace('/organization', '');
    var parts = url.parse(subset.homepage_url);
    if (parts.path && parts.path !== '/') return callback();
    if (!parts) return callback();
    subset.homepage_url = parts.host;
    subset.funding = val;
    if (subset.funding && parts.host) {
        this.push([[parts.host.replace(/^www\./, ''), subset.funding]]);
    }
    callback();
  }))
  .pipe(concat(function(data) {
    var obj = {};
    data.forEach(function(d) {
        if (obj[d[0]] === undefined) obj[d[0]] = 0;
        obj[d[0]] += d[1];
    });
    fs.writeFileSync('companies-distilled.json', JSON.stringify(obj, null, 2));
    fs.writeFileSync('./extension/background.js',
        fs.readFileSync('./extension/background.template.js', 'utf8')
            .replace('DATA', JSON.stringify(obj)));
  }));
