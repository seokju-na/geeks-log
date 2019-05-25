import streamIdBuilder, { generatedNoteStreamId } from './streamIdBuilder';

describe('application.utils.streamBuilder', () => {
  describe('streamIdBuilder', () => {
    test('should make stream id.', () => {
      expect(streamIdBuilder('domain')('uniqueId')).toEqual('domain-uniqueId');
    });
  });

  describe('generatedNoteStreamId', () => {
    test('should create note stream id.', () => {
      expect(generatedNoteStreamId()).toMatch(/note-.+/);
    });
  });
});
