import generateUniqueId from '../../domain/shared/utils/generateUniqueId';

const streamIdBuilder = (domain: string) => (uniqueId: string) => `${domain}-${uniqueId}`;
export default streamIdBuilder;

export const noteStreamIdBuilder = streamIdBuilder('note');
export const generatedNoteStreamId = () => noteStreamIdBuilder(generateUniqueId());
