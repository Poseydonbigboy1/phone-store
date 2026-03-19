import { Nullable } from './t-nullable';

export class ResponseObject<T> {
  isSuccess: boolean = false;
  message?: Nullable<string> = '';
  data: Nullable<T> = null;
}
