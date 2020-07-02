import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = false

export default {
  input: 'demo/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'demo/build/bundle.js'
  },
  plugins: [
    svelte({
      dev: true,
      css: css => {
        css.write('demo/build/bundle.css');
      }
    }),

    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),

    serve(),
    livereload('public'),
    // terser()
  ],
  watch: {
    clearScreen: false
  }
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}
