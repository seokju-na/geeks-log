import { URL } from 'url';

export default class URLBuilder {
  constructor(private readonly baseUrl: string) {
  }

  build(path: string, searchParams: { [key: string]: unknown } = {}): string {
    const url = new URL(path, this.baseUrl);

    Object.keys(searchParams).forEach((key) => {
      const value = searchParams[key];

      if (typeof value === 'string') {
        url.searchParams.append(key, value);
      } else if (typeof value === 'number') {
        url.searchParams.append(key, `${value}`);
      }
    });

    return url.href;
  }
}

