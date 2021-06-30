// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render} from 'enzyme';
import React from 'react';
import {getLibraryDetailQuery} from '../../graphQL/queries/libraries/getLibraryDetailQuery';
import {AttributeType} from '../../_gqlTypes/globalTypes';
import {AttributeFormat} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import TreesSelectionList from './TreesSelectionList';

describe('TreesSelectionList', () => {
    test('Should render', () => {
        //TODO write better tests when UI refactoring is done
        const mocks = [
            {
                request: {
                    query: getLibraryDetailQuery,
                    variables: {
                        libId: 'test_lib'
                    }
                },
                result: {
                    data: {
                        libraries: {
                            __typename: 'LibrariesList',
                            list: [
                                {
                                    __typename: 'Library',
                                    id: 'test_lib',
                                    system: false,
                                    label: {},
                                    attributes: {
                                        __typename: 'Attribute',
                                        id: 'string',
                                        type: AttributeType.simple,
                                        format: AttributeFormat.text,
                                        label: {fr: 'test attribute'}
                                    },
                                    linkedTrees: [
                                        {
                                            id: 'tree1',
                                            label: 'tree1'
                                        },
                                        {
                                            id: 'tree2',
                                            label: 'tree2'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const comp = render(
            <MockedProviderWithFragments mocks={mocks}>
                <TreesSelectionList selectedTrees={[]} library="test_lib" onSelectionChange={jest.fn()} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
