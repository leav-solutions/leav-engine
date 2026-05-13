import {type IDbEvent, type IDbPayload} from '@leav/utils';

export type WritableMessage = Omit<IDbEvent, 'payload' | 'emitter'> & IDbPayload;
