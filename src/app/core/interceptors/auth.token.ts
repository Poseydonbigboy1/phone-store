import { HttpContextToken } from '@angular/common/http';

export const IS_CHECK_AUTH = new HttpContextToken<boolean>(() => false);