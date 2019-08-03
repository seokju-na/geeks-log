export interface DomainEvent<Payload = any> {
  type: string;
  payload: Payload;
}
