import {type GlobalMeta} from 'zod';

export type ZodMetaUISchema = GlobalMeta & {
    ui?: {
        title?: string;
        placeholder?: string;
    };
};
