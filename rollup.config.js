import pkg from './package.json';

// Typescript creates the commonJS package, let rollup do the rest

export default [
  // browser-friendly UMD build
  {
    input: 'dist/index.js',
    output: {
      name: 'sandboxed-javascript-expressions',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: []
  },
  // CommonJS build for nodeJS
  {
    input: 'dist/index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    }
  }
];
