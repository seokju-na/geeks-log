import * as fs from 'fs';
import * as path from 'path';

const camelCase = require('lodash').camelCase as (input: string) => string;
const webFontsGenerator =
  require('webfonts-generator') as (options: WebFontsGeneratingOptions) => void;

interface WebFontsGeneratingOptions {
  files: string[];
  dest: string;
  fontName?: string;
  html?: boolean;
  htmlTemplate?: string;
  templateOptions?: {
    classPrefix?: string;
    baseSelector?: string;
  };
  fontHeight?: number;
  rename?: (fileName: string) => string;
}

const ICON_SRC_PATH = path.resolve(__dirname, '../', 'icon-font/svgs/');
const ICON_DEST_PATH = path.resolve(__dirname, '../', 'icon-font/out/');

const icons = fs
  .readdirSync(ICON_SRC_PATH)
  .filter(item => path.extname(item) === '.svg')
  .map(item => path.resolve(ICON_SRC_PATH, item));


webFontsGenerator({
  files: icons,
  dest: ICON_DEST_PATH,
  fontName: 'GeeksLogIcon',
  html: true,
  htmlTemplate: path.resolve(__dirname, 'icon-preview.hbs'),
  /**
   * This should be needed because there is an issue during transforms svg to
   * true-type font. Font height must be at least 1000. See issue via link:
   *  https://github.com/nfroidure/svgicons2svgfont/issues/85#issuecomment-368411981
   */
  fontHeight: 1000,
  templateOptions: {
    classPrefix: 'GeeksLogIcon__',
    baseSelector: '.GeeksLogIcon',
  },
  rename(fileName) {
    const iconName = path.basename(fileName, path.extname(fileName));
    return camelCase(iconName);
  },
});
