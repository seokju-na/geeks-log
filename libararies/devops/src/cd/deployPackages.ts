import { SpawnOptions } from 'child_process';
import { pathExists } from 'fs-extra';
import { Cred, Remote, Repository } from 'nodegit';
import path from 'path';
import { ROOT_PACKAGE, UpdatedPackageInfo } from '../core/models';
import { getBumpTypeOfPackage, getLatestCommits, groupCommitsByPackage } from '../update-tracker';
import { spawn } from '../utils';
import createTag from './createTag';
import createVersionBumpingCommit from './createVersionBumpingCommit';
import updatePackageVersion from './updatePackageVersion';

export default async function deployPackages(rootDir: string) {
  const repository = await Repository.open(rootDir);
  const latestCommits = await getLatestCommits(repository);
  const commitsByPackageGroup = await groupCommitsByPackage(latestCommits);

  const updatedPackageInfos: UpdatedPackageInfo[] = [];

  // 1) Update package version
  for (const pkg of Object.keys(commitsByPackageGroup)) {
    const commits = commitsByPackageGroup[pkg];
    const bumpType = getBumpTypeOfPackage(pkg, commits);
    const updatedPkgInfo = await updatePackageVersion(rootDir, pkg, bumpType);

    if (updatedPkgInfo === null) {
      continue;
    }

    console.log(`[cd] Bump version: ${getUpdateInfoDescription(updatedPkgInfo)}`);
    updatedPackageInfos.push(updatedPkgInfo);
  }

  // 2) Bump version and create tags
  if (updatedPackageInfos.length > 0) {
    const versionBumpingCommitId = await createVersionBumpingCommit(
      repository,
      updatedPackageInfos,
    );
    const tagRefs = await Promise.all(
      updatedPackageInfos.map(updatedPkgInfo =>
        createTag(repository, versionBumpingCommitId, updatedPkgInfo),
      ),
    );

    const remote = await repository.getRemote('origin');
    await pushToGit(remote, ['refs/heads/master', ...tagRefs]);

    remote.free();
  }

  repository.free();

  // 3) Deploy packages
  for (const { name: pkg } of updatedPackageInfos) {
    if (pkg === ROOT_PACKAGE) {
      continue;
    }

    console.log(`[cd] Deploy start: ${pkg}`);
    await deployPackage(rootDir, pkg);
    console.log(`[cd] Deploy complete: ${pkg}`);
  }
}

async function deployPackage(rootDir: string, pkg: string) {
  const packageDir = path.resolve(rootDir, pkg);
  const packageFilePath = path.resolve(packageDir, 'package.json');

  if (!await pathExists(packageFilePath)) {
    console.warn(`[cd] Skip ${pkg} because 'package.json' file not found.`);
    return;
  }

  try {
    const options: SpawnOptions = {
      cwd: packageDir,
      stdio: 'inherit',
    };

    await spawn('yarn', [], options);
    await spawn('yarn', ['deploy'], options);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

function getUpdateInfoDescription({ name, previousVersion, nextVersion }: UpdatedPackageInfo) {
  return `${name} ${previousVersion ? previousVersion : '?'} -> ${nextVersion}`;
}

async function pushToGit(remote: Remote, refs: string[]) {
  const pushTargets = refs.map(ref => {
    if (ref === 'refs/heads/master') {
      return `HEAD:${ref}`;
    }

    return `${ref}:${ref}`;
  });

  return remote.push(pushTargets, {
    callbacks: {
      certificateCheck: function () {
        return 0;
      },
      credentials: function () {
        return Cred.userpassPlaintextNew(process.env.GITHUB_TOKEN!, 'x-oauth-basic');
      },
    },
  });
}
