import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';

export default [
  buildCSS('src/styles.scss', 'dist/styles.css'),
  buildCSS('src/styles.scss', 'dist/styles.min.css', {
    minimize: {
      preset: ['default'],
    },
  }),
];

function buildCSS(inputFile, outputFile, postCSSOptions = {}) {
  return {
    input: inputFile,
    output: { file: outputFile, format: 'cjs' }, // format is not used.
    plugins: [
      postcss({
        plugins: [autoprefixer],
        sourceMap: true,
        extract: true,
        extensions: ['.scss', '.css'],
        ...postCSSOptions,
      }),
    ],
  };
}
