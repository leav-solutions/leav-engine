// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordAndChildren, IRecordField} from '../../queries/trees/getTreeContentQuery';

export const mockTreeRecord: IRecordField = {
    whoAmI: {
        id: 'id',
        color: 'color',
        label: 'label',
        preview: {
            small: 'preview',
            medium: 'preview',
            big: 'preview',
            pages: 'preview'
        },
        library: {
            id: 'library-id',
            label: {
                fr: 'library-label',
                en: 'library-label'
            }
        }
    }
};

export const mockTreeElement: IRecordAndChildren = {
    record: {
        ...mockTreeRecord
    }
};

export const mockTreeElements: IRecordAndChildren[] = [mockTreeElement];
