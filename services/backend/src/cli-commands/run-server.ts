import { Command } from '@oclif/command';
import { bootstrapServer } from '../server';

export default class RunServer extends Command {
  async run() {
    try {
      await bootstrapServer();
    } catch (error) {
      this.error(error, { exit: 1 });
    }
  }
}
