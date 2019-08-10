import { Injectable, OnModuleDestroy, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { from, Observable, Subject, Subscription } from 'rxjs';
import { concatMap, filter } from 'rxjs/operators';
import { isCommand } from '../../domain/core';
import { SAGA_METADATA_TOKEN } from './constants';
import { Cqrs } from './cqrs';
import { InvalidSagaError } from './errors';
import { ISaga, SagaMetadata } from './interfaces';

type WithSaga = SagaMetadata & { saga: ISaga };

@Injectable()
export class Sagas implements OnModuleDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly _sagaErrors = new Subject<Error | any>();

  constructor(
    private readonly cqrs: Cqrs,
    private readonly moduleRef: ModuleRef,
  ) {
  }

  get sagaErrors() {
    return this._sagaErrors.asObservable();
  }

  onModuleDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  _registerSagas(types: Type<any>[] = []) {
    const sagas = types
      .map(target => this.reflectMetadataWithSaga(target))
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach(s => this.registerSaga(s));
  }

  private registerSaga({ saga, options }: WithSaga) {
    if (typeof saga !== 'function') {
      throw new InvalidSagaError();
    }

    const events = this.cqrs.events.pipe(
      concatMap(e => from(e)),
    );

    const stream = saga(events);
    if (!(stream instanceof Observable)) {
      throw new InvalidSagaError();
    }

    const subscription = stream
      .pipe(filter(c => isCommand(c)))
      .subscribe(command => {
        if (options && options.dispatchCommand) {
          this.cqrs.executeCommand(command).catch((error) => {
            this._sagaErrors.next(error);
          });
        }
      });

    this.subscriptions.push(subscription);
  }

  private reflectMetadataWithSaga(target: Type<any>): WithSaga[] {
    const metadata: SagaMetadata[] =
      Reflect.getMetadata(SAGA_METADATA_TOKEN, target) || [];
    const instance = this.moduleRef.get(target, { strict: false });

    if (!instance) {
      throw new InvalidSagaError();
    }

    return metadata.map(m => ({
      ...m,
      saga: instance[m.propertyKey] as ISaga,
    }));
  }
}
