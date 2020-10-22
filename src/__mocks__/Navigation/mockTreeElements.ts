import {IRecordAndChildren, IRecordField} from '../../queries/trees/getTreeContentQuery';

export const mockTreeRecord: IRecordField = {
    whoAmI: {
        id: 'id',
        color: 'color',
        label: {
            fr: 'label',
            en: 'label'
        },
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
