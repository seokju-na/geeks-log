import { Observable } from 'rxjs';

export default function toPromise<T = any>(observable: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    observable.subscribe(
      result => resolve(result),
      error => reject(error),
    );
  });
}
