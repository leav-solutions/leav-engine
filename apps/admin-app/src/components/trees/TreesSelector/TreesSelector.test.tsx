// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider, wait} from '@apollo/react-testing';
import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import TreesSelector from '.';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {TreeBehavior} from '../../../_gqlTypes/globalTypes';

jest.mock('../../../hooks/useLang');

describe('TreesSelector', () => {
    test('Snapshot test', async () => {
        const mocks = [
            {
                request: {
                    query: getTreesQuery
                },
                result: {
                    data: {
                        trees: {
                            __typename: 'TreesList',
                            totalCount: 1,
                            list: [
                                {
                                    __typename: 'Tree',
                                    id: 'test_tree',
                                    system: false,
                                    label: {
                                        en: 'TestTree',
                                        fr: 'TestTree'
                                    },
                                    behavior: TreeBehavior.standard,
                                    libraries: [{id: 'test_lib', label: {fr: 'My Lib'}, __typename: 'Library'}]
                                }
                            ]
                        }
                    }
                }
            }
        ];

        let comp;
        await act(async () => {
            comp = mount(
                <MockedProvider mocks={mocks} addTypename>
                    <TreesSelector />
                </MockedProvider>
            );
            await wait(0);
            comp.update();
        });

        expect(comp.find('TreesSelectorField')).toHaveLength(1);
        expect(comp.find('TreesSelectorField').prop('trees')).toHaveLength(1);
        expect(comp.contains('TestTree')).toBe(true);
    });
});
