import { spawn as nodeSpawn, SpawnOptions } from 'child_process';

export default function spawn(command: string, args: string[], options: SpawnOptions = {}) {
  return new Promise((resolve, reject) => {
    const process = nodeSpawn(command, args, options);

    const onClose = (exitCode: number) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject();
      }
    };

    const onError = (error: Error) => {
      reject(error);
    };

    process.on('close', onClose);
    process.on('error', onError);
  })
}
