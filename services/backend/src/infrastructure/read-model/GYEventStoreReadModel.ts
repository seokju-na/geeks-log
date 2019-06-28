import axios from 'axios';
import URLBuilder from '../../utility/URLBuilder';
import ReadModel, { QueryStateOptions } from './ReadModel';

interface ConstructOptions {
  apiUrl: string;
}

/**
 * Read model from Greg Young's Event Store. (https://eventstore.org)
 */
export default class GYEventStoreReadModel implements ReadModel {
  private readonly urlBuilder: URLBuilder;

  constructor({ apiUrl }: ConstructOptions) {
    this.urlBuilder = new URLBuilder(apiUrl);
  }

  async queryState<State>(name: string, { partition }: QueryStateOptions = {}): Promise<State> {
    const url = this.urlBuilder.build(`/projection/${name}`, { partition });

    const { data } = await axios.get<State>(url);

    return data;
  }
}
