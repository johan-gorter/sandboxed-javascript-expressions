import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// Typescript creates the ES module output, let rollup do the rest

export default [
  // browser-friendly UMD build
  {
    input: 'dist/index.js',
    output: {
      name: 'sandboxed-javascript-expressions',
      file: pkg.exports['.'].browser,
      format: 'umd'
    },
    plugins: []
  },
  // ES module build, with the .mjs extension so that nodejs loads it as a module
  {
    input: 'dist/index.js',
    output: {
      file: pkg.exports['.'].import,
      format: 'es'
    }
  },
  // CommonJS build for nodeJS
  {
    input: 'dist/index.js',
    output: {
      file: pkg.exports['.'].require,
      format: 'cjs'
    }
  }
];
