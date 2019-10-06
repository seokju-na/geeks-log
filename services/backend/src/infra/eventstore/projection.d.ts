declare function options(o: Options): void;
interface Options {
  //	Overrides the default resulting stream name for the outputState() transformation, which is $projections-{projection-name}-result.
  resultStreamName?: string;

  // Configures the projection to include / exclude link to events.Default: false
  $includeLinks?: boolean;
  //	When reorderEvents is turned on, this value is used to compare the total milliseconds between the first and last events in the buffer and if the value is equal or greater, the events in the buffer will be processed. The buffer is an ordered list of events.	Default: 500ms
  // Only valid for fromStreams() selector
  processingLag?: number;

  // Process events by storing a buffer of events ordered by their prepare position   (default: false)
  reorderEvents?: boolean;
}

declare interface BaseEvent {
  isJson: boolean;
  data: any;
  body: any;
  bodyRaw: string;
  sequenceNumber: number;
  metadataRaw: any;
  linkMetadataRaw: string;
  partition: string;
}

declare type EventOf<T> = BaseEvent & T;

/**
 * Selects events from the $all stream
 */
declare function fromAll(): PartitionBy & When & ForeachStream & OutputState;

/**
 * Selects events from the `$ce-{category}` stream
 */
declare function fromCategory(category: string): PartitionBy & When & OutputState & ForeachStream;

/**
 * Selects events from the {streamId} stream.
 */
declare function fromStream(streamId: string): PartitionBy & When & OutputState;

/**
 * Selects events from the streams supplied.
 */
declare function fromStreams(streams: string[]): PartitionBy & When & OutputState;

/**
 * Selects events from the $all stream that returns true for the given filter.
 */
declare function fromStreamsMatching<E = any>(filter: (e: EventOf<E>) => boolean): When;

declare type Handler<S = any, E = any> = (state: S, event: EventOf<E>) => S;

// Allows only the given events of a particular to pass through.	Provides
interface When {
  when<S>(
    handlers: {
      $init?: () => S;
      $initShared?: any;
      $any?: Handler<S>;
    } & {
      [x: string]: Handler<S>;
    },
  ): TransformBy & FilterBy & OutputTo & OutputState & DefinesStateTransform;
}

interface WhenAndDeleted {
  when<S>(
    handlers: {
      $init?: () => S;
      $initShared?: any;
      $any?: Handler<S>;
      $deleted?: Handler<S>;
    } & {
      [x: string]: Handler<S>;
    },
  ): TransformBy & FilterBy & OutputTo & OutputState & DefinesStateTransform;
}

interface DefinesStateTransform {
  // eslint-disable-next-line
  $defines_state_transform(): void;
}

/**
 * foreachStream()	Partitions the state for each of the streams provided.
 */
interface ForeachStream {
  foreachStream(): WhenAndDeleted;
}
/**
 * outputState()	If the projection maintains state, setting this option will produce a stream called $projections - { projection-name } - result with the state as the event body.Provides
 */

interface OutputState<S = any> {
  outputState(): TransformBy & FilterBy<S> & OutputTo;
}

/**
 * partitionBy(function (event))	Partitions a projection by the partition returned from the handler.Provides
 */
interface PartitionBy {
  partitionBy<E = any>(f: (event: EventOf<E>) => void): When;
}

/**
 * transformBy(function (state))	Provides the ability to transform the state of a projection by the provided handler.Provides
 */
interface TransformBy<S = any> {
  transformBy<U>(f: (state: S) => U): TransformBy<U> & FilterBy & OutputState;
}

/**
 *
 * defines a name for the output stream
 */
interface OutputTo {
  outputTo(resultStream: string, partitionResultStreamPattern: string): any; // ??????
}

/**
 * Causes projection results to be `null` for any `state` that returns a falsey value from the given predicate.
 */
interface FilterBy<S = any> {
  filterBy(predicate: (s: S) => any): TransformBy | FilterBy | OutputState | OutputTo;
}

/**
 *  Writes an event to the designated stream
 */
declare function emit(streamId: string, eventName: string, eventBody: any, metadata: any): void;

/**
 *
 * Writes a link to event to the designated stream
 */

declare function linkTo(streamId: string, event: string, metadata: any): void;
