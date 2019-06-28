import { copy, emptyDir } from 'fs-extra';
import * as path from 'path';
import environment from '../src/environment';
import RxChildProcess from '../src/utility/RxChildProcess';
import toPromise from '../src/utility/toPromise';

const {
  TMP_PATH,
  MAX_DEPLOY_SIZE,
} = environment.noteServingSagaConfig;

const rootDirt = path.resolve(__dirname, '../');
const noteViewerPath = path.resolve(rootDirt, 'node_modules/@geeks-log/note-viewer');
const { fromSpawn } = new RxChildProcess();

async function installYarn(projectDir: string) {
  console.log(`install yarn start: ${projectDir}`);

  await toPromise(fromSpawn(
    'yarn',
    ['install'],
    { cwd: projectDir },
  ));

  console.log(`install yarn dne: ${projectDir}`);
}

async function setupNoteViewerServingSaga() {
  console.log(`clear path: ${TMP_PATH}`);
  await emptyDir(TMP_PATH);

  const installJobs: Promise<void>[] = [];

  for (let i = 0; i < MAX_DEPLOY_SIZE; i += 1) {
    const tmpUnitPath = path.resolve(TMP_PATH, `${i}/`);

    console.log(`copy '@geeks-log/note-viewer' to ${tmpUnitPath}`);
    await copy(noteViewerPath, tmpUnitPath);
    await emptyDir(path.resolve(tmpUnitPath, 'node_modules/'));

    installJobs.push(installYarn(tmpUnitPath));
  }

  await Promise.all(installJobs);
}

setupNoteViewerServingSaga()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
