import { UnionEvents } from './Event';

type Reducer<State, Events> = (
  events: UnionEvents<Events>[],
  initialState?: State,
) => State;

export default Reducer;
