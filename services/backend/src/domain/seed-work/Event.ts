export default interface Event {
  type: string;
  payload: any;
}

type ConvertObjectToUnion<Obj extends object> = Obj[keyof Obj];
export type UnionEvents<Events> = ConvertObjectToUnion<{
  [P in keyof Events]: Event;
}>;
