import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

declare module 'express' {
  export interface Request {
    user?: DecodedIdToken;
  }
}