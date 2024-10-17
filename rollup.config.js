import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'dist/index.js',
    external: ['bootstrap'],
    output: {
      file: 'build/index.js',
      format: 'iife',
      name:"judge",
      plugins: [
        terser({
          mangle:false
        })
      ],
      sourcemap:true
    },
    
    plugins: [
        commonjs(),
        nodeResolve()
    ]
  };