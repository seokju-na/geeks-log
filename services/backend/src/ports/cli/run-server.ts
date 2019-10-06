import { Command as CLICommand } from '@oclif/command';
import { bootstrapServer } from '../server';

export default class RunServer extends CLICommand {
  async run() {
    try {
      await bootstrapServer();
    } catch (error) {
      this.error(error, { exit: 1 });
    }
  }
}
