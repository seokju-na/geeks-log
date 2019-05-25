import Event from '../../seed-work/Event';

export default interface NoteTitleUpdatedEvent extends Event {
  type: 'NoteTitleUpdated';
  payload: {
    title: string;
  };
}
