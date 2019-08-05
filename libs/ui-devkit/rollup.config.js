import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';

export default [
  buildCSS('src/a11y.scss', 'dist/a11y.css'),
  buildCSS('src/a11y.scss', 'dist/a11y.min.css', {
    minimize: {
      preset: ['default'],
    },
  }),
  buildCSS('src/text-field.scss', 'dist/text-field.css'),
  buildCSS('src/text-field.scss', 'dist/text-field.min.css', {
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
