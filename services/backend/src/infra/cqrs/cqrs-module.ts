import { Module, OnModuleInit } from '@nestjs/common';
import { Cqrs } from './cqrs';
import { ExplorerService } from './explorer-service';
import { Sagas } from './sagas';

@Module({
  providers: [
    Cqrs,
    Sagas,
    ExplorerService,
  ],
  exports: [
    Cqrs,
  ],
})
export class CqrsModule implements OnModuleInit {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly cqrs: Cqrs,
    private readonly sagas: Sagas,
  ) {
  }

  onModuleInit() {
    const { sagas, queries, commands } = this.explorerService.explore();

    this.cqrs._registerCommandHandlers(commands);
    this.cqrs._registerQueryHandlers(queries);
    this.sagas._registerSagas(sagas);
  }
}
