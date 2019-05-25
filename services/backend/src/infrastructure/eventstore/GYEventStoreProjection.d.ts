/**
 * Sources from https://gist.github.com/sledorze/7a29c66c2143241d80341c998bb73760
 */

interface Options {
  /**
   * Overrides the default resulting stream name for the `outputState()`
   *  transformation, which is `$projections-{projection-name}-result`.
   */
  resultStreamName?: string;

  /**
   * Configures the projection to include/exclude link to events.
   * @default false
   */
  $includeLinks?: boolean;

  /**
   * When `reorderEvents` is enabled, this value is used to compare the total milliseconds between
   * the first and last events in the buffer and if the value is equal or greater, the events in
   * the buffer are processed. The buffer is an ordered list of events.
   *
   * @default 500
   */
  processingLag?: number;

  /**
   * Process events by storing a buffer of events ordered by their prepare position. Only valid for
   * `fromStreams()` selector
   *
   * @default false
   */
  reorderEvents?: boolean;
}

declare function options(options: Options): void;

// Handlers
interface HandlerEventBase {
  jsJson: boolean;
  data: object;
  body: object;
  bodyRaw: string;
  sequenceNumber: number;
  metadataRaw: string;
  linkMetadataRaw: string;
  partition: string;
  eventType: string;
}

type HandlerEvent<T> = HandlerEventBase & T;

type Handler<S, E = any> = (state: S, event: HandlerEvent<E>) => S;

/**
 * Allows only the given events of a particular to pass through the projection.
 */
interface When {
  when<S>(
    handlers: {
      $init?: () => S;
      $initShared?: any;
      $any?: Handler<S>;
    } & {
      [eventType: string]: Handler<S>;
    },
  ): any;
}

interface WhenAndDeleted {
  when<S>(
    handlers: {
      $init?: () => S;
      $initShared?: any;
      $any?: Handler<S>;
      $deleted?: Handler<S>;
    } & {
      [eventType: string]: Handler<S>;
    },
  ): TransformBy & FilterBy & OutputTo & OutputState & DefinesStateTransform;
}

interface DefinesStateTransform {
  $defines_state_transform(): void;
}

interface ForeachStream {
  foreachStream(): WhenAndDeleted;
}

/**
 * If the projection maintains state, setting this option produces a stream called
 * `$projections-{projection-name}-result` with the state as the event body.
 */
interface OutputState<S = any> {
  outputState(): TransformBy & FilterBy<S> & OutputTo;
}

interface OutputTo {
  outputTo(resultStream: string, partitionResultStreamPattern: string): any; // ??????
}

/**
 * Partitions a projection by the partition returned from the handler.
 */
interface PartitionBy {
  partitionBy<E = any>(f: (event: HandlerEvent<E>) => void): When;
}

/**
 * Provides the ability to transform the state of a projection by the provided handler.
 */
interface TransformBy<S = any> {
  transformBy<U>(transform: (state: S) => U): TransformBy<U> & FilterBy & OutputState;
}

/**
 * Causes projection results to be null for any state that returns a false value from the given
 * predicate.
 */
interface FilterBy<S = any> {
  filterBy(predicate: (state: S) => any): TransformBy & FilterBy & OutputState & OutputTo;
}

/**
 * Selects events from the $all stream
 */
declare function fromAll(): PartitionBy & When & ForeachStream & OutputState;

/**
 * Selects events from the `$ce-{category}` stream
 */
declare function fromCategory(
  category: string,
): PartitionBy & When & OutputState & ForeachStream;

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
declare function fromStreamsMatching<E = any>(filter: (e: HandlerEvent<E>) => boolean): When;

/**
 * Writes an event to the designated stream
 */
declare function emit(
  streamId: string,
  eventName: string,
  eventBody: any,
  metadata: any,
): void;

/**
 * Writes a link to event to the designated stream
 */
declare function linkTo(streamId: string, event: string, metadata: any): void;
