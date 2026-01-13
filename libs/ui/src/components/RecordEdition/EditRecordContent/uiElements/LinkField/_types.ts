import {type IFormLinkFieldSettings} from '@leav/utils';
import {type IFormElementProps} from '../../_types';

export type LinkFieldProps = IFormElementProps<
    IFormLinkFieldSettings & {
        columns?: Array<{
            id: string;
            label: Record<string, string>;
        }>;
    }
>;
