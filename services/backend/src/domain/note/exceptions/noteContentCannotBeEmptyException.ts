import DomainException from '../../seed-work/DomainException';

export default function noteContentCannotBeEmptyException() {
  return new DomainException('domain.note.noteContentCannotBeEmpty');
}
