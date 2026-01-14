// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
