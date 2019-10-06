import { DynamicModule, Module, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Cqrs } from './cqrs';
import { Sagas } from './sagas';
import { COMMAND_HANDLERS_TOKEN, QUERY_HANDLERS_TOKEN, SAGAS_TOKEN } from './tokens';

interface CqrsInitializeOptions {
  commandHandlers: Type<any>[];
  queryHandlers: Type<any>[];
  sagas: Type<any>[];
}

@Module({})
export class CqrsModule implements OnModuleInit {
  static initialize(options: CqrsInitializeOptions): DynamicModule {
    const { commandHandlers, queryHandlers, sagas } = options;

    return {
      module: CqrsModule,
      providers: [
        Cqrs,
        Sagas,
        ...commandHandlers,
        ...queryHandlers,
        ...sagas,
        {
          provide: COMMAND_HANDLERS_TOKEN,
          inject: commandHandlers,
          useFactory: createSourceInstances,
        },
        {
          provide: QUERY_HANDLERS_TOKEN,
          inject: queryHandlers,
          useFactory: createSourceInstances,
        },
        {
          provide: SAGAS_TOKEN,
          inject: sagas,
          useFactory: createSourceInstances,
        },
      ],
      exports: [Cqrs],
    };
  }

  constructor(
    private readonly cqrs: Cqrs,
    private readonly sagas: Sagas,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    const commandHandlers = this.moduleRef.get(COMMAND_HANDLERS_TOKEN, { strict: false });
    const queryHandlers = this.moduleRef.get(QUERY_HANDLERS_TOKEN, { strict: false });
    const sagas = this.moduleRef.get(SAGAS_TOKEN, { strict: false });

    this.cqrs._registerCommandHandlers(commandHandlers);
    this.cqrs._registerQueryHandlers(queryHandlers);
    this.sagas._registerSagas(sagas);
  }
}

export function createSourceInstances(...instances: any) {
  return instances;
}
