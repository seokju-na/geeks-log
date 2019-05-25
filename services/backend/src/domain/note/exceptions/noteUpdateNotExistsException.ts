import DomainException from '../../seed-work/DomainException';

export default function noteUpdateNotExistsException() {
  return new DomainException('domain.note.noteUpdateNotExists');
}
