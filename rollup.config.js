import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/content.js',
      format: 'iife',
      name: 'smartDictionary'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  {
    input: 'popup/popup.js',
    output: {
      file: 'dist/popup.js',
      format: 'iife',
      name: 'smartDictionaryPopup'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];

