// tslint:disable-next-line:no-shadowed-variable
export type FirstParameter<T> = T extends (parameter: infer T) => any ? T : never;
