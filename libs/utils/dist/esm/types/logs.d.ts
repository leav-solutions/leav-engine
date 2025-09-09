import { IDbEvent, IDbPayload } from './events';
export type Log = Omit<IDbEvent, 'payload' | 'emitter'> & IDbPayload;
