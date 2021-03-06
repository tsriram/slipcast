'use strict';

const config = require('../../config/slipcast');
const handlebars = require('handlebars');
const Metalsmith = require('metalsmith');
const { join, parse } = require('path');

if (config.handlebars) {
  config.handlebars(handlebars);
}

Metalsmith.prototype.uses = function(plugins) {
  this.plugins.push.apply(this.plugins, plugins);
  return this;
}

Metalsmith('.')
  .clean(false)
  .destination(config.output)
  .source(config.folders.pages)
  .uses(config.build.html.beforePlugins)
  .use(function(files, metalsmith, done) {
    Object.keys(files).forEach(file => {
      files[file].path = parse(file);
    });
    done();
  })
  .use(require('metalsmith-in-place')({
    engine: 'handlebars',
    partials: config.folders.views,
    pattern: '**/*.hbs'
  }))
  .use(require('metalsmith-layouts')({
    default: 'application.hbs',
    directory: join(config.folders.views, 'layouts'),
    engine: 'handlebars',
    pattern: '**/*.hbs',
    partials: config.folders.views,
    rename: true
  }))
  .uses(config.build.html.afterPlugins)
  .build(function(error) {
    if (error) { throw error; }
  });
