import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { isCommand } from 'domain/core';
import { from, Observable, Subject, Subscription } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { Cqrs } from './cqrs';
import { InvalidSagaError } from './internal-errors';
import { Saga, SagaOptions } from './interfaces';
import { SAGA_METADATA_TOKEN } from './tokens';

interface SagaWithOptions {
  saga: Saga<any>;
  options: SagaOptions;
}

@Injectable()
export class Sagas implements OnModuleDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly _sagaErrors = new Subject<Error | any>();

  constructor(private readonly cqrs: Cqrs) {}

  get sagaErrors() {
    return this._sagaErrors.asObservable();
  }

  onModuleDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  _registerSagas(instances: object[] = []) {
    const sagas = instances
      .map(instance => this.reflectMetadataWithSaga(instance))
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach(s => this.registerSaga(s));
  }

  private registerSaga({ saga, options }: SagaWithOptions) {
    if (typeof saga !== 'function') {
      throw new InvalidSagaError();
    }

    const events = this.cqrs.events.pipe(concatMap(e => from(e)));
    const stream = saga(events);

    if (!(stream instanceof Observable)) {
      throw new InvalidSagaError();
    }

    const subscription = stream.pipe(filter(isCommand)).subscribe(command => {
      if (options && options.dispatch) {
        this.cqrs.executeCommand(command).catch(error => {
          this._sagaErrors.next(error);
        });
      }
    });

    this.subscriptions.push(subscription);
  }

  private reflectMetadataWithSaga(instance: object): SagaWithOptions[] {
    if (!instance) {
      throw new InvalidSagaError();
    }

    const handlers: SagaWithOptions[] = [];

    for (const [, handler] of Object.entries(instance)) {
      if (typeof handler === 'function' && handler.hasOwnProperty(SAGA_METADATA_TOKEN)) {
        handlers.push({
          saga: handler.bind(instance) as Saga<any>,
          options: handler[SAGA_METADATA_TOKEN] as SagaOptions,
        });
      }
    }

    return handlers;
  }
}
