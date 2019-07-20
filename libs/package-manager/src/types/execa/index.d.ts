declare module 'execa' {
  interface Options {
    cwd: string;
    env: string;
    stdio: string;
  }

  function exec(
    command: string,
    args: string[],
    options: Partial<Options> = {}
  ): Promise<{ stdout: string }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function shell(command: string, options: Partial<Options> = {}): Promise<any>;

  export = exec;
  export { shell };
}
