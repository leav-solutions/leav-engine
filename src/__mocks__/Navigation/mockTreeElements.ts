import {IRecordAndChildren} from '../../queries/trees/getTreeContentQuery';

export const mockTreeElement: IRecordAndChildren = {
    record: {
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
    }
};

export const mockTreeElements: IRecordAndChildren[] = [mockTreeElement];
