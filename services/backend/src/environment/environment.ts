import EnvironmentConfig from './configs/EnvironmentConfig';

const target = process.env.TARGET || 'local';

class Environment {
  public readonly target = target;
  public readonly config: EnvironmentConfig;

  constructor() {
    try {
      this.config = require(`./configs/${this.target}.config`).default;
    } catch (error) {
      throw error;
    }
  }
}

const environment = new Environment();
export default environment;
