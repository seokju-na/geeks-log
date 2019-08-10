import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import {
  COMMAND_HANDLER_METADATA_TOKEN,
  QUERY_HANDLER_METADATA_TOKEN,
  SAGA_METADATA_TOKEN,
} from './constants';
import { ICommandHandler, IQueryHandler } from './interfaces';

@Injectable()
export class ExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer) {
  }

  explore() {
    const modules = [...this.modulesContainer.values()];
    const commands = this.flatMap<ICommandHandler>(modules, instance =>
      this.filterProvider(instance, COMMAND_HANDLER_METADATA_TOKEN),
    );
    const queries = this.flatMap<IQueryHandler>(modules, instance =>
      this.filterProvider(instance, QUERY_HANDLER_METADATA_TOKEN),
    );
    const sagas = this.flatMap(modules, instance =>
      this.filterProvider(instance, SAGA_METADATA_TOKEN),
    );

    return { commands, queries, sagas };
  }

  flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => Type<any> | undefined,
  ): Type<T>[] {
    const items = modules
      .map(module => [...module.providers.values()].map(callback))
      .reduce((a, b) => a.concat(b), []);
    return items.filter(element => !!element) as Type<T>[];
  }

  filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    return this.extractMetadata(instance, metadataKey);
  }

  extractMetadata(instance: object, metadataKey: string): Type<any> {
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    return metadata ? (instance.constructor as Type<any>) : undefined;
  }
}
