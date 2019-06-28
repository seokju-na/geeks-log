import Event from '../../seed-work/Event';

export default interface UserLoggedInEvent extends Event {
  type: 'UserLoggedIn';
  payload: {
    timestamp: number;
    userAgent: string;
  };
}
