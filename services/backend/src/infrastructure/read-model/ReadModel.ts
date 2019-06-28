export interface QueryStateOptions {
  partition?: string;
}

export default interface ReadModel {
  queryState<State>(name: string, options?: QueryStateOptions): State | Promise<State>;
}
