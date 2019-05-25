export type Validator<Type> = (value: unknown) => value is Type;
