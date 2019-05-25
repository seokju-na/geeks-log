import DomainException from '../../seed-work/DomainException';

export default function noteAuthorMismatchException() {
  return new DomainException('domain.note.noteAuthorMismatch');
}
