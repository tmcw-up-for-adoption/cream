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
    subset.permalink = subset.permalink;
    var parts = url.parse(subset.homepage_url);
    if (!parts || !parts.host) return callback();
    parts.path = parts.path.replace(/\/$/, '');
    parts.host = parts.host.replace(/^www-?\d{0,2}\./, '');
    subset.homepage_url = parts.host + parts.path;
    subset.funding = val;
    this.push([[subset.homepage_url, subset.funding, subset.permalink]]);
    callback();
  }))
  .pipe(concat(function(data) {
    var obj = {};
    data.forEach(function(d) {
        obj[d[0]] = [d[1], d[2]];
    });
    fs.writeFileSync('companies-distilled.json', JSON.stringify(obj, null, 2));
    fs.writeFileSync('./extension/background.js',
        fs.readFileSync('./extension/background.template.js', 'utf8')
            .replace('DATA', JSON.stringify(obj)));
  }));
