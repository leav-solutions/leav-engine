import {WithTypename} from '@leav/utils';

export const hasTypename = <T>(value: any): value is WithTypename<T> => !!value.__typename;
