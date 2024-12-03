import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import polyfillNode from 'rollup-plugin-polyfill-node';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',
      name: 'smartDictionary',
    },
    plugins: [
      resolve({ browser: true, mainFields: ['browser', 'module', 'main'] }),
      commonjs(),
      json(),
      polyfillNode(),
    ]
  },
  {
    input: 'popup/popup.js',
    output: {
      file: 'dist/popup.js',
      format: 'iife',
      name: 'smartDictionaryPopup',
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];

