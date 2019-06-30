import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class NoteViewerDocument extends Document {
  public render() {
    // noinspection HtmlRequiredTitleElement
    return (
      <html lang="ko-kr">
      <Head>
        <meta charSet="UTF-8"/>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover"
          key="viewport"
        />
        <meta name="author" content="Seokju Na <seokju.me@gmail.com>"/>
      </Head>
      <body>
      <Main/>
      <NextScript/>
      </body>
      </html>
    );
  }
}
