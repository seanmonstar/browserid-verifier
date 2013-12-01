var temp  = require('temp'),
    spawn = require('child_process').spawn,
    path  = require('path'),
    fs    = require('fs');

// first we'll create a directory for aggregating coverage data
temp.mkdir("verifier-coverage-data", function(err, dn) {
  if (err) throw new Error(err);

  // convey the directory to child processes
  process.env.REPORT_COVERAGE_DIR = dn;

  // execute all tests
  var p = spawn(
    process.env._,
    [
      path.join(__dirname, '..', 'node_modules', '.bin', 'mocha'),
      '-R',
      'spec',
      'tests/*.js'
    ],
    {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

  p.on('exit', function(code) {
    console.log(code);
    // now let's generate coverage data
    var p = spawn(
      process.env._,
      [
        path.join(__dirname, '..', 'node_modules', '.bin', 'mocha'),
        '-R',
        'html-cov',
        'scripts/calculate_coverage.js'
      ],
      {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });

    var html = "";
    p.stdout.on('data', function(data) {
      html += data;
    });

    p.on('exit', function(code) {
      if (code !== 0) {
        console.log("error assessing coverage stats:", code);
      }
      console.log(html);
      // write coverage report
      fs.writeFileSync('coverage.html', html);
      // extract %age
      var m = /<div\s*class="percentage">(\d+%)<\/div>/.exec(html);
      var coverage = "unknown";
      console.log(m[0]);
      if (m && m.length > 1) {
        coverage = m[1];
      }
      console.log(coverage, 'code coverage (see coverage.html)');
    });
  });
});