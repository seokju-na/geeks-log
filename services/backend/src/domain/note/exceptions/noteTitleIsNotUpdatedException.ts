import DomainException from '../../seed-work/DomainException';

export default function noteTitleIsNotUpdatedException() {
  return new DomainException('domain.note.noteTitleIsNotUpdated');
}
