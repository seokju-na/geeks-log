import { SpawnOptions } from 'child_process';
import { pathExists } from 'fs-extra';
import path from 'path';
import getUpdatedPackagesInPR from './getUpdatedPackagesInPR';
import spawn from './spawn';

async function testPackage(rootDir: string, pkg: string) {
  const packageDir = path.resolve(rootDir, pkg);
  const packageFilePath = path.resolve(packageDir, 'package.json');

  if (!await pathExists(packageFilePath)) {
    console.warn(`[ci] Skip "${pkg}" because "package.json" file not found.`);
    return;
  }

  try {
    const options: SpawnOptions = {
      cwd: packageDir,
      stdio: 'inherit',
    };

    await spawn('yarn', [], options);
    await spawn('yarn', ['test'], options);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

export default async function testPackages(rootDir: string) {
  const updatedPackages = await getUpdatedPackagesInPR(rootDir);

  for (const pkg of updatedPackages) {
    console.log(`[ci] Testing "${pkg}"`);

    await testPackage(rootDir, pkg);
  }
}
