import ts from 'rollup-plugin-ts';
import vue from 'rollup-plugin-vue';
import pkg from './package.json';

export default [
    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/main.ts',
        external: ['ms'],
        output: [
            { file: `dist/${pkg.main}`, format: 'cjs', exports: 'default' },
            { file: `dist/${pkg.module}`, format: 'es' },
        ],
        plugins: [ts(), vue()],
    },
];
