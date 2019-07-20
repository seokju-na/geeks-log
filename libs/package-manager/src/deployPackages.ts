import execa from 'execa';
import * as fs from 'fs';
import { pathExists } from 'fs-extra';
import { flatMap } from 'lodash';
import { Repository, Signature } from 'nodegit';
import { EOL } from 'os';
import { DEPLOY_COMMIT_MESSAGE, filterIgnoreCommits, ROOT_PACKAGE } from './constants';
import createTags from './git/createTags';
import getCommitsFromRange from './git/getCommitsFromRange';
import groupCommitsByPackage from './git/groupCommitsByPackage';
import pushRefs from './git/pushRefs';
import BumpType from './models/BumpType';
import PackageInfo from './models/PackageInfo';
import bumpPackageVersion from './package/bumpPackageVersion';
import createTagMessageForVersionBumping from './package/createTagMessageForVersionBumping';
import createTagNameForVersionBumping from './package/createTagNameForVersionBumping';
import readPackageInfo from './package/readPackageInfo';
import getBumpTypeFromCommits from './version/getBumpTypeFromCommits';
import getNextVersion from './version/getNextVersion';

interface UpdatedPackageInfo {
  pkg: PackageInfo;
  nextVersion: string;
}

async function deployPackage({ pkgName, pkgDirectoryPath, pkgFilePath }: PackageInfo) {
  if (!await pathExists(pkgFilePath)) {
    console.warn(`[cd] Skip "${pkgName}" because 'package.json' file not found.`);
    return;
  }

  try {
    const options = {
      cwd: pkgDirectoryPath,
      stdio: 'inherit',
    };

    await execa.shell('yarn', options);
    await execa.shell('npm run deploy', options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

function getUpdatedPackageInfoDescription({
  pkg: { pkgName, version: previousVersion },
  nextVersion,
}: UpdatedPackageInfo) {
  const name = pkgName === ROOT_PACKAGE ? '(root)' : pkgName;
  const prevVersionName = previousVersion === undefined ? '?' : previousVersion;

  return `${name} ${prevVersionName} -> ${nextVersion}`;
}

async function createVersionBumpingCommit(repo: Repository, updatedPackages: UpdatedPackageInfo[]) {
  const signature = Signature.now('Seokju Na', 'seokju.me@gmail.com');
  const versionPaths = flatMap(updatedPackages, ({ pkg: { pkgFilePath } }) => {
    if (fs.existsSync(pkgFilePath)) {
      return [pkgFilePath];
    }

    return [];
  });

  const message = updatedPackages
    .map(getUpdatedPackageInfoDescription)
    .join(EOL);

  return await repo.createCommitOnHead(
    versionPaths,
    signature,
    signature,
    `${DEPLOY_COMMIT_MESSAGE}${EOL}${EOL}${message}`,
  );
}

export default async function deployPackages(rootDir: string) {
  const repo = await Repository.open(rootDir);

  const headCommit = await repo.getHeadCommit();
  const latestCommits = (await getCommitsFromRange(repo, headCommit, DEPLOY_COMMIT_MESSAGE))
    .filter(filterIgnoreCommits);

  console.log(`[cd] Found commits:${EOL}${latestCommits.map(commit => `- ${commit.message()}`)
    .join(EOL)}`);

  const group = await groupCommitsByPackage(latestCommits);

  // Ensure root bumping included
  if (group[ROOT_PACKAGE] === undefined) {
    group[ROOT_PACKAGE] = [];
  }

  const updatedPackages: UpdatedPackageInfo[] = [];

  // 1) Bump package version
  for (const pkg of Object.keys(group)) {
    const commits = group[pkg];
    const pkgInfo = await readPackageInfo(rootDir, pkg);

    if (pkgInfo === null) {
      continue;
    }

    const bumpType = pkg === ROOT_PACKAGE ? BumpType.Major : getBumpTypeFromCommits(commits);
    const nextVersion = getNextVersion(pkgInfo.version, bumpType);
    await bumpPackageVersion(pkgInfo, nextVersion);

    const updatePackage: UpdatedPackageInfo = {
      pkg: pkgInfo,
      nextVersion,
    };

    console.log(`[cd] Bump version: ${getUpdatedPackageInfoDescription(updatePackage)}`);
    updatedPackages.push(updatePackage);
  }

  // 2) Create bump version commit and tags
  const versionBumpingCommitId = await createVersionBumpingCommit(repo, updatedPackages);
  const tagsToCreate = updatedPackages.map(({ pkg, nextVersion }) => {
    const commits = group[pkg.pkgName] || [];

    return {
      name: createTagNameForVersionBumping(pkg, nextVersion),
      message: createTagMessageForVersionBumping(pkg, commits),
    };
  });

  const tagRefs = await createTags(repo, versionBumpingCommitId, tagsToCreate);

  const remote = await repo.getRemote('origin');
  await pushRefs(remote, tagRefs);

  // 3) Deploy packages
  for (const { pkg } of updatedPackages) {
    if (pkg.pkgName === ROOT_PACKAGE) {
      continue;
    }

    console.log(`[cd] Deploy start: ${pkg.pkgName}`);
    await deployPackage(pkg);
    console.log(`[cd] Deploy complete: ${pkg.pkgName}`);
  }
}
