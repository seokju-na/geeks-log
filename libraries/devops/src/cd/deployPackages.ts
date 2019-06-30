import execa from 'execa';
import { pathExists } from 'fs-extra';
import { Cred, Remote, Repository } from 'nodegit';
import path from 'path';
import { getUpdatedPackageInfoDescription, ROOT_PACKAGE, UpdatedPackageInfo } from '../core/models';
import { getBumpTypeOfPackage, getLatestCommits, groupCommitsByPackage } from '../update-tracker';
import createTag from './createTag';
import createVersionBumpingCommit from './createVersionBumpingCommit';
import updatePackageVersion from './updatePackageVersion';

export default async function deployPackages(rootDir: string) {
  const repository = await Repository.open(rootDir);
  const latestCommits = await getLatestCommits(repository);
  const commitsByPackageGroup = await groupCommitsByPackage(latestCommits);

  // Ensure root bumping included
  if (!commitsByPackageGroup[ROOT_PACKAGE]) {
    commitsByPackageGroup[ROOT_PACKAGE] = [];
  }

  const updatedPackageInfos: UpdatedPackageInfo[] = [];

  // 1) Update package version
  for (const pkg of Object.keys(commitsByPackageGroup)) {
    const commits = commitsByPackageGroup[pkg];
    const bumpType = getBumpTypeOfPackage(pkg, commits);
    const updatedPkgInfo = await updatePackageVersion(rootDir, pkg, bumpType);

    if (updatedPkgInfo === null) {
      continue;
    }

    console.log(`[cd] Bump version: ${getUpdatedPackageInfoDescription(updatedPkgInfo)}`);
    updatedPackageInfos.push(updatedPkgInfo);
  }

  // 2) Bump version and create tags
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
    const options = {
      cwd: packageDir,
      stdio: 'inherit',
    };

    await execa.shell('yarn', options);
    await execa.shell('npm run deploy', options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
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
