/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var convict = require('convict');

function loadConf() {
  var conf = convict({
    ip: {
      doc: "The IP address to bind.",
      format: "ipaddress",
      default: "127.0.0.1",
      env: "IP_ADDRESS",
    },
    port: {
      doc: "The port to bind.",
      format: "port",
      default: 0,
      env: "PORT"
    },
    fallback: {
      doc: "The domain of the fallback server, authoritative when lookup fails.",
      format: String,
      default: "",
      env: "FALLBACK_DOMAIN"
    },
    httpTimeout: {
      doc: "(s) how long to spend attempting to fetch support documents",
      format: Number,
      default: 8.0,
      env: "HTTP_TIMEOUT"
    },
    insecureSSL: {
      doc: "(testing only) Ignore invalid SSL certificates",
      format: Boolean,
      default: false,
      env: "INSECURE_SSL"
    },
  });

  // load environment dependent configuration
  if (process.env.CONFIG_FILES) {
    var files = process.env.CONFIG_FILES.split(',');
    files.forEach(function(file) {
      conf.loadFile(file);
    });
  }

  // validation configuration
  conf.validate();

  module.exports = conf;

  process.nextTick(function() {
    require('./log').debug("current configuration:", conf.get());
  });
}

loadConf();

// command line options

var args = require('optimist')
.alias('h', 'help')
.describe('h', 'display this usage message')
.alias('c', 'config')
.describe('c', 'Display current configuration.');

var argv = args.argv;

if (argv.h) {
  args.showHelp();
  process.exit(1);
}

if (argv.c) {
  console.log(module.exports.get());
  process.exit(0);
}
