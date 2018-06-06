'use strict';

const REPL = require('./repl');
const Module = require('module');
const util = require('util');

const builtinLibs = Module.builtinModules.filter((x) => !/^_|\//.test(x));

builtinLibs.forEach((name) => {
  const setReal = (val) => {
    delete global[name];
    global[name] = val;
  };

  Object.defineProperty(global, name, {
    get: () => {
      const lib = require(name);
      delete global[name];
      Object.defineProperty(global, name, {
        get: () => lib,
        set: setReal,
        configurable: true,
        enumerable: false,
      });

      return lib;
    },
    set: setReal,
    configurable: true,
    enumerable: false,
  });
});

const m = new Module(process.cwd());
m._compile('module.exports = require', process.cwd());
global.require = m.exports;

global.REPL = {
  time: (fn) => {
    const { Suite } = require('benchmark');
    let r;
    new Suite().add(fn.name, fn)
      .on('cycle', (event) => {
        r = event.target;
        r[util.inspect.custom] = () => String(r);
      })
      .run();
    return r;
  },
};

new REPL(process.stdout, process.stdin); // eslint-disable-line no-new
