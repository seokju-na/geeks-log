import { Module } from '@nestjs/common';
import NoteViewerServingSaga from './NoteViewerServingSaga';

@Module({
  providers: [
    NoteViewerServingSaga,
  ],
})
export default class SagasModule {
}
