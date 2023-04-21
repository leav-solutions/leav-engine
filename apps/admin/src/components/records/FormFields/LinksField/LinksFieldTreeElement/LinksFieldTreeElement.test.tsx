// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {ITreeLinkValue} from '../../../../../_types/records';
import LinksFieldTreeElement from './LinksFieldTreeElement';

jest.mock(
    '../../../../shared/TreeNodeBreadcrumb',
    () =>
        function TreeNodeBreadcrumb() {
            return <div>TreeNodeBreadcrumb</div>;
        }
);

jest.mock(
    '../../../EditRecordModal',
    () =>
        function EditRecordModal() {
            return <div>EditRecordModal</div>;
        }
);

describe('EditRecordFormLinksTreeElement', () => {
    const value: ITreeLinkValue = {
        id_value: '98765',
        treeValue: {
            id: '1',
            record: {
                whoAmI: {
                    id: '1',
                    library: {
                        id: 'test_lib',
                        label: {
                            fr: 'Test Lib'
                        }
                    },
                    label: 'TestLabel',
                    color: null,
                    preview: null
                }
            },
            ancestors: [
                {
                    id: '2',
                    record: {
                        whoAmI: {
                            id: '2',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel2',
                            color: null,
                            preview: null
                        }
                    }
                },
                {
                    id: '1',
                    record: {
                        whoAmI: {
                            id: '1',
                            library: {
                                id: 'test_lib',
                                label: {
                                    fr: 'Test Lib'
                                }
                            },
                            label: 'TestLabel',
                            color: null,
                            preview: null
                        }
                    }
                }
            ]
        },
        modified_at: 1234567890,
        created_at: 1234567890,
        version: null
    };

    test('Display value and its ancestors', async () => {
        const onDelete = jest.fn();
        const comp = shallow(<LinksFieldTreeElement value={value} onDeleteLink={onDelete} />);

        expect(comp.find('TreeNodeBreadcrumb')).toHaveLength(1);
    });
});
