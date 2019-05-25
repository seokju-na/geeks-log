import { copySync } from 'fs-extra';
import * as path from 'path';

const ICON_DEST_PATH = path.resolve(__dirname, '../', 'icon-font/out/');
const DIST = path.resolve(__dirname, '../', 'dist/icon-font/');

copySync(ICON_DEST_PATH, DIST);
