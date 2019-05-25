export default interface Repository<E> {
  findOneById(id: string | number): Promise<E | null>;

  findOneByEmail?(email: string): Promise<E | null>;
}
