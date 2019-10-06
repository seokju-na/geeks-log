// noinspection TypeScriptPreferShortImport
import { bootstrapServer } from './ports/server';

declare const module: {
  hot?: {
    accept(): void;
    dispose(callback: () => any): void;
  };
};

async function main() {
  const server = await bootstrapServer();

  // Hot module replacement for development purpose.
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => server.close());
  }
}

main();
