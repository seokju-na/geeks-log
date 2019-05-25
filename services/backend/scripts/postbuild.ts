import { copyFile, readJson, writeJson } from 'fs-extra';
import * as path from 'path';

interface PackageInfo {
  name: string;
  version: string;
  main: string;
  dependencies: { [packageName: string]: string };
  devDependencies: { [packageName: string]: string };
}

async function postbuild() {
  const packageInfo: PackageInfo = await readJson(path.resolve(__dirname, '../package.json'));

  // Write firebase function package info
  const firebaseFunctionsPackageInfo: PackageInfo = {
    name: packageInfo.name,
    version: packageInfo.version,
    main: 'index.js',
    dependencies: packageInfo.dependencies,
    devDependencies: {
      'firebase-functions-test': packageInfo.devDependencies['firebase-functions-test'],
    },
  };

  await writeJson(
    path.resolve(__dirname, '../dist/ports/http/package.json'),
    firebaseFunctionsPackageInfo,
    { spaces: 2 },
  );

  // Copy 'private-key.json'
  await copyFile(
    path.resolve(__dirname, '../src/environment/configs/private-key.json'),
    path.resolve(__dirname, '../dist/environment/configs/private-key.json'),
  );
}

postbuild()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
