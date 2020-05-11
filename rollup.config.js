import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';

export default [
  {
    input: 'src/SuggestBox.svelte',
    output: [
      { file: pkg.main, format: 'umd', name: 'SuggestBox' }
    ],
    plugins: [svelte(), commonjs(), resolve()]
  }
];
