// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {IRecordAndChildren} from '../../../graphQL/queries/trees/getTreeContentQuery';
import {INavigationPath} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import ColumnFromPath from './ColumnFromPath';

jest.mock(
    '../../CellNavigation',
    () =>
        function CellNavigation() {
            return <div>CellNavigation</div>;
        }
);

describe('ColumnFromPath', () => {
    const mockTreeElements: IRecordAndChildren[] = [
        {
            record: {
                id: 'recordId',
                whoAmI: {
                    id: 'recordId',
                    label: 'recordLabel',
                    color: null,
                    preview: null,
                    library: {
                        id: 'recordLibraryId',
                        label: {
                            fr: 'recordLibraryLabel',
                            en: 'recordLibraryLabel'
                        },
                        gqlNames: {
                            type: 'RecordLibraryId',
                            query: 'RecordLibraryId'
                        }
                    }
                }
            },
            children: [
                {
                    record: {
                        id: 'childRecordId',
                        whoAmI: {
                            id: 'childRecordId',
                            label: 'childRecordLabel',
                            preview: null,
                            color: null,
                            library: {
                                id: 'childRecordLibraryId',
                                label: {
                                    fr: 'childRecordLibraryLabel',
                                    en: 'childRecordLibraryLabel'
                                },
                                gqlNames: {
                                    type: 'ShildRecordLibraryId',
                                    query: 'childRecordLibraryId'
                                }
                            }
                        }
                    }
                },
                {
                    record: {
                        id: 'secondChildRecordId',
                        whoAmI: {
                            id: 'secondChildRecordId',
                            label: 'secondChildRecordLabel',
                            preview: null,
                            color: null,
                            library: {
                                id: 'secondChildRecordLibraryId',
                                label: {
                                    fr: 'secondChildRecordLibraryLabel',
                                    en: 'secondChildRecordLibraryLabel'
                                },
                                gqlNames: {
                                    type: 'SecondChildRecordLibraryId',
                                    query: 'secondChildRecordLibraryId'
                                }
                            }
                        }
                    }
                }
            ]
        }
    ];

    const mockPathPart: INavigationPath = {
        id: 'recordId',
        library: 'recordLibraryId'
    };

    test('should show loading', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <ColumnFromPath
                            treeElements={mockTreeElements}
                            pathPart={mockPathPart}
                            depth={0}
                            showLoading
                            columnActive={false}
                        />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('Spin')).toHaveLength(1);
    });

    test('should call CellNavigation for each child', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <MockStore>
                        <ColumnFromPath
                            treeElements={mockTreeElements}
                            pathPart={mockPathPart}
                            depth={0}
                            showLoading={false}
                            columnActive={false}
                        />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('CellNavigation')).toHaveLength(2);
    });
});
