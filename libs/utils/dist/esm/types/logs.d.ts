import { IDbEvent, IDbPayload } from './events';
export declare type Log = Omit<IDbEvent, 'payload' | 'emitter'> & IDbPayload;
